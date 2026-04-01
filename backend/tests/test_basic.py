"""Basic import and sanity tests for color separator backend."""
import sys
import os
import pytest
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

def test_import_v2():
    import separate_v2
    assert hasattr(separate_v2, 'separate')

def test_import_v11():
    import separate_v11
    assert hasattr(separate_v11, 'separate')
    assert hasattr(separate_v11, 'build_preview_response')

def test_import_v12():
    import separate_v12
    assert hasattr(separate_v12, 'separate')

def test_import_main():
    try:
        import main
        assert hasattr(main, 'app')
    except ImportError:
        pytest.skip("optional dependency missing")

def test_get_module():
    try:
        from main import get_module
        for v in ['v2', 'v11', 'v12']:
            mod = get_module(v)
            assert mod is not None
    except ImportError:
        pytest.skip("optional dependency missing")

def test_color_utils():
    from skimage.color import rgb2lab
    import numpy as np
    red = np.array([[[1.0, 0.0, 0.0]]])
    lab = rgb2lab(red)
    assert lab.shape == (1, 1, 3)
    assert lab[0, 0, 0] > 0

def test_kmeans_basic():
    from sklearn.cluster import MiniBatchKMeans
    import numpy as np
    data = np.array([[0,0,0],[1,1,1],[0.5,0,0],[0,0.5,0]], dtype=np.float64)
    km = MiniBatchKMeans(n_clusters=2, random_state=42)
    km.fit(data)
    assert len(km.cluster_centers_) == 2
