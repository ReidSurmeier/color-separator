#!/usr/bin/env python3
"""
Woodblock color separation V3 — full Taohuawu paper method.

Based on:
- MDPI 2025: "Digital Restoration of Taohuawu Woodblock New Year Prints" (2076-3417/15/16/9081)
- "Color decomposition for reproducing multi-color woodblock prints" (ResearchGate)
- "Forty years of color quantization" survey (Springer 2023)

Key improvements over V2:
1. Extract outline/key block FIRST via Canny edge detection (plate0)
2. Weighted CIELAB clustering with spatial coordinates (5D feature vector)
3. Preprocessing: auto white balance, CLAHE, saturation boost
4. Color dominance pre-analysis for auto-K suggestion
5. Better morphological cleanup (larger filters, disk(2))
"""
import argparse
import io
import json
import os
import zipfile

import cv2
import numpy as np
from PIL import Image, ImageFilter
from scipy.ndimage import median_filter, binary_erosion, binary_dilation, binary_fill_holes
from skimage.color import rgb2lab, lab2rgb
from skimage.feature import canny
from skimage.measure import find_contours, approximate_polygon
from skimage.morphology import remove_small_objects, remove_small_holes, disk
from sklearn.cluster import KMeans


def preprocess(arr):
    """
    Preprocessing pipeline: auto white balance, CLAHE, saturation boost.
    Restores faded/scanned image colors before clustering.
    """
    arr_float = arr.astype(np.float64)

    # 1. Auto white balance — gray world algorithm
    mean_b, mean_g, mean_r = arr_float[:, :, 0].mean(), arr_float[:, :, 1].mean(), arr_float[:, :, 2].mean()
    gray_mean = (mean_b + mean_g + mean_r) / 3.0
    if mean_b > 0 and mean_g > 0 and mean_r > 0:
        arr_float[:, :, 0] *= gray_mean / mean_b
        arr_float[:, :, 1] *= gray_mean / mean_g
        arr_float[:, :, 2] *= gray_mean / mean_r
    arr_balanced = np.clip(arr_float, 0, 255).astype(np.uint8)

    # 2. CLAHE on L channel in LAB space
    lab = cv2.cvtColor(arr_balanced, cv2.COLOR_RGB2LAB)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    lab[:, :, 0] = clahe.apply(lab[:, :, 0])

    # 3. Mild saturation boost (1.2x on a*/b* channels)
    lab_float = lab.astype(np.float64)
    lab_float[:, :, 1] = (lab_float[:, :, 1] - 128) * 1.2 + 128
    lab_float[:, :, 2] = (lab_float[:, :, 2] - 128) * 1.2 + 128
    lab = np.clip(lab_float, 0, 255).astype(np.uint8)

    return cv2.cvtColor(lab, cv2.COLOR_LAB2RGB)


def extract_key_block(arr, sigma=1.5):
    """
    Extract outline/key block via Canny edge detection.
    Returns binary mask of edge pixels (True = edge).
    """
    gray = cv2.cvtColor(arr, cv2.COLOR_RGB2GRAY)
    # Canny with automatic thresholds based on median
    median_val = np.median(gray)
    low = int(max(0, 0.66 * median_val))
    high = int(min(255, 1.33 * median_val))
    edges = cv2.Canny(gray, low, high, apertureSize=3)
    # Dilate edges slightly to capture full ink width
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
    edges = cv2.dilate(edges, kernel, iterations=1)
    return edges > 0


def auto_k_suggestion(arr):
    """
    Color dominance pre-analysis for auto K suggestion.
    Returns K_min — minimum suggested number of plates.
    """
    # Build 16x16x16 RGB histogram
    quantized = (arr.astype(np.float64) / 16).astype(np.uint8)
    h, w = arr.shape[:2]
    total_pixels = h * w

    # Flatten to color indices
    color_indices = quantized[:, :, 0].astype(np.int32) * 256 + quantized[:, :, 1].astype(np.int32) * 16 + quantized[:, :, 2].astype(np.int32)
    unique, counts = np.unique(color_indices, return_counts=True)

    # Filter colors with >1% area coverage
    threshold_1pct = total_pixels * 0.01
    significant = unique[counts > threshold_1pct]
    significant_counts = counts[counts > threshold_1pct]

    if len(significant) == 0:
        return 3

    # Decode back to RGB centers
    colors = np.zeros((len(significant), 3), dtype=np.float64)
    colors[:, 0] = (significant // 256) * 16 + 8
    colors[:, 1] = ((significant % 256) // 16) * 16 + 8
    colors[:, 2] = (significant % 16) * 16 + 8

    # Merge similar colors (Euclidean distance < 20)
    merged = [colors[0]]
    merged_counts = [significant_counts[0]]
    for i in range(1, len(colors)):
        distances = np.sqrt(np.sum((np.array(merged) - colors[i]) ** 2, axis=1))
        if distances.min() < 20:
            # Merge with nearest
            nearest = distances.argmin()
            merged_counts[nearest] += significant_counts[i]
        else:
            merged.append(colors[i])
            merged_counts.append(significant_counts[i])

    # Re-filter at 2% threshold
    threshold_2pct = total_pixels * 0.02
    k_min = sum(1 for c in merged_counts if c > threshold_2pct)

    return max(2, k_min)


def separate(input_path_or_array, output_dir=None, n_plates=4, dust_threshold=50,
             use_edges=True, edge_sigma=1.5, locked_colors=None, return_data=False):
    """
    V3 separation function — full Taohuawu paper method.

    Args:
        input_path_or_array: filepath string or numpy RGB array
        output_dir: where to save (None if return_data=True)
        n_plates: number of color plates (including key block if use_edges)
        dust_threshold: minimum island size in pixels
        use_edges: whether to extract key block first
        edge_sigma: Canny sigma parameter
        locked_colors: list of [R,G,B] colors to lock as centroids
        return_data: if True, return dict instead of writing files
    """
    # Load image
    if isinstance(input_path_or_array, str):
        img = Image.open(input_path_or_array).convert("RGB")
        arr = np.array(img)
    else:
        arr = input_path_or_array
        img = Image.fromarray(arr)

    h, w = arr.shape[:2]

    if output_dir:
        os.makedirs(output_dir, exist_ok=True)

    # ── Step 1: Preprocessing ──
    arr_preprocessed = preprocess(arr)

    # Light median filter for noise reduction
    pil_filtered = Image.fromarray(arr_preprocessed).filter(ImageFilter.MedianFilter(size=3))
    arr_clean = np.array(pil_filtered)

    # ── Step 2: Extract key block (outline plate) FIRST ──
    key_block_mask = None
    n_color_plates = n_plates
    if use_edges:
        key_block_mask = extract_key_block(arr_clean, sigma=edge_sigma)
        n_color_plates = n_plates - 1  # one plate reserved for key block
        if n_color_plates < 1:
            n_color_plates = 1

    # ── Step 3: Convert to CIELAB ──
    arr_float = arr_clean.astype(np.float64) / 255.0
    lab_img = rgb2lab(arr_float)

    # ── Step 4: Content masking ──
    L_channel = lab_img[:, :, 0]
    is_content = (L_channel > 8) & (L_channel < 95)

    # Remove edge pixels from clustering input (paper's core insight)
    if key_block_mask is not None:
        is_content = is_content & (~key_block_mask)

    # ── Step 5: Build 5D weighted feature vector ──
    # [L*5.0, a*1.5*5.0, b*1.5*5.0, x_norm*0.3, y_norm*0.3]
    yy, xx = np.mgrid[0:h, 0:w]
    x_norm = xx.astype(np.float64) / w
    y_norm = yy.astype(np.float64) / h

    color_weight = 5.0
    chroma_weight = 1.5
    spatial_weight = 0.3

    features = np.zeros((h, w, 5), dtype=np.float64)
    features[:, :, 0] = lab_img[:, :, 0] * color_weight           # L
    features[:, :, 1] = lab_img[:, :, 1] * chroma_weight * color_weight  # a*
    features[:, :, 2] = lab_img[:, :, 2] * chroma_weight * color_weight  # b*
    features[:, :, 3] = x_norm * spatial_weight                    # x
    features[:, :, 4] = y_norm * spatial_weight                    # y

    content_pixels = features[is_content]

    # Subsample for speed
    max_samples = 150000
    rng = np.random.RandomState(42)
    if len(content_pixels) > max_samples:
        indices = rng.choice(len(content_pixels), max_samples, replace=False)
        sample = content_pixels[indices]
    else:
        sample = content_pixels

    # ── Step 6: K-means++ clustering ──
    init = "k-means++"
    if locked_colors and len(locked_colors) > 0:
        locked_rgb = np.array(locked_colors, dtype=np.float64).reshape(-1, 1, 3) / 255.0
        locked_lab = rgb2lab(locked_rgb).reshape(-1, 3)
        # Expand locked colors to 5D (use image center as spatial coords)
        locked_5d = np.zeros((len(locked_lab), 5), dtype=np.float64)
        locked_5d[:, 0] = locked_lab[:, 0] * color_weight
        locked_5d[:, 1] = locked_lab[:, 1] * chroma_weight * color_weight
        locked_5d[:, 2] = locked_lab[:, 2] * chroma_weight * color_weight
        locked_5d[:, 3] = 0.5 * spatial_weight  # center x
        locked_5d[:, 4] = 0.5 * spatial_weight  # center y

        if len(locked_5d) == n_color_plates:
            init = locked_5d
        elif len(locked_5d) < n_color_plates:
            remaining = n_color_plates - len(locked_5d)
            random_indices = rng.choice(len(sample), remaining, replace=False)
            extra_centroids = sample[random_indices]
            init = np.vstack([locked_5d, extra_centroids])
        else:
            init = locked_5d[:n_color_plates]

    if n_color_plates > 0 and len(sample) > 0:
        kmeans = KMeans(
            n_clusters=n_color_plates,
            init=init,
            random_state=42,
            n_init=10 if isinstance(init, str) else 1,
            max_iter=300,
            tol=1e-4,
        )
        kmeans.fit(sample)

        # Extract LAB palette from centroids (first 3 dims, undo weighting)
        centers = kmeans.cluster_centers_
        palette_lab = np.zeros((n_color_plates, 3), dtype=np.float64)
        palette_lab[:, 0] = centers[:, 0] / color_weight
        palette_lab[:, 1] = centers[:, 1] / (chroma_weight * color_weight)
        palette_lab[:, 2] = centers[:, 2] / (chroma_weight * color_weight)

        palette_rgb_float = lab2rgb(palette_lab.reshape(-1, 1, 3)).reshape(-1, 3)
        palette_rgb = np.clip(palette_rgb_float * 255, 0, 255).astype(np.uint8)

        # ── Step 7: Assign pixels to clusters ──
        features_flat = features.reshape(-1, 5)
        dists = np.zeros((len(features_flat), n_color_plates), dtype=np.float64)
        for i, center in enumerate(kmeans.cluster_centers_):
            diff = features_flat - center
            dists[:, i] = np.sum(diff ** 2, axis=1)

        pixel_labels = np.argmin(dists, axis=1).reshape(h, w)
    else:
        palette_lab = np.zeros((0, 3))
        palette_rgb = np.zeros((0, 3), dtype=np.uint8)
        pixel_labels = np.zeros((h, w), dtype=np.int32)

    # Background label
    bg_label = n_color_plates
    pixel_labels[~is_content & (key_block_mask if key_block_mask is not None else np.zeros((h, w), dtype=bool) == False)] = bg_label
    # Key block pixels get their own special label
    key_label = n_color_plates + 1
    if key_block_mask is not None:
        pixel_labels[key_block_mask] = key_label

    # Non-content, non-edge pixels are background
    non_content_no_edge = ~is_content
    if key_block_mask is not None:
        non_content_no_edge = non_content_no_edge & (~key_block_mask)
    pixel_labels[non_content_no_edge] = bg_label

    # ── Step 8: Label map cleanup ──
    # Median filter size 7 (paper recommendation)
    # Preserve key block and background labels
    color_mask = (pixel_labels < n_color_plates)
    if color_mask.any():
        temp_labels = pixel_labels.copy()
        temp_labels_filtered = median_filter(temp_labels.astype(np.int32), size=7)
        # Only apply median to color-assigned pixels
        pixel_labels[color_mask] = temp_labels_filtered[color_mask]
        # Ensure we don't overwrite special labels
        if key_block_mask is not None:
            pixel_labels[key_block_mask] = key_label
        pixel_labels[non_content_no_edge] = bg_label

    # ── Step 9: Extract and clean individual plates ──
    results = []
    plate_images = {}

    # Key block plate (plate0) — always first/darkest
    if key_block_mask is not None:
        mask = key_block_mask.copy()
        mask = remove_small_objects(mask, max_size=100)
        mask = remove_small_holes(mask, max_size=200)
        selem = disk(2)
        mask = binary_dilation(mask, selem)
        mask = binary_erosion(mask, selem)

        coverage = np.sum(mask) / mask.size * 100
        name = "plate0"
        binary_img = np.where(mask, 0, 255).astype(np.uint8)
        plate_img = Image.fromarray(binary_img)

        plate_info = {
            "name": name,
            "index": -1,
            "rank": 0,
            "color": [0, 0, 0],
            "color_hex": "#000000",
            "coverage_pct": round(coverage, 2),
            "is_key_block": True,
        }
        results.append(plate_info)
        plate_images[name] = {"mask": mask, "binary": binary_img, "image": plate_img}

    # Color plates — ordered darkest to lightest
    if n_color_plates > 0 and len(palette_lab) > 0:
        brightness_order = np.argsort([c[0] for c in palette_lab])

        for rank_offset, idx in enumerate(brightness_order):
            mask = pixel_labels == idx

            # Aggressive hole filling first — no white punch-through within plates
            mask = remove_small_holes(mask, max_size=2000)
            mask = binary_fill_holes(mask)  # fill ALL holes regardless of size
            
            # Remove small noise islands
            mask = remove_small_objects(mask, max_size=100)
            
            # Dilate color plates generously to bleed UNDER the key block
            # This eliminates white halos between outlines and color fills
            # In real woodblock printing, color extends under the key lines (kento overlap)
            selem = disk(6)
            mask = binary_dilation(mask, selem)
            # Moderate erosion to prevent excessive bleed into adjacent plates
            # Net effect: +4px expansion to fill gaps under key block
            selem_small = disk(2)
            mask = binary_erosion(mask, selem_small)

            coverage = np.sum(mask) / mask.size * 100
            rgb = palette_rgb[idx]
            rank = rank_offset + (1 if key_block_mask is not None else 0)
            name = f"plate{rank + (0 if key_block_mask is not None else 1)}"

            binary_img = np.where(mask, 0, 255).astype(np.uint8)
            plate_img = Image.fromarray(binary_img)

            plate_info = {
                "name": name,
                "index": int(idx),
                "rank": rank,
                "color": [int(rgb[0]), int(rgb[1]), int(rgb[2])],
                "color_hex": f"#{rgb[0]:02x}{rgb[1]:02x}{rgb[2]:02x}",
                "coverage_pct": round(coverage, 2),
            }
            results.append(plate_info)
            plate_images[name] = {"mask": mask, "binary": binary_img, "image": plate_img}

    # ── Step 10: Composite preview ──
    # Paint order: white paper → lightest color first → darkest color → key block ON TOP
    # Key block must be last layer so it sits on top of color fills (like real printing)
    comp = np.ones((h, w, 3), dtype=np.uint8) * 255  # white paper
    
    # First: color plates (lightest to darkest)
    color_plates = [r for r in results if not r.get("is_key_block")]
    for plate_info in reversed(color_plates):
        name = plate_info["name"]
        mask = plate_images[name]["mask"]
        rgb = plate_info["color"]
        comp[mask] = rgb
    
    # Last: key block on top (black outlines over everything)
    key_plates = [r for r in results if r.get("is_key_block")]
    for plate_info in key_plates:
        name = plate_info["name"]
        mask = plate_images[name]["mask"]
        rgb = plate_info["color"]
        comp[mask] = rgb

    composite_img = Image.fromarray(comp)

    # ── Step 11: Auto-K suggestion ──
    k_suggestion = auto_k_suggestion(arr)

    # ── Step 12: Generate manifest ──
    manifest = {
        "width": w,
        "height": h,
        "num_plates": n_plates,
        "plates": results,
        "paper_pct": round(np.sum(non_content_no_edge) / (h * w) * 100, 2),
        "auto_k_suggestion": k_suggestion,
        "version": "v3",
    }

    if return_data:
        return {
            "composite": composite_img,
            "plates": plate_images,
            "manifest": manifest,
            "palette_rgb": palette_rgb,
        }

    # Save files
    composite_img.save(os.path.join(output_dir, "composite.png"))

    for plate_info in results:
        name = plate_info["name"]
        plate_images[name]["image"].save(os.path.join(output_dir, f"{name}.png"))

        mask = plate_images[name]["mask"]
        svg_path = os.path.join(output_dir, f"{name}.svg")
        mask_to_svg(mask, svg_path, w, h)

    with open(os.path.join(output_dir, "manifest.json"), "w") as f:
        json.dump(manifest, f, indent=2)

    return manifest


def mask_to_svg(mask, filepath, width, height, tolerance=1.5):
    """Convert a binary mask to an SVG with clean vector paths."""
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


def mask_to_svg_string(mask, width, height, tolerance=1.5):
    """Convert mask to SVG string (not file)."""
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
    return svg


def build_preview_response(image_bytes, plates=4, dust=50, use_edges=True,
                           edge_sigma=1.5, locked_colors=None):
    """Process image and return composite PNG bytes + manifest."""
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    max_dim = 1200
    if max(img.size) > max_dim:
        ratio = max_dim / max(img.size)
        new_size = (int(img.size[0] * ratio), int(img.size[1] * ratio))
        img = img.resize(new_size, Image.LANCZOS)

    arr = np.array(img)
    result = separate(arr, n_plates=plates, dust_threshold=dust,
                      use_edges=use_edges, edge_sigma=edge_sigma,
                      locked_colors=locked_colors, return_data=True)

    buf = io.BytesIO()
    result["composite"].save(buf, format="PNG")

    return buf.getvalue(), result["manifest"]


def build_zip_response(image_bytes, plates=4, dust=50, use_edges=True,
                       edge_sigma=1.5, locked_colors=None):
    """Process image and return ZIP bytes containing all outputs."""
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    max_dim = 4000
    if max(img.size) > max_dim:
        ratio = max_dim / max(img.size)
        new_size = (int(img.size[0] * ratio), int(img.size[1] * ratio))
        img = img.resize(new_size, Image.LANCZOS)

    arr = np.array(img)
    result = separate(arr, n_plates=plates, dust_threshold=dust,
                      use_edges=use_edges, edge_sigma=edge_sigma,
                      locked_colors=locked_colors, return_data=True)

    zip_buf = io.BytesIO()
    with zipfile.ZipFile(zip_buf, 'w', zipfile.ZIP_DEFLATED) as zf:
        comp_buf = io.BytesIO()
        result["composite"].save(comp_buf, format="PNG")
        zf.writestr("composite.png", comp_buf.getvalue())

        h, w = arr.shape[:2]
        for plate_info in result["manifest"]["plates"]:
            name = plate_info["name"]
            plate_data = result["plates"][name]

            png_buf = io.BytesIO()
            plate_data["image"].save(png_buf, format="PNG")
            zf.writestr(f"{name}.png", png_buf.getvalue())

            svg_content = mask_to_svg_string(plate_data["mask"], w, h)
            zf.writestr(f"{name}.svg", svg_content)

        zf.writestr("manifest.json", json.dumps(result["manifest"], indent=2))

    return zip_buf.getvalue()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Woodblock color separation V3")
    parser.add_argument("input", help="Input image path")
    parser.add_argument("output", help="Output directory")
    parser.add_argument("--plates", type=int, default=4, help="Number of color plates")
    parser.add_argument("--dust", type=int, default=50, help="Min island size in pixels")
    parser.add_argument("--no-edges", action="store_true", help="Disable edge detection")
    parser.add_argument("--edge-sigma", type=float, default=1.5, help="Canny edge sigma")
    args = parser.parse_args()

    result = separate(args.input, args.output, n_plates=args.plates,
                      dust_threshold=args.dust, use_edges=not args.no_edges,
                      edge_sigma=args.edge_sigma)
    print(json.dumps(result, indent=2))
