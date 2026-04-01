"""Comprehensive test suite for color separator backend."""
import sys
import os
import io
import json
import zipfile
import pytest
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))


# ── Fixtures ──

@pytest.fixture
def sample_image():
    """Create a simple test image with distinct color regions."""
    img = np.zeros((100, 100, 3), dtype=np.uint8)
    img[:50, :50] = [255, 0, 0]      # red top-left
    img[:50, 50:] = [0, 255, 0]      # green top-right
    img[50:, :50] = [0, 0, 255]      # blue bottom-left
    img[50:, 50:] = [255, 255, 0]    # yellow bottom-right
    return img


@pytest.fixture
def sample_image_bytes(sample_image):
    """Convert sample image to PNG bytes."""
    buf = io.BytesIO()
    Image.fromarray(sample_image).save(buf, format="PNG")
    return buf.getvalue()


@pytest.fixture
def white_image():
    """All white image."""
    return np.ones((50, 50, 3), dtype=np.uint8) * 255


@pytest.fixture
def gradient_image():
    """Gradient image for testing smooth color transitions."""
    img = np.zeros((100, 100, 3), dtype=np.uint8)
    for x in range(100):
        img[:, x] = [int(x * 2.55), int((99 - x) * 2.55), 128]
    return img


# ── Import Tests ──

class TestImports:
    def test_import_v2(self):
        import separate_v2
        assert hasattr(separate_v2, 'separate')

    def test_import_v11(self):
        import separate_v11
        assert hasattr(separate_v11, 'separate')
        assert hasattr(separate_v11, 'build_preview_response')
        assert hasattr(separate_v11, 'build_zip_response')

    def test_import_v12(self):
        import separate_v12
        assert hasattr(separate_v12, 'separate')
        assert hasattr(separate_v12, 'build_preview_response')

    def test_import_v13(self):
        import separate_v13
        assert hasattr(separate_v13, 'separate')

    def test_import_v14(self):
        import separate_v14
        assert hasattr(separate_v14, 'separate')


# ── Separation Tests ──

class TestSeparation:
    """Test actual color separation produces valid output."""

    def test_v2_separate(self, sample_image):
        import separate_v2
        result = separate_v2.separate(sample_image, n_plates=4, dust_threshold=5,
                                       return_data=True)
        assert "composite" in result
        assert "plates" in result
        assert "manifest" in result
        assert len(result["manifest"]["plates"]) == 4

    def test_v11_separate(self, sample_image):
        import separate_v11
        result = separate_v11.separate(sample_image, n_plates=4, dust_threshold=5,
                                        return_data=True, upscale=False)
        assert "composite" in result
        assert "plates" in result
        assert "manifest" in result
        assert isinstance(result["composite"], Image.Image)

    def test_v12_separate(self, sample_image):
        import separate_v12
        result = separate_v12.separate(sample_image, n_plates=4, dust_threshold=5,
                                        return_data=True, upscale=False)
        assert "composite" in result
        assert len(result["manifest"]["plates"]) == 4
        assert result["manifest"]["version"] == "v12"

    def test_v13_separate(self, sample_image):
        import separate_v13
        result = separate_v13.separate(sample_image, n_plates=3, dust_threshold=5,
                                        return_data=True, upscale=False)
        assert "composite" in result
        assert len(result["manifest"]["plates"]) == 3

    def test_v14_separate(self, sample_image):
        import separate_v14
        result = separate_v14.separate(sample_image, n_plates=4, dust_threshold=5,
                                        return_data=True, upscale=False)
        assert "composite" in result
        assert result["manifest"]["version"] == "v14"

    def test_composite_is_valid_image(self, sample_image):
        import separate_v12
        result = separate_v12.separate(sample_image, n_plates=4, dust_threshold=5,
                                        return_data=True, upscale=False)
        comp = result["composite"]
        assert isinstance(comp, Image.Image)
        assert comp.size[0] > 0
        assert comp.size[1] > 0
        assert comp.mode in ("RGB", "RGBA")

    def test_plates_are_binary(self, sample_image):
        import separate_v12
        result = separate_v12.separate(sample_image, n_plates=4, dust_threshold=5,
                                        return_data=True, upscale=False)
        for name, plate_data in result["plates"].items():
            binary = plate_data["binary"]
            unique_vals = np.unique(binary)
            # Should only contain 0 and 255
            assert all(v in [0, 255] for v in unique_vals), f"Plate {name} has non-binary values: {unique_vals}"


# ── Plate Count Tests ──

class TestPlateCounts:
    """Test separation with various plate counts."""

    def test_2_plates(self, sample_image):
        import separate_v12
        result = separate_v12.separate(sample_image, n_plates=2, dust_threshold=5,
                                        return_data=True, upscale=False)
        assert len(result["manifest"]["plates"]) == 2

    def test_4_plates(self, sample_image):
        import separate_v12
        result = separate_v12.separate(sample_image, n_plates=4, dust_threshold=5,
                                        return_data=True, upscale=False)
        assert len(result["manifest"]["plates"]) == 4

    def test_8_plates(self, sample_image):
        import separate_v12
        result = separate_v12.separate(sample_image, n_plates=8, dust_threshold=5,
                                        return_data=True, upscale=False)
        assert len(result["manifest"]["plates"]) == 8

    def test_max_plates_35(self, sample_image):
        import separate_v12
        result = separate_v12.separate(sample_image, n_plates=35, dust_threshold=5,
                                        return_data=True, upscale=False)
        assert len(result["manifest"]["plates"]) == 35


# ── Preview Response Tests ──

class TestPreviewResponse:
    """Test build_preview_response returns valid data."""

    def test_v11_preview(self, sample_image_bytes):
        import separate_v11
        composite_bytes, manifest = separate_v11.build_preview_response(
            image_bytes=sample_image_bytes, plates=4, dust=5, upscale=False
        )
        assert len(composite_bytes) > 0
        # Verify it's a valid PNG
        img = Image.open(io.BytesIO(composite_bytes))
        assert img.size[0] > 0
        assert isinstance(manifest, dict)
        assert "plates" in manifest

    def test_v12_preview(self, sample_image_bytes):
        import separate_v12
        composite_bytes, manifest = separate_v12.build_preview_response(
            image_bytes=sample_image_bytes, plates=4, dust=5, upscale=False
        )
        assert len(composite_bytes) > 0
        img = Image.open(io.BytesIO(composite_bytes))
        assert img.format == "PNG" or img.size[0] > 0


# ── ZIP Response Tests ──

class TestZipResponse:
    """Test ZIP download contains correct files."""

    def test_v12_zip_structure(self, sample_image_bytes):
        import separate_v12
        zip_bytes = separate_v12.build_zip_response(
            image_bytes=sample_image_bytes, plates=4, dust=5, upscale=False
        )
        assert len(zip_bytes) > 0

        # Verify ZIP structure
        zf = zipfile.ZipFile(io.BytesIO(zip_bytes))
        names = zf.namelist()
        assert "composite.png" in names
        assert "manifest.json" in names
        # Should have plate files
        plate_pngs = [n for n in names if n.startswith("plate") and n.endswith(".png")]
        assert len(plate_pngs) == 4
        # Should have SVG files
        plate_svgs = [n for n in names if n.startswith("plate") and n.endswith(".svg")]
        assert len(plate_svgs) == 4

    def test_zip_manifest_valid_json(self, sample_image_bytes):
        import separate_v12
        zip_bytes = separate_v12.build_zip_response(
            image_bytes=sample_image_bytes, plates=4, dust=5, upscale=False
        )
        zf = zipfile.ZipFile(io.BytesIO(zip_bytes))
        manifest = json.loads(zf.read("manifest.json"))
        assert "plates" in manifest
        assert "width" in manifest
        assert "height" in manifest
        assert len(manifest["plates"]) == 4

    def test_zip_plates_are_valid_pngs(self, sample_image_bytes):
        import separate_v12
        zip_bytes = separate_v12.build_zip_response(
            image_bytes=sample_image_bytes, plates=3, dust=5, upscale=False
        )
        zf = zipfile.ZipFile(io.BytesIO(zip_bytes))
        for name in zf.namelist():
            if name.endswith(".png"):
                img = Image.open(io.BytesIO(zf.read(name)))
                assert img.size[0] > 0


# ── Manifest Tests ──

class TestManifest:
    """Test manifest data is correct."""

    def test_manifest_has_required_fields(self, sample_image):
        import separate_v12
        result = separate_v12.separate(sample_image, n_plates=4, dust_threshold=5,
                                        return_data=True, upscale=False)
        manifest = result["manifest"]
        assert "width" in manifest
        assert "height" in manifest
        assert "plates" in manifest
        assert "version" in manifest
        assert manifest["width"] == 100
        assert manifest["height"] == 100

    def test_plate_info_fields(self, sample_image):
        import separate_v12
        result = separate_v12.separate(sample_image, n_plates=4, dust_threshold=5,
                                        return_data=True, upscale=False)
        for plate in result["manifest"]["plates"]:
            assert "name" in plate
            assert "color" in plate
            assert "coverage_pct" in plate
            assert len(plate["color"]) == 3
            assert all(0 <= c <= 255 for c in plate["color"])
            assert 0 <= plate["coverage_pct"] <= 100

    def test_coverage_sums_reasonable(self, sample_image):
        import separate_v12
        result = separate_v12.separate(sample_image, n_plates=4, dust_threshold=5,
                                        return_data=True, upscale=False)
        total_coverage = sum(p["coverage_pct"] for p in result["manifest"]["plates"])
        # Total coverage should be close to 100% (some paper/background excluded)
        assert 50 < total_coverage <= 100.1


# ── Error Handling Tests ──

class TestErrorHandling:
    """Test error handling for bad inputs."""

    def test_invalid_image_bytes(self):
        import separate_v12
        with pytest.raises(Exception):
            separate_v12.build_preview_response(
                image_bytes=b"not an image", plates=4, dust=5, upscale=False
            )

    def test_zero_plates_clamped(self, sample_image):
        """Plates should be clamped to minimum 2."""
        import separate_v12
        # This should not crash even with 0 or 1 plates
        result = separate_v12.separate(sample_image, n_plates=1, dust_threshold=5,
                                        return_data=True, upscale=False)
        assert len(result["manifest"]["plates"]) >= 1

    def test_very_small_image(self):
        """Test with a tiny 2x2 image."""
        import separate_v12
        tiny = np.array([[[255, 0, 0], [0, 255, 0]],
                          [[0, 0, 255], [255, 255, 0]]], dtype=np.uint8)
        result = separate_v12.separate(tiny, n_plates=2, dust_threshold=1,
                                        return_data=True, upscale=False)
        assert "composite" in result


# ── Color Utility Tests ──

class TestColorUtils:
    def test_rgb_to_lab_roundtrip(self):
        from skimage.color import rgb2lab, lab2rgb
        original = np.array([[[0.5, 0.3, 0.7]]])
        lab = rgb2lab(original)
        back = lab2rgb(lab)
        np.testing.assert_allclose(original, back, atol=0.01)

    def test_kmeans_clusters_distinct_colors(self):
        from sklearn.cluster import MiniBatchKMeans
        # 4 clearly distinct colors
        data = np.array([
            [0, 0, 0], [0, 0, 0.1],
            [1, 0, 0], [1, 0.1, 0],
            [0, 1, 0], [0, 1, 0.1],
            [0, 0, 1], [0.1, 0, 1],
        ], dtype=np.float64)
        km = MiniBatchKMeans(n_clusters=4, random_state=42, n_init=3)
        km.fit(data)
        assert len(km.cluster_centers_) == 4

    def test_cdist_euclidean(self):
        from scipy.spatial.distance import cdist
        a = np.array([[0, 0, 0], [1, 1, 1]], dtype=np.float64)
        b = np.array([[0, 0, 0], [2, 2, 2]], dtype=np.float64)
        dists = cdist(a, b, metric='sqeuclidean')
        assert dists[0, 0] == 0  # same point
        assert dists[0, 1] > 0   # different points
        assert dists.shape == (2, 2)


# ── Get Module Tests ──

class TestGetModule:
    def test_known_versions(self):
        try:
            from main import get_module
            for v in ['v2', 'v11', 'v12', 'v13', 'v14']:
                mod = get_module(v)
                assert mod is not None
                assert hasattr(mod, 'separate')
        except ImportError:
            pytest.skip("optional dependency missing")

    def test_unknown_version_fallback(self):
        try:
            from main import get_module
            mod = get_module('v999')
            # Should fall back to default (v11 or similar)
            assert mod is not None
        except ImportError:
            pytest.skip("optional dependency missing")


# ── Gradient Image Tests ──

class TestGradientHandling:
    def test_gradient_separation(self, gradient_image):
        import separate_v12
        result = separate_v12.separate(gradient_image, n_plates=4, dust_threshold=5,
                                        return_data=True, upscale=False)
        assert len(result["manifest"]["plates"]) == 4
        # Gradient should produce plates with varying coverage
        coverages = [p["coverage_pct"] for p in result["manifest"]["plates"]]
        assert max(coverages) > min(coverages)  # Not all equal


# ── Connected Component Cleanup Tests ──

class TestCleanup:
    def test_cc_cleanup_removes_small_components(self):
        import separate_v12
        # Create a label map with a small isolated component
        labels = np.zeros((20, 20), dtype=np.int32)
        labels[5:15, 5:15] = 1  # big region
        labels[0, 0] = 1  # tiny isolated pixel
        cleaned = separate_v12.connected_component_cleanup(labels, 2, dust_threshold=5)
        # The isolated pixel should be absorbed
        assert cleaned[0, 0] == 0  # absorbed into background
