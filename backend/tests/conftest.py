"""Shared fixtures and CI-aware markers for the test suite."""
import os
import pytest

# Detect CI environment (GitHub Actions, GitLab CI, etc.)
IN_CI = os.environ.get("CI", "").lower() in ("true", "1") or os.environ.get("GITHUB_ACTIONS") == "true"


def pytest_collection_modifyitems(config, items):
    """Skip GPU/model-weight tests when running in CI."""
    if not IN_CI:
        return
    skip_ci = pytest.mark.skip(reason="Requires GPU or model weights – skipped in CI")
    for item in items:
        if "gpu" in item.keywords:
            item.add_marker(skip_ci)
