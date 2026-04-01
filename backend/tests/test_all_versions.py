"""Test all algorithm versions produce valid output."""
import sys
import os
import io
import numpy as np
import pytest
from PIL import Image

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))


@pytest.fixture
def test_image():
    img = np.zeros((60, 60, 3), dtype=np.uint8)
    img[:20, :20] = [220, 40, 40]
    img[:20, 20:40] = [40, 220, 40]
    img[:20, 40:] = [40, 40, 220]
    img[20:40, :20] = [220, 220, 40]
    img[20:40, 20:40] = [220, 40, 220]
    img[20:40, 40:] = [40, 220, 220]
    img[40:, :] = [200, 180, 160]
    return img


@pytest.fixture
def test_bytes(test_image):
    buf = io.BytesIO()
    Image.fromarray(test_image).save(buf, format="PNG")
    return buf.getvalue()


VERSIONS_BASIC = ["v2", "v5", "v6", "v9", "v10", "v11", "v12", "v13", "v14"]


@pytest.mark.parametrize("version", VERSIONS_BASIC)
def test_separate_returns_valid_result(test_image, version):
    mod = __import__(f"separate_{version}" if version != "v2" else "separate_v2")
    kwargs = dict(n_plates=3, dust_threshold=5, return_data=True)
    if version in ("v9", "v10", "v11", "v12", "v14"):
        kwargs["upscale"] = False
    if version in ("v13",):
        kwargs["upscale"] = False
    result = mod.separate(test_image, **kwargs)
    assert "composite" in result
    assert "plates" in result
    assert "manifest" in result
    assert len(result["manifest"]["plates"]) == 3


@pytest.mark.parametrize("version", ["v11", "v12", "v13", "v14"])
def test_build_preview_response(test_bytes, version):
    mod = __import__(f"separate_{version}")
    comp_bytes, manifest = mod.build_preview_response(
        image_bytes=test_bytes, plates=3, dust=5, upscale=False
    )
    assert len(comp_bytes) > 0
    assert isinstance(manifest, dict)
    img = Image.open(io.BytesIO(comp_bytes))
    assert img.size[0] == 60
    assert img.size[1] == 60


@pytest.mark.parametrize("version", ["v11", "v12"])
def test_build_zip_response(test_bytes, version):
    import zipfile
    mod = __import__(f"separate_{version}")
    zip_bytes = mod.build_zip_response(image_bytes=test_bytes, plates=3, dust=5, upscale=False)
    zf = zipfile.ZipFile(io.BytesIO(zip_bytes))
    assert "composite.png" in zf.namelist()
    assert "manifest.json" in zf.namelist()


@pytest.mark.parametrize("n_plates", [2, 3, 4, 6, 8, 12])
def test_v12_plate_counts(test_image, n_plates):
    import separate_v12
    result = separate_v12.separate(test_image, n_plates=n_plates, dust_threshold=5,
                                    return_data=True, upscale=False)
    assert len(result["manifest"]["plates"]) == n_plates


class TestV5:
    def test_separate(self, test_image):
        import separate_v5
        result = separate_v5.separate(test_image, n_plates=3, dust_threshold=5, return_data=True)
        assert "composite" in result

class TestV6:
    def test_separate(self, test_image):
        import separate_v6
        result = separate_v6.separate(test_image, n_plates=3, dust_threshold=5, return_data=True)
        assert "composite" in result

class TestV7:
    def test_separate(self, test_image):
        try:
            import separate_v7
            result = separate_v7.separate(test_image, n_plates=3, dust_threshold=5, return_data=True)
            assert "composite" in result
        except ImportError:
            pytest.skip("pydensecrf not installed")

class TestV8:
    @pytest.mark.xfail(reason="v8 has known bilateral variable bug")
    def test_separate(self, test_image):
        try:
            import separate_v8
            result = separate_v8.separate(test_image, n_plates=3, dust_threshold=5, return_data=True, upscale=False)
            result = separate_v8.separate(test_image, n_plates=3, dust_threshold=5, return_data=True, upscale=False)
            assert "composite" in result
        except ImportError:
            pytest.skip("pydensecrf not installed")

class TestV9:
    def test_separate(self, test_image):
        import separate_v9
        result = separate_v9.separate(test_image, n_plates=3, dust_threshold=5,
                                       return_data=True, upscale=False)
        assert "composite" in result

class TestV10:
    def test_separate(self, test_image):
        import separate_v10
        result = separate_v10.separate(test_image, n_plates=3, dust_threshold=5,
                                        return_data=True, upscale=False)
        assert "composite" in result
