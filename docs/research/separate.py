#!/usr/bin/env python3
"""
Woodblock color separation using the Taohuawu method.
K-means++ clustering + Canny edge detection → clean color plates.

Usage:
  python separate.py INPUT_IMAGE OUTPUT_DIR [--plates N] [--dust PIXELS]

Each plate is saved as a binary PNG (black=raised/prints, white=carved).
A composite preview and SVG for each plate are also generated.
"""
import argparse
import numpy as np
from PIL import Image
from sklearn.cluster import KMeans
from skimage.feature import canny
from skimage.color import rgb2gray
from skimage.measure import find_contours, approximate_polygon
from scipy.ndimage import label, binary_dilation
import os


def separate(input_path, output_dir, n_plates=3, dust_threshold=20, use_edges=True):
    os.makedirs(output_dir, exist_ok=True)

    img = Image.open(input_path).convert("RGB")
    arr = np.array(img)
    h, w = arr.shape[:2]

    print(f"Image: {w}x{h}")

    # Step 1: Canny edge detection on original (preserves fine detail)
    if use_edges:
        print("Detecting edges...")
        gray = rgb2gray(arr)
        edges = canny(gray, sigma=1.5, low_threshold=0.05, high_threshold=0.15)
        edges = binary_dilation(edges, iterations=1)
    else:
        print("Edges disabled — pure color clustering")
        edges = np.zeros((h, w), dtype=bool)

    # Step 2: K-means++ on content pixels (exclude white paper + black border)
    brightness = arr.mean(axis=2)
    is_content = (brightness > 30) & (brightness < 235)

    content_px = arr[is_content].astype(np.float32)
    step = max(1, len(content_px) // 100000)
    sample = content_px[::step]

    print(f"Clustering into {n_plates} plates...")
    kmeans = KMeans(n_clusters=n_plates, init="k-means++", random_state=42, n_init=10)
    kmeans.fit(sample)
    palette = kmeans.cluster_centers_

    # Assign all pixels
    flat = arr.reshape(-1, 3).astype(np.float32)
    dists = np.zeros((len(flat), n_plates), dtype=np.float32)
    for i, center in enumerate(kmeans.cluster_centers_):
        dists[:, i] = np.sum((flat - center) ** 2, axis=1)
    pixel_labels = np.argmin(dists, axis=1).reshape(h, w)
    pixel_labels[~is_content] = n_plates  # paper

    # Step 3: Assign edge pixels to darkest adjacent plate
    print("Assigning edges to plates...")
    ey, ex = np.where(edges)
    for y, x in zip(ey, ex):
        y0, y1 = max(0, y - 2), min(h, y + 3)
        x0, x1 = max(0, x - 2), min(w, x + 3)
        nbr = pixel_labels[y0:y1, x0:x1]
        plates = np.unique(nbr)
        plates = plates[plates < n_plates]
        if len(plates) > 0:
            darkest = min(plates, key=lambda p: palette[p].mean())
            pixel_labels[y, x] = darkest

    # Step 4: Extract plates
    brightness_order = np.argsort([c.mean() for c in palette])
    results = []

    for rank, idx in enumerate(brightness_order):
        c = palette[idx]
        mask = pixel_labels == idx

        # Remove micro dust
        labeled_arr, num = label(mask)
        for j in range(1, num + 1):
            if np.sum(labeled_arr == j) < dust_threshold:
                mask[labeled_arr == j] = False

        coverage = np.sum(mask) / mask.size * 100
        name = f"plate{rank + 1}"

        # Save binary PNG
        binary = np.where(mask, 0, 255).astype(np.uint8)
        png_path = os.path.join(output_dir, f"{name}.png")
        Image.fromarray(binary).save(png_path)

        print(f"  {name}: RGB({int(c[0])},{int(c[1])},{int(c[2])}) {coverage:.1f}%")
        results.append((idx, name, mask))

    # Composite preview
    comp = np.ones((h, w, 3), dtype=np.uint8) * 255
    for idx, name, mask in results:
        comp[mask] = palette[idx].astype(np.uint8)
    Image.fromarray(comp).save(os.path.join(output_dir, "composite.png"))

    paper_pct = np.sum(pixel_labels == n_plates) / pixel_labels.size * 100
    print(f"  paper: {paper_pct:.1f}%")
    print(f"\nAll files saved to {output_dir}")


def mask_to_svg(mask, filepath, width, height, tolerance=1.0):
    contours = find_contours(mask.astype(float), 0.5)
    paths = []
    for contour in contours:
        if len(contour) < 4:
            continue
        simplified = approximate_polygon(contour, tolerance=tolerance)
        if len(simplified) < 3:
            continue
        d = f"M {simplified[0][1]:.1f},{simplified[0][0]:.1f}"
        for pt in simplified[1:]:
            d += f" L {pt[1]:.1f},{pt[0]:.1f}"
        d += " Z"
        paths.append(d)

    svg = f'<?xml version="1.0" encoding="UTF-8"?>\n'
    svg += f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">\n'
    for d in paths:
        svg += f'  <path d="{d}" fill="black" stroke="none"/>\n'
    svg += "</svg>\n"
    with open(filepath, "w") as f:
        f.write(svg)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Woodblock color separation")
    parser.add_argument("input", help="Input image path")
    parser.add_argument("output", help="Output directory")
    parser.add_argument("--plates", type=int, default=3, help="Number of color plates (default: 3)")
    parser.add_argument("--dust", type=int, default=20, help="Min island size in pixels (default: 20)")
    parser.add_argument("--no-edges", action="store_true", help="Disable Canny edge detection (for images that are already line-heavy)")
    args = parser.parse_args()
    separate(args.input, args.output, n_plates=args.plates, dust_threshold=args.dust, use_edges=not args.no_edges)
