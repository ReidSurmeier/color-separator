"""Version parity tests — verify structural consistency across v11-v14."""
import io
import json
import os
import sys
import zipfile

import numpy as np
import pytest
from PIL import Image

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

PARITY_VERSIONS = ["v11", "v12", "v13", "v14"]


def _load_module(version):
    mod = __import__(f"separate_{version}")
    return mod


def _make_test_image():
    """80x80 image with 4 color quadrants."""
    img = np.zeros((80, 80, 3), dtype=np.uint8)
    img[:40, :40] = [255, 0, 0]
    img[:40, 40:] = [0, 255, 0]
    img[40:, :40] = [0, 0, 255]
    img[40:, 40:] = [255, 255, 0]
    return img


def _make_test_png():
    """Return PNG bytes of the test image."""
    buf = io.BytesIO()
    Image.fromarray(_make_test_image()).save(buf, format="PNG")
    return buf.getvalue()


@pytest.fixture(scope="module")
def test_png():
    return _make_test_png()


@pytest.fixture(scope="module")
def test_arr():
    return _make_test_image()


# ---------------------------------------------------------------------------
# Manifest structure parity
# ---------------------------------------------------------------------------
class TestManifestParity:
    """All versions produce manifests with the same required fields."""

    @pytest.mark.parametrize("version", PARITY_VERSIONS)
    def test_separate_returns_valid_manifest(self, test_arr, version):
        mod = _load_module(version)
        result = mod.separate(
            test_arr.copy(), n_plates=3, dust_threshold=20, return_data=True,
        )
        manifest = result["manifest"]
        assert "width" in manifest
        assert "height" in manifest
        assert "plates" in manifest
        assert isinstance(manifest["plates"], list)
        assert len(manifest["plates"]) > 0

    @pytest.mark.parametrize("version", PARITY_VERSIONS)
    def test_manifest_plate_fields(self, test_arr, version):
        mod = _load_module(version)
        result = mod.separate(
            test_arr.copy(), n_plates=3, dust_threshold=20, return_data=True,
        )
        for plate in result["manifest"]["plates"]:
            assert "name" in plate, f"{version} plate missing 'name'"
            assert "color" in plate, f"{version} plate missing 'color'"
            assert "coverage_pct" in plate, f"{version} plate missing 'coverage_pct'"

    @pytest.mark.parametrize("version", PARITY_VERSIONS)
    def test_manifest_dimensions(self, test_arr, version):
        mod = _load_module(version)
        result = mod.separate(
            test_arr.copy(), n_plates=3, dust_threshold=20,
            upscale=False, return_data=True,
        )
        manifest = result["manifest"]
        assert manifest["width"] == 80
        assert manifest["height"] == 80


# ---------------------------------------------------------------------------
# build_preview_response parity
# ---------------------------------------------------------------------------
class TestPreviewParity:
    """build_preview_response returns (bytes, dict) for all versions."""

    @pytest.mark.parametrize("version", PARITY_VERSIONS)
    def test_preview_returns_tuple(self, test_png, version):
        mod = _load_module(version)
        result = mod.build_preview_response(
            image_bytes=test_png, plates=3, dust=20,
        )
        assert isinstance(result, tuple)
        assert len(result) == 2

    @pytest.mark.parametrize("version", PARITY_VERSIONS)
    def test_preview_bytes_valid_png(self, test_png, version):
        mod = _load_module(version)
        comp_bytes, manifest = mod.build_preview_response(
            image_bytes=test_png, plates=3, dust=20,
        )
        assert len(comp_bytes) > 0
        img = Image.open(io.BytesIO(comp_bytes))
        assert img.format == "PNG"

    @pytest.mark.parametrize("version", PARITY_VERSIONS)
    def test_preview_manifest_has_plates(self, test_png, version):
        mod = _load_module(version)
        _, manifest = mod.build_preview_response(
            image_bytes=test_png, plates=3, dust=20,
        )
        assert "plates" in manifest
        assert len(manifest["plates"]) > 0


# ---------------------------------------------------------------------------
# build_zip_response parity
# ---------------------------------------------------------------------------
class TestZipParity:
    """build_zip_response returns valid ZIP bytes for all versions."""

    @pytest.mark.parametrize("version", PARITY_VERSIONS)
    def test_zip_returns_bytes(self, test_png, version):
        mod = _load_module(version)
        zip_bytes = mod.build_zip_response(
            image_bytes=test_png, plates=3, dust=20,
        )
        assert isinstance(zip_bytes, bytes)
        assert len(zip_bytes) > 0

    @pytest.mark.parametrize("version", PARITY_VERSIONS)
    def test_zip_contains_required_files(self, test_png, version):
        mod = _load_module(version)
        zip_bytes = mod.build_zip_response(
            image_bytes=test_png, plates=3, dust=20,
        )
        zf = zipfile.ZipFile(io.BytesIO(zip_bytes))
        names = zf.namelist()
        assert "composite.png" in names, f"{version} ZIP missing composite.png"
        assert "manifest.json" in names, f"{version} ZIP missing manifest.json"

    @pytest.mark.parametrize("version", PARITY_VERSIONS)
    def test_zip_manifest_valid_json(self, test_png, version):
        mod = _load_module(version)
        zip_bytes = mod.build_zip_response(
            image_bytes=test_png, plates=3, dust=20,
        )
        zf = zipfile.ZipFile(io.BytesIO(zip_bytes))
        manifest = json.loads(zf.read("manifest.json"))
        assert "plates" in manifest
        assert "width" in manifest
        assert "height" in manifest

    @pytest.mark.parametrize("version", PARITY_VERSIONS)
    def test_zip_has_plate_pngs(self, test_png, version):
        mod = _load_module(version)
        zip_bytes = mod.build_zip_response(
            image_bytes=test_png, plates=3, dust=20,
        )
        zf = zipfile.ZipFile(io.BytesIO(zip_bytes))
        plate_files = [n for n in zf.namelist() if n.startswith("plate") and n.endswith(".png")]
        assert len(plate_files) > 0


# ---------------------------------------------------------------------------
# build_merge_response parity
# ---------------------------------------------------------------------------
class TestMergeParity:
    """build_merge_response returns (bytes, dict) for all versions."""

    @pytest.mark.parametrize("version", PARITY_VERSIONS)
    def test_merge_returns_tuple(self, test_png, version):
        mod = _load_module(version)
        result = mod.build_merge_response(
            image_bytes=test_png, merge_pairs=[[0, 1]],
            plates=4, dust=20,
        )
        assert isinstance(result, tuple)
        assert len(result) == 2

    @pytest.mark.parametrize("version", PARITY_VERSIONS)
    def test_merge_produces_valid_png(self, test_png, version):
        mod = _load_module(version)
        comp_bytes, manifest = mod.build_merge_response(
            image_bytes=test_png, merge_pairs=[[0, 1]],
            plates=4, dust=20,
        )
        assert len(comp_bytes) > 0
        img = Image.open(io.BytesIO(comp_bytes))
        assert img.format == "PNG"

    @pytest.mark.parametrize("version", PARITY_VERSIONS)
    def test_merge_reduces_plate_count(self, test_png, version):
        mod = _load_module(version)
        _, manifest = mod.build_merge_response(
            image_bytes=test_png, merge_pairs=[[0, 1]],
            plates=4, dust=20,
        )
        assert len(manifest["plates"]) < 4

    @pytest.mark.parametrize("version", PARITY_VERSIONS)
    def test_merge_manifest_structure(self, test_png, version):
        mod = _load_module(version)
        _, manifest = mod.build_merge_response(
            image_bytes=test_png, merge_pairs=[[0, 1]],
            plates=4, dust=20,
        )
        assert "plates" in manifest
        for plate in manifest["plates"]:
            assert "name" in plate
            assert "color" in plate
            assert "coverage_pct" in plate


# ---------------------------------------------------------------------------
# Cross-version consistency
# ---------------------------------------------------------------------------
class TestCrossVersionConsistency:
    """Verify dimensions and plate count consistency across versions."""

    def test_all_versions_same_output_size(self, test_png):
        """All versions should produce images of the same dimensions."""
        sizes = {}
        for version in PARITY_VERSIONS:
            mod = _load_module(version)
            comp_bytes, _ = mod.build_preview_response(
                image_bytes=test_png, plates=3, dust=20,
            )
            img = Image.open(io.BytesIO(comp_bytes))
            sizes[version] = img.size
        # All should have the same width (80)
        widths = {v: s[0] for v, s in sizes.items()}
        assert len(set(widths.values())) == 1, f"Width mismatch: {widths}"

    def test_all_versions_produce_3_plates(self, test_png):
        """All versions should produce approximately 3 plates for a 4-color image."""
        for version in PARITY_VERSIONS:
            mod = _load_module(version)
            _, manifest = mod.build_preview_response(
                image_bytes=test_png, plates=3, dust=20,
            )
            n = len(manifest["plates"])
            assert 1 <= n <= 5, f"{version} produced {n} plates, expected ~3"
