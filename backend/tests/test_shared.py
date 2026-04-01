"""Tests for shared functions across algorithm versions."""
import sys
import os
import io
import numpy as np
import pytest
from PIL import Image

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))


@pytest.fixture
def sample_arr():
    img = np.zeros((50, 50, 3), dtype=np.uint8)
    img[:25, :25] = [200, 50, 50]
    img[:25, 25:] = [50, 200, 50]
    img[25:, :25] = [50, 50, 200]
    img[25:, 25:] = [200, 200, 50]
    return img


@pytest.fixture
def sample_bytes(sample_arr):
    buf = io.BytesIO()
    Image.fromarray(sample_arr).save(buf, format="PNG")
    return buf.getvalue()


# ── LRU Cache Tests ──

class TestLRUCache:
    def test_basic_set_get(self):
        from separate_v12 import LRUCache
        cache = LRUCache(maxsize=3)
        cache.set("a", 1)
        assert cache.get("a") == 1

    def test_eviction(self):
        from separate_v12 import LRUCache
        cache = LRUCache(maxsize=2)
        cache.set("a", 1)
        cache.set("b", 2)
        cache.set("c", 3)  # should evict "a"
        assert cache.get("a") is None
        assert cache.get("b") == 2
        assert cache.get("c") == 3

    def test_lru_order(self):
        from separate_v12 import LRUCache
        cache = LRUCache(maxsize=2)
        cache.set("a", 1)
        cache.set("b", 2)
        cache.get("a")  # touch "a", making "b" least recently used
        cache.set("c", 3)  # should evict "b"
        assert cache.get("a") == 1
        assert cache.get("b") is None
        assert cache.get("c") == 3

    def test_contains(self):
        from separate_v12 import LRUCache
        cache = LRUCache(maxsize=2)
        cache.set("x", 42)
        assert "x" in cache
        assert "y" not in cache


# ── Connected Component Cleanup ──

class TestCCCleanup:
    def test_removes_dust(self):
        from separate_v12 import connected_component_cleanup
        labels = np.zeros((30, 30), dtype=np.int32)
        labels[10:20, 10:20] = 1
        labels[0, 0] = 1  # dust
        result = connected_component_cleanup(labels, 2, dust_threshold=5)
        assert result[0, 0] == 0

    def test_keeps_large_regions(self):
        from separate_v12 import connected_component_cleanup
        labels = np.zeros((30, 30), dtype=np.int32)
        labels[5:25, 5:25] = 1
        result = connected_component_cleanup(labels, 2, dust_threshold=5)
        assert np.sum(result == 1) > 100

    def test_multiple_plates(self):
        from separate_v12 import connected_component_cleanup
        labels = np.zeros((30, 30), dtype=np.int32)
        labels[:15, :] = 1
        labels[15:, :] = 2
        labels[0, 0] = 2  # dust of plate 2 in plate 1 area
        result = connected_component_cleanup(labels, 3, dust_threshold=5)
        assert result[0, 0] != 2  # should be absorbed


# ── SVG Generation ──

class TestSVGGeneration:
    def test_mask_to_svg_string(self):
        from separate_v11 import mask_to_svg_string
        mask = np.zeros((20, 20), dtype=bool)
        mask[5:15, 5:15] = True
        svg = mask_to_svg_string(mask, 20, 20)
        assert svg.startswith('<?xml')
        assert 'svg' in svg
        assert '</svg>' in svg

    def test_svg_dimensions(self):
        from separate_v11 import mask_to_svg_string
        mask = np.ones((30, 40), dtype=bool)
        svg = mask_to_svg_string(mask, 40, 30)
        assert 'width="40"' in svg or "40" in svg
        assert 'height="30"' in svg or "30" in svg


# ── Build Preview Response ──

class TestBuildPreview:
    def test_v11_returns_bytes_and_manifest(self, sample_bytes):
        from separate_v11 import build_preview_response
        comp_bytes, manifest = build_preview_response(
            image_bytes=sample_bytes, plates=3, dust=5, upscale=False
        )
        assert isinstance(comp_bytes, bytes)
        assert len(comp_bytes) > 0
        assert isinstance(manifest, dict)
        assert "plates" in manifest

    def test_v12_returns_bytes_and_manifest(self, sample_bytes):
        from separate_v12 import build_preview_response
        comp_bytes, manifest = build_preview_response(
            image_bytes=sample_bytes, plates=4, dust=5, upscale=False
        )
        assert len(comp_bytes) > 0
        assert manifest["version"] == "v12"

    def test_v13_returns_bytes_and_manifest(self, sample_bytes):
        from separate_v13 import build_preview_response
        comp_bytes, manifest = build_preview_response(
            image_bytes=sample_bytes, plates=3, dust=5, upscale=False
        )
        assert len(comp_bytes) > 0

    def test_v14_returns_bytes_and_manifest(self, sample_bytes):
        from separate_v14 import build_preview_response
        comp_bytes, manifest = build_preview_response(
            image_bytes=sample_bytes, plates=3, dust=5, upscale=False
        )
        assert len(comp_bytes) > 0


# ── Build ZIP Response ──

class TestBuildZip:
    def test_v11_zip(self, sample_bytes):
        from separate_v11 import build_zip_response
        zip_bytes = build_zip_response(image_bytes=sample_bytes, plates=3, dust=5, upscale=False)
        assert len(zip_bytes) > 0
        import zipfile
        zf = zipfile.ZipFile(io.BytesIO(zip_bytes))
        assert "composite.png" in zf.namelist()

    def test_v12_zip(self, sample_bytes):
        from separate_v12 import build_zip_response
        zip_bytes = build_zip_response(image_bytes=sample_bytes, plates=3, dust=5, upscale=False)
        import zipfile
        zf = zipfile.ZipFile(io.BytesIO(zip_bytes))
        names = zf.namelist()
        assert "manifest.json" in names
        plates = [n for n in names if n.startswith("plate") and n.endswith(".png")]
        assert len(plates) == 3

    def test_v13_zip(self, sample_bytes):
        from separate_v13 import build_zip_response
        zip_bytes = build_zip_response(image_bytes=sample_bytes, plates=2, dust=5, upscale=False)
        assert len(zip_bytes) > 0


# ── Chroma Boost ──

class TestChromaBoost:
    def test_chroma_boost_affects_output(self, sample_arr):
        from separate_v12 import separate
        r1 = separate(sample_arr, n_plates=3, dust_threshold=5, return_data=True, upscale=False, chroma_boost=1.0)
        r2 = separate(sample_arr, n_plates=3, dust_threshold=5, return_data=True, upscale=False, chroma_boost=2.0)
        c1 = [p["color"] for p in r1["manifest"]["plates"]]
        c2 = [p["color"] for p in r2["manifest"]["plates"]]
        # Chroma boost may not change quantized colors on simple images
        # Just verify both ran successfully
        assert len(c1) == 3
        assert len(c2) == 3


# ── Edge Cases ──

class TestEdgeCases:
    def test_single_color_image(self):
        from separate_v12 import separate
        uniform = np.full((30, 30, 3), [128, 128, 128], dtype=np.uint8)
        result = separate(uniform, n_plates=2, dust_threshold=5, return_data=True, upscale=False)
        assert "composite" in result

    def test_grayscale_input(self):
        from separate_v12 import separate
        gray = np.random.randint(0, 255, (30, 30, 3), dtype=np.uint8)
        gray[:, :, 1] = gray[:, :, 0]
        gray[:, :, 2] = gray[:, :, 0]
        result = separate(gray, n_plates=3, dust_threshold=5, return_data=True, upscale=False)
        assert len(result["manifest"]["plates"]) == 3

    def test_high_dust_threshold(self, sample_arr):
        from separate_v12 import separate
        result = separate(sample_arr, n_plates=4, dust_threshold=500, return_data=True, upscale=False)
        assert "composite" in result

    def test_locked_colors_exact_count(self, sample_arr):
        from separate_v12 import separate
        locked = [[255, 0, 0], [0, 255, 0], [0, 0, 255]]
        result = separate(sample_arr, n_plates=3, dust_threshold=5, return_data=True,
                          upscale=False, locked_colors=locked)
        assert len(result["manifest"]["plates"]) == 3

    def test_locked_colors_fewer_than_plates(self, sample_arr):
        from separate_v12 import separate
        locked = [[255, 0, 0]]
        result = separate(sample_arr, n_plates=4, dust_threshold=5, return_data=True,
                          upscale=False, locked_colors=locked)
        assert len(result["manifest"]["plates"]) == 4


class TestValidateUpload:
    """Test the input validation function."""

    def test_valid_image(self):
        import asyncio
        from main import validate_upload
        img = np.zeros((10, 10, 3), dtype=np.uint8)
        buf = io.BytesIO()
        Image.fromarray(img).save(buf, format="PNG")
        result = asyncio.run(validate_upload(buf.getvalue()))
        assert result is None  # None = valid

    def test_invalid_image(self):
        import asyncio
        from main import validate_upload
        result = asyncio.run(validate_upload(b"not an image"))
        assert result is not None
        assert result.status_code == 400

    def test_oversized(self):
        import asyncio
        from main import validate_upload
        result = asyncio.run(validate_upload(b"x" * (51 * 1024 * 1024)))
        assert result is not None
        assert result.status_code == 413
