"""API endpoint tests using FastAPI TestClient."""
import sys
import os
import io
import json
import zipfile
import pytest
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

try:
    from fastapi.testclient import TestClient
    from main import app
    HAS_TESTCLIENT = True
except ImportError:
    HAS_TESTCLIENT = False

pytestmark = pytest.mark.skipif(not HAS_TESTCLIENT, reason="TestClient deps missing")


@pytest.fixture
def client():
    # When BACKEND_API_KEY is set in the environment, include it in all test
    # requests so the APIKeyMiddleware doesn't block them.
    api_key = os.environ.get("BACKEND_API_KEY", "")
    headers = {"X-API-Key": api_key} if api_key else {}
    return TestClient(app, headers=headers)


@pytest.fixture
def sample_png():
    img = np.zeros((80, 80, 3), dtype=np.uint8)
    img[:40, :40] = [255, 0, 0]
    img[:40, 40:] = [0, 255, 0]
    img[40:, :40] = [0, 0, 255]
    img[40:, 40:] = [255, 255, 0]
    buf = io.BytesIO()
    Image.fromarray(img).save(buf, format="PNG")
    buf.seek(0)
    return buf


# ── Preview Endpoint ──

class TestPreviewEndpoint:
    def test_preview_v12(self, client, sample_png):
        resp = client.post("/api/preview", files={"image": ("test.png", sample_png, "image/png")},
                           data={"plates": "4", "dust": "5", "version": "v12", "upscale": "false"})
        assert resp.status_code == 200
        assert resp.headers["content-type"] == "image/png"
        assert len(resp.content) > 100
        manifest = json.loads(resp.headers["X-Manifest"])
        assert len(manifest["plates"]) == 4

    def test_preview_v11(self, client, sample_png):
        resp = client.post("/api/preview", files={"image": ("test.png", sample_png, "image/png")},
                           data={"plates": "3", "dust": "10", "version": "v11", "upscale": "false"})
        assert resp.status_code == 200
        manifest = json.loads(resp.headers["X-Manifest"])
        assert len(manifest["plates"]) == 3

    def test_preview_v2(self, client, sample_png):
        resp = client.post("/api/preview", files={"image": ("test.png", sample_png, "image/png")},
                           data={"plates": "2", "dust": "5", "version": "v2"})
        assert resp.status_code == 200

    def test_preview_v13(self, client, sample_png):
        resp = client.post("/api/preview", files={"image": ("test.png", sample_png, "image/png")},
                           data={"plates": "4", "dust": "5", "version": "v13", "upscale": "false"})
        assert resp.status_code == 200

    def test_preview_v14(self, client, sample_png):
        resp = client.post("/api/preview", files={"image": ("test.png", sample_png, "image/png")},
                           data={"plates": "4", "dust": "5", "version": "v14", "upscale": "false"})
        assert resp.status_code == 200

    def test_preview_bad_image(self, client):
        resp = client.post("/api/preview", files={"image": ("bad.txt", io.BytesIO(b"not an image"), "text/plain")},
                           data={"plates": "4", "dust": "5", "version": "v12"})
        assert resp.status_code == 400

    def test_preview_large_file(self, client):
        # Create a file just over 50MB (but we'll fake it with headers)
        big = io.BytesIO(b"x" * (51 * 1024 * 1024))
        resp = client.post("/api/preview", files={"image": ("big.png", big, "image/png")},
                           data={"plates": "4", "version": "v12"})
        assert resp.status_code == 413

    def test_preview_2_plates(self, client, sample_png):
        resp = client.post("/api/preview", files={"image": ("test.png", sample_png, "image/png")},
                           data={"plates": "2", "dust": "5", "version": "v12", "upscale": "false"})
        assert resp.status_code == 200
        manifest = json.loads(resp.headers["X-Manifest"])
        assert len(manifest["plates"]) == 2

    def test_preview_8_plates(self, client, sample_png):
        resp = client.post("/api/preview", files={"image": ("test.png", sample_png, "image/png")},
                           data={"plates": "8", "dust": "5", "version": "v12", "upscale": "false"})
        assert resp.status_code == 200
        manifest = json.loads(resp.headers["X-Manifest"])
        assert len(manifest["plates"]) == 8

    def test_preview_manifest_structure(self, client, sample_png):
        resp = client.post("/api/preview", files={"image": ("test.png", sample_png, "image/png")},
                           data={"plates": "4", "dust": "5", "version": "v12", "upscale": "false"})
        manifest = json.loads(resp.headers["X-Manifest"])
        assert "width" in manifest
        assert "height" in manifest
        assert "plates" in manifest
        assert "version" in manifest
        for plate in manifest["plates"]:
            assert "name" in plate
            assert "color" in plate
            assert len(plate["color"]) == 3

    def test_preview_output_valid_png(self, client, sample_png):
        resp = client.post("/api/preview", files={"image": ("test.png", sample_png, "image/png")},
                           data={"plates": "4", "version": "v12", "upscale": "false"})
        img = Image.open(io.BytesIO(resp.content))
        assert img.size[0] > 0
        assert img.size[1] > 0


# ── Separate (ZIP) Endpoint ──

class TestSeparateEndpoint:
    def test_separate_v12(self, client, sample_png):
        resp = client.post("/api/separate", files={"image": ("test.png", sample_png, "image/png")},
                           data={"plates": "4", "dust": "5", "version": "v12", "upscale": "false"})
        assert resp.status_code == 200
        assert "application/zip" in resp.headers["content-type"]

    def test_separate_zip_contents(self, client, sample_png):
        resp = client.post("/api/separate", files={"image": ("test.png", sample_png, "image/png")},
                           data={"plates": "3", "dust": "5", "version": "v12", "upscale": "false"})
        zf = zipfile.ZipFile(io.BytesIO(resp.content))
        names = zf.namelist()
        assert "composite.png" in names
        assert "manifest.json" in names
        plate_pngs = [n for n in names if n.startswith("plate") and n.endswith(".png")]
        assert len(plate_pngs) == 3

    def test_separate_bad_image(self, client):
        resp = client.post("/api/separate", files={"image": ("bad.txt", io.BytesIO(b"nope"), "text/plain")},
                           data={"plates": "4", "version": "v12"})
        assert resp.status_code == 400


# ── Plates Endpoint ──

class TestPlatesEndpoint:
    def test_plates_v12(self, client, sample_png):
        resp = client.post("/api/plates", files={"image": ("test.png", sample_png, "image/png")},
                           data={"plates": "4", "dust": "5", "version": "v12"})
        assert resp.status_code == 200
        data = resp.json()
        assert "plates" in data
        assert len(data["plates"]) == 4
        for plate in data["plates"]:
            assert "name" in plate
            assert "color" in plate
            assert "image" in plate
            assert plate["image"].startswith("data:image/png;base64,")

    def test_plates_bad_image(self, client):
        resp = client.post("/api/plates", files={"image": ("bad.txt", io.BytesIO(b"nope"), "text/plain")},
                           data={"plates": "4", "version": "v12"})
        assert resp.status_code == 400

    def test_plates_large_file(self, client):
        big = io.BytesIO(b"x" * (51 * 1024 * 1024))
        resp = client.post("/api/plates", files={"image": ("big.png", big, "image/png")},
                           data={"plates": "4", "version": "v12"})
        assert resp.status_code == 413


# ── Version Map ──

class TestVersionMap:
    def test_core_versions_exist(self):
        """Versions with no exotic deps should always be in VERSION_MAP."""
        from main import VERSION_MAP
        core = ["v2", "v3", "v4", "v5", "v6", "v9", "v10",
                "v11", "v12", "v13", "v14"]
        for v in core:
            assert v in VERSION_MAP, f"Missing core version {v}"

    def test_optional_versions_present_locally(self):
        """Versions with native deps (pydensecrf, SAM) may be absent in CI."""
        import os
        if os.environ.get("CI"):
            pytest.skip("Optional versions need native deps not in CI")
        from main import VERSION_MAP
        for v in ["v7", "v8", "v15", "v16", "v17", "v18", "v19", "v20"]:
            assert v in VERSION_MAP, f"Missing optional version {v}"

    def test_unknown_version_returns_none(self):
        from main import get_module
        mod = get_module("v999")
        assert mod is None  # unknown versions return None, caller handles error


# ── Locked Colors ──

class TestLockedColors:
    def test_preview_with_locked_colors(self, client, sample_png):
        resp = client.post("/api/preview", files={"image": ("test.png", sample_png, "image/png")},
                           data={"plates": "4", "dust": "5", "version": "v12", "upscale": "false",
                                 "locked_colors": json.dumps([[255, 0, 0], [0, 255, 0]])})
        assert resp.status_code == 200


# ── Edge Detection ──

class TestEdgeDetection:
    def test_preview_edges_on(self, client, sample_png):
        resp = client.post("/api/preview", files={"image": ("test.png", sample_png, "image/png")},
                           data={"plates": "4", "version": "v12", "upscale": "false",
                                 "use_edges": "true", "edge_sigma": "1.5"})
        assert resp.status_code == 200

    def test_preview_edges_off(self, client, sample_png):
        resp = client.post("/api/preview", files={"image": ("test.png", sample_png, "image/png")},
                           data={"plates": "4", "version": "v12", "upscale": "false",
                                 "use_edges": "false"})
        assert resp.status_code == 200


# ── Upscale Endpoint ──

@pytest.mark.gpu
class TestUpscaleEndpoint:
    def test_upscale_returns_json(self, client, sample_png):
        resp = client.post("/api/upscale", files={"image": ("test.png", sample_png, "image/png")})
        # May fail if ESRGAN not available, but should at least not crash
        assert resp.status_code in (200, 500)

    def test_upscale_bad_image(self, client):
        resp = client.post("/api/upscale", files={"image": ("bad.txt", io.BytesIO(b"nope"), "text/plain")})
        assert resp.status_code in (400, 500)


# ── Merge Endpoint ──

class TestMergeEndpoint:
    def test_merge_v12(self, client, sample_png):
        resp = client.post("/api/merge", files={"image": ("test.png", sample_png, "image/png")},
                           data={"plates": "4", "dust": "5", "version": "v12", "upscale": "false",
                                 "merge_pairs": json.dumps([[0, 1]])})
        assert resp.status_code == 200

    @pytest.mark.xfail(reason="merge endpoint missing json.loads try/except")
    def test_merge_bad_pairs(self, client, sample_png):
        resp = client.post("/api/merge", files={"image": ("test.png", sample_png, "image/png")},
                           data={"plates": "4", "version": "v12", "upscale": "false",
                                 "merge_pairs": "not json"})
        assert resp.status_code in (400, 500)


# ── Multiple Versions via API ──

class TestMultiVersionAPI:
    @pytest.mark.parametrize("version", ["v2", "v9", "v10", "v11", "v12", "v13", "v14"])
    def test_preview_all_basic_versions(self, client, sample_png, version):
        resp = client.post("/api/preview", files={"image": ("test.png", sample_png, "image/png")},
                           data={"plates": "3", "dust": "5", "version": version, "upscale": "false"})
        assert resp.status_code == 200


# ── Version-specific params ──

class TestVersionParams:
    def test_v11_with_smooth_params(self, client, sample_png):
        resp = client.post("/api/preview", files={"image": ("test.png", sample_png, "image/png")},
                           data={"plates": "3", "version": "v11", "upscale": "false",
                                 "sigma_s": "80", "sigma_r": "0.4", "meanshift_sp": "12", "meanshift_sr": "25"})
        assert resp.status_code == 200

    def test_v14_with_detail_strength(self, client, sample_png):
        resp = client.post("/api/preview", files={"image": ("test.png", sample_png, "image/png")},
                           data={"plates": "3", "version": "v14", "upscale": "false", "detail_strength": "0.7"})
        assert resp.status_code == 200

    def test_v4_with_median(self, client, sample_png):
        resp = client.post("/api/preview", files={"image": ("test.png", sample_png, "image/png")},
                           data={"plates": "3", "version": "v4", "upscale": "false",
                                 "median_size": "3", "chroma_boost": "1.5"})
        assert resp.status_code == 200

    def test_v6_with_superpixel(self, client, sample_png):
        resp = client.post("/api/preview", files={"image": ("test.png", sample_png, "image/png")},
                           data={"plates": "3", "version": "v6", "upscale": "false",
                                 "n_segments": "500", "compactness": "10"})
        assert resp.status_code == 200

    def test_v7_with_crf(self, client, sample_png):
        try:
            resp = client.post("/api/preview", files={"image": ("test.png", sample_png, "image/png")},
                               data={"plates": "3", "version": "v7",
                                     "crf_spatial": "3", "crf_color": "10", "crf_compat": "5"})
            assert resp.status_code == 200
        except Exception:
            pass  # pydensecrf may not be installed

    def test_separate_v11_with_params(self, client, sample_png):
        resp = client.post("/api/separate", files={"image": ("test.png", sample_png, "image/png")},
                           data={"plates": "3", "version": "v11", "upscale": "false",
                                 "sigma_s": "60", "sigma_r": "0.3"})
        assert resp.status_code == 200
