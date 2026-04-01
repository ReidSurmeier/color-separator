"""
FastAPI backend for woodblock color separation.
Run: uvicorn main:app --host 0.0.0.0 --port 8001 --reload
"""
import asyncio
import gc
import json
import io
import base64
import os
import shutil
import time
from PIL import Image
import numpy as np
import psutil
from fastapi import FastAPI, File, Form, UploadFile

# HEIF/HEIC image support
try:
    import pillow_heif
    pillow_heif.register_heif_opener()
except ImportError:
    pass

# Concurrency limit: only 1 heavy (v15+) request at a time to prevent OOM
_heavy_semaphore = asyncio.Semaphore(1)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, JSONResponse
from starlette.responses import StreamingResponse

import separate as v3
import separate_v2 as v2
import separate_v4 as v4
import separate_v5 as v5
import separate_v6 as v6
try:
    import separate_v7 as v7
except ImportError:
    v7 = None  # pydensecrf not available in CI
try:
    import separate_v8 as v8
except ImportError:
    v8 = None
import separate_v9 as v9
import separate_v10 as v10
import separate_v11 as v11
import separate_v12 as v12
import separate_v13 as v13
import separate_v14 as v14
try:
    import separate_v15 as v15
    import separate_v16 as v16
    import separate_v17 as v17
    import separate_v18 as v18
    import separate_v19 as v19
    import separate_v20 as v20
except ImportError:
    v15 = v16 = v17 = v18 = v19 = v20 = None
try:
    import auto_optimize
except ImportError:
    auto_optimize = None


MAX_UPLOAD_BYTES = 50 * 1024 * 1024  # 50MB
Image.MAX_IMAGE_PIXELS = 50_000_000  # Prevent decompression bombs


async def validate_upload(image_bytes: bytes):
    """Validate uploaded image. Returns error response or None if valid."""
    if len(image_bytes) > MAX_UPLOAD_BYTES:
        return JSONResponse(status_code=413, content={"error": "File too large. Max 50MB."})
    try:
        img = Image.open(io.BytesIO(image_bytes))
        img.load()  # Force decode without corrupting stream
    except Exception:
        return JSONResponse(status_code=400, content={"error": "Invalid image file."})
    return None

app = FastAPI(title="Woodblock Color Separation API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://tools.reidsurmeier.wtf", "http://localhost:3003"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def parse_locked_colors(raw: str | None) -> list[list[int]] | None:
    if not raw:
        return None
    try:
        colors = json.loads(raw)
        if isinstance(colors, list) and len(colors) > 0:
            return colors
    except (json.JSONDecodeError, TypeError):
        pass
    return None


VERSION_MAP = {
    k: mod for k, mod in {
        "v2": v2, "v3": v3, "v4": v4, "v5": v5, "v6": v6,
        "v7": v7, "v8": v8, "v9": v9, "v10": v10, "v11": v11,
        "v12": v12, "v13": v13, "v14": v14, "v15": v15, "v16": v16,
        "v17": v17, "v18": v18, "v19": v19, "v20": v20,
    }.items() if mod is not None
}


def get_module(version: str):
    return VERSION_MAP.get(version, v20)  # default to v20 (best)

    if version == "v10":
        return v10
    if version == "v9":
        return v9
    if version == "v8":
        return v8
    if version == "v7":
        return v7
    if version == "v6":
        return v6
    if version == "v5":
        return v5
    if version == "v4":
        return v4
    if version == "v2":
        return v2
    return v11


SAM_VERSIONS = ("v15", "v16", "v17", "v18", "v19", "v20")


def check_memory_for_sam():
    """Check if enough memory is available for SAM processing.
    Returns (ok: bool, message: str)"""
    mem = psutil.virtual_memory()
    swap = psutil.swap_memory()
    available_gb = (mem.available + swap.free) / (1024**3)

    # SAM needs ~10GB peak, but if model is already cached, needs much less
    sam_cached = False
    try:
        from separate_v20 import _sam_model
        sam_cached = _sam_model is not None
    except ImportError:
        pass

    required_gb = 3.0 if sam_cached else 8.0

    if available_gb < required_gb:
        return False, f"Insufficient memory: {available_gb:.1f}GB available, need {required_gb:.1f}GB. System has 16GB total."
    return True, "OK"


@app.get("/api/health")
async def health():
    mem = psutil.virtual_memory()
    swap = psutil.swap_memory()
    sam_cached = False
    try:
        from separate_v20 import _sam_model
        sam_cached = _sam_model is not None
    except ImportError:
        pass
    return {
        "status": "ok",
        "memory": {
            "total_gb": round(mem.total / 1024**3, 1),
            "available_gb": round(mem.available / 1024**3, 1),
            "used_pct": mem.percent,
            "swap_free_gb": round(swap.free / 1024**3, 1),
        },
        "sam_cached": sam_cached,
    }


@app.post("/api/preview")
async def preview(
    image: UploadFile = File(...),
    plates: int = Form(3),
    dust: int = Form(20),
    use_edges: bool = Form(True),
    edge_sigma: float = Form(1.5),
    locked_colors: str | None = Form(None),
    version: str = Form("v3"),
    upscale: bool = Form(True),
    median_size: int = Form(5),
    chroma_boost: float = Form(1.3),
    shadow_threshold: int = Form(8),
    highlight_threshold: int = Form(95),
    n_segments: int = Form(3000),
    compactness: int = Form(15),
    crf_spatial: int = Form(3),
    crf_color: int = Form(13),
    crf_compat: int = Form(10),
    sigma_s: float = Form(100),
    sigma_r: float = Form(0.5),
    meanshift_sp: int = Form(15),
    meanshift_sr: int = Form(30),
    detail_strength: float = Form(0.5),
):
    image_bytes = await image.read()
    err = await validate_upload(image_bytes)
    if err is not None:
        return err
    locked = parse_locked_colors(locked_colors)
    mod = get_module(version)

    kwargs: dict = dict(
        image_bytes=image_bytes, plates=plates, dust=dust,
        use_edges=use_edges, edge_sigma=edge_sigma, locked_colors=locked,
    )
    if version == "v4":
        kwargs["upscale"] = upscale
        kwargs["median_size"] = median_size
        kwargs["chroma_boost"] = chroma_boost
        kwargs["shadow_threshold"] = shadow_threshold
        kwargs["highlight_threshold"] = highlight_threshold
    if version == "v6":
        kwargs["n_segments"] = n_segments
        kwargs["compactness"] = compactness
        kwargs["chroma_boost"] = chroma_boost
        kwargs["upscale"] = upscale
        kwargs["shadow_threshold"] = shadow_threshold
        kwargs["highlight_threshold"] = highlight_threshold
    if version == "v7":
        kwargs["crf_spatial"] = crf_spatial
        kwargs["crf_color"] = crf_color
        kwargs["crf_compat"] = crf_compat
        kwargs["chroma_boost"] = chroma_boost
        kwargs["shadow_threshold"] = shadow_threshold
        kwargs["highlight_threshold"] = highlight_threshold
    if version == "v8":
        kwargs["crf_spatial"] = crf_spatial
        kwargs["crf_color"] = crf_color
        kwargs["crf_compat"] = crf_compat
        kwargs["chroma_boost"] = chroma_boost
        kwargs["shadow_threshold"] = shadow_threshold
        kwargs["highlight_threshold"] = highlight_threshold
        kwargs["upscale"] = upscale
    if version == "v9":
        kwargs["sigma_s"] = sigma_s
        kwargs["sigma_r"] = sigma_r
        kwargs["meanshift_sp"] = meanshift_sp
        kwargs["meanshift_sr"] = meanshift_sr
        kwargs["chroma_boost"] = chroma_boost
        kwargs["upscale"] = upscale
    if version in ("v10", "v11", "v12"):
        kwargs["sigma_s"] = sigma_s
        kwargs["sigma_r"] = sigma_r
        kwargs["meanshift_sp"] = meanshift_sp
        kwargs["meanshift_sr"] = meanshift_sr
        kwargs["chroma_boost"] = chroma_boost
        kwargs["upscale"] = upscale
    if version == "v13":
        kwargs["shadow_threshold"] = shadow_threshold
        kwargs["highlight_threshold"] = highlight_threshold
        kwargs["median_size"] = median_size
        kwargs["chroma_boost"] = chroma_boost
        kwargs["upscale"] = upscale
    if version == "v14":
        kwargs["sigma_s"] = sigma_s
        kwargs["sigma_r"] = sigma_r
        kwargs["meanshift_sp"] = meanshift_sp
        kwargs["meanshift_sr"] = meanshift_sr
        kwargs["shadow_threshold"] = shadow_threshold
        kwargs["highlight_threshold"] = highlight_threshold
        kwargs["median_size"] = median_size
        kwargs["chroma_boost"] = chroma_boost
        kwargs["upscale"] = upscale
        kwargs["detail_strength"] = detail_strength
    if version in SAM_VERSIONS:
        kwargs["shadow_threshold"] = shadow_threshold
        kwargs["highlight_threshold"] = highlight_threshold
        kwargs["median_size"] = median_size
        kwargs["chroma_boost"] = chroma_boost
        kwargs["upscale"] = upscale
    if version == "v20":
        kwargs["upscale"] = False  # OOM risk on 16GB systems

    if version in SAM_VERSIONS:
        ok, msg = check_memory_for_sam()
        if not ok:
            return JSONResponse(status_code=503, content={"error": msg, "code": "MEMORY_LOW"})
        async with _heavy_semaphore:
            composite_bytes, manifest = mod.build_preview_response(**kwargs)
        gc.collect()
    else:
        composite_bytes, manifest = mod.build_preview_response(**kwargs)

    return Response(
        content=composite_bytes,
        media_type="image/png",
        headers={"X-Manifest": json.dumps(manifest)},
    )


@app.post("/api/preview-stream")
async def preview_stream(
    image: UploadFile = File(...),
    plates: int = Form(3),
    dust: int = Form(20),
    use_edges: bool = Form(True),
    edge_sigma: float = Form(1.5),
    locked_colors: str | None = Form(None),
    version: str = Form("v20"),
    upscale: bool = Form(True),
    median_size: int = Form(5),
    chroma_boost: float = Form(1.3),
    shadow_threshold: int = Form(8),
    highlight_threshold: int = Form(95),
    sigma_s: float = Form(100),
    sigma_r: float = Form(0.5),
    meanshift_sp: int = Form(15),
    meanshift_sr: int = Form(30),
    detail_strength: float = Form(0.5),
):
    """Stream progress events via SSE, then send final result."""
    image_bytes = await image.read()
    err = await validate_upload(image_bytes)
    if err is not None:
        return err
    locked = parse_locked_colors(locked_colors)
    mod = get_module(version)

    kwargs: dict = dict(
        image_bytes=image_bytes, plates=plates, dust=dust,
        use_edges=use_edges, edge_sigma=edge_sigma, locked_colors=locked,
    )
    if version in SAM_VERSIONS:
        kwargs["shadow_threshold"] = shadow_threshold
        kwargs["highlight_threshold"] = highlight_threshold
        kwargs["median_size"] = median_size
        kwargs["chroma_boost"] = chroma_boost
        kwargs["upscale"] = upscale
    elif version == "v14":
        kwargs["sigma_s"] = sigma_s
        kwargs["sigma_r"] = sigma_r
        kwargs["meanshift_sp"] = meanshift_sp
        kwargs["meanshift_sr"] = meanshift_sr
        kwargs["shadow_threshold"] = shadow_threshold
        kwargs["highlight_threshold"] = highlight_threshold
        kwargs["median_size"] = median_size
        kwargs["chroma_boost"] = chroma_boost
        kwargs["upscale"] = upscale
        kwargs["detail_strength"] = detail_strength
    elif version in ("v10", "v11", "v12"):
        kwargs["sigma_s"] = sigma_s
        kwargs["sigma_r"] = sigma_r
        kwargs["meanshift_sp"] = meanshift_sp
        kwargs["meanshift_sr"] = meanshift_sr
        kwargs["chroma_boost"] = chroma_boost
        kwargs["upscale"] = upscale
    if version == "v20":
        kwargs["upscale"] = False  # OOM risk on 16GB systems

    if version in SAM_VERSIONS:
        ok, msg = check_memory_for_sam()
        if not ok:
            return JSONResponse(status_code=503, content={"error": msg, "code": "MEMORY_LOW"})

    progress_events: list[dict] = []

    def on_progress(stage: str, pct: int):
        progress_events.append({"stage": stage, "pct": pct})

    kwargs["progress_callback"] = on_progress

    async def generate():
        import concurrent.futures
        loop = asyncio.get_event_loop()

        async with _heavy_semaphore:
            future = loop.run_in_executor(
                None, lambda: mod.build_preview_response(**kwargs)
            )

            sent = 0
            while not future.done():
                await asyncio.sleep(0.3)
                while sent < len(progress_events):
                    evt = progress_events[sent]
                    yield f"data: {json.dumps(evt)}\n\n"
                    sent += 1

            # Drain remaining
            while sent < len(progress_events):
                evt = progress_events[sent]
                yield f"data: {json.dumps(evt)}\n\n"
                sent += 1

            composite_bytes, manifest = future.result()

        gc.collect()

        img_b64 = base64.b64encode(composite_bytes).decode()
        yield f"data: {json.dumps({'stage': 'complete', 'pct': 100, 'manifest': manifest, 'image': img_b64})}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")


@app.post("/api/separate")
async def separate_endpoint(
    image: UploadFile = File(...),
    plates: int = Form(3),
    dust: int = Form(20),
    use_edges: bool = Form(True),
    edge_sigma: float = Form(1.5),
    locked_colors: str | None = Form(None),
    version: str = Form("v3"),
    upscale: bool = Form(True),
    median_size: int = Form(5),
    chroma_boost: float = Form(1.3),
    shadow_threshold: int = Form(8),
    highlight_threshold: int = Form(95),
    n_segments: int = Form(3000),
    compactness: int = Form(15),
    crf_spatial: int = Form(3),
    crf_color: int = Form(13),
    crf_compat: int = Form(10),
    sigma_s: float = Form(100),
    sigma_r: float = Form(0.5),
    meanshift_sp: int = Form(15),
    meanshift_sr: int = Form(30),
    detail_strength: float = Form(0.5),
):
    image_bytes = await image.read()
    err = await validate_upload(image_bytes)
    if err is not None:
        return err
    locked = parse_locked_colors(locked_colors)
    mod = get_module(version)

    kwargs: dict = dict(
        image_bytes=image_bytes, plates=plates, dust=dust,
        use_edges=use_edges, edge_sigma=edge_sigma, locked_colors=locked,
    )
    if version == "v4":
        kwargs["upscale"] = upscale
        kwargs["median_size"] = median_size
        kwargs["chroma_boost"] = chroma_boost
        kwargs["shadow_threshold"] = shadow_threshold
        kwargs["highlight_threshold"] = highlight_threshold
    if version == "v6":
        kwargs["n_segments"] = n_segments
        kwargs["compactness"] = compactness
        kwargs["chroma_boost"] = chroma_boost
        kwargs["upscale"] = upscale
        kwargs["shadow_threshold"] = shadow_threshold
        kwargs["highlight_threshold"] = highlight_threshold
    if version == "v7":
        kwargs["crf_spatial"] = crf_spatial
        kwargs["crf_color"] = crf_color
        kwargs["crf_compat"] = crf_compat
        kwargs["chroma_boost"] = chroma_boost
        kwargs["shadow_threshold"] = shadow_threshold
        kwargs["highlight_threshold"] = highlight_threshold
    if version == "v8":
        kwargs["crf_spatial"] = crf_spatial
        kwargs["crf_color"] = crf_color
        kwargs["crf_compat"] = crf_compat
        kwargs["chroma_boost"] = chroma_boost
        kwargs["shadow_threshold"] = shadow_threshold
        kwargs["highlight_threshold"] = highlight_threshold
        kwargs["upscale"] = upscale
    if version == "v9":
        kwargs["sigma_s"] = sigma_s
        kwargs["sigma_r"] = sigma_r
        kwargs["meanshift_sp"] = meanshift_sp
        kwargs["meanshift_sr"] = meanshift_sr
        kwargs["chroma_boost"] = chroma_boost
        kwargs["upscale"] = upscale
    if version in ("v10", "v11", "v12"):
        kwargs["sigma_s"] = sigma_s
        kwargs["sigma_r"] = sigma_r
        kwargs["meanshift_sp"] = meanshift_sp
        kwargs["meanshift_sr"] = meanshift_sr
        kwargs["chroma_boost"] = chroma_boost
        kwargs["upscale"] = upscale
    if version == "v13":
        kwargs["shadow_threshold"] = shadow_threshold
        kwargs["highlight_threshold"] = highlight_threshold
        kwargs["median_size"] = median_size
        kwargs["chroma_boost"] = chroma_boost
        kwargs["upscale"] = upscale
    if version == "v14":
        kwargs["sigma_s"] = sigma_s
        kwargs["sigma_r"] = sigma_r
        kwargs["meanshift_sp"] = meanshift_sp
        kwargs["meanshift_sr"] = meanshift_sr
        kwargs["shadow_threshold"] = shadow_threshold
        kwargs["highlight_threshold"] = highlight_threshold
        kwargs["median_size"] = median_size
        kwargs["chroma_boost"] = chroma_boost
        kwargs["upscale"] = upscale
        kwargs["detail_strength"] = detail_strength
    if version in SAM_VERSIONS:
        kwargs["shadow_threshold"] = shadow_threshold
        kwargs["highlight_threshold"] = highlight_threshold
        kwargs["median_size"] = median_size
        kwargs["chroma_boost"] = chroma_boost
        kwargs["upscale"] = upscale
    if version == "v20":
        kwargs["upscale"] = False  # OOM risk on 16GB systems

    if version in SAM_VERSIONS:
        ok, msg = check_memory_for_sam()
        if not ok:
            return JSONResponse(status_code=503, content={"error": msg, "code": "MEMORY_LOW"})
        async with _heavy_semaphore:
            zip_bytes = mod.build_zip_response(**kwargs)
        gc.collect()
    else:
        zip_bytes = mod.build_zip_response(**kwargs)

    return Response(
        content=zip_bytes,
        media_type="application/zip",
        headers={"Content-Disposition": "attachment; filename=woodblock-plates.zip"},
    )


@app.post("/api/upscale")
async def upscale_endpoint(image: UploadFile = File(...)):
    """Pre-upscale an image and cache it for later processing."""
    image_bytes = await image.read()
    err = await validate_upload(image_bytes)
    if err is not None:
        return err
    img_hash, cached, success = v11.upscale_and_cache(image_bytes)
    return Response(
        content=json.dumps({"hash": img_hash, "cached": cached, "upscaled": success}),
        media_type="application/json",
    )


@app.post("/api/merge")
async def merge_endpoint(
    image: UploadFile = File(...),
    merge_pairs: str = Form(...),
    plates: int = Form(3),
    dust: int = Form(20),
    locked_colors: str | None = Form(None),
    version: str = Form("v11"),
    upscale: bool = Form(True),
    chroma_boost: float = Form(1.3),
    sigma_s: float = Form(100),
    sigma_r: float = Form(0.5),
    meanshift_sp: int = Form(15),
    meanshift_sr: int = Form(30),
    img_hash: str | None = Form(None),
):
    """Run separation then merge specified plate pairs."""
    image_bytes = await image.read()
    err = await validate_upload(image_bytes)
    if err is not None:
        return err
    locked = parse_locked_colors(locked_colors)
    pairs = json.loads(merge_pairs)

    merge_mod = VERSION_MAP.get(version, v11)

    if version == "v20":
        upscale = False  # OOM risk on 16GB systems

    if version in SAM_VERSIONS:
        ok, msg = check_memory_for_sam()
        if not ok:
            return JSONResponse(status_code=503, content={"error": msg, "code": "MEMORY_LOW"})
        async with _heavy_semaphore:
            composite_bytes, manifest = merge_mod.build_merge_response(
                image_bytes=image_bytes,
                merge_pairs=pairs,
                plates=plates,
                dust=dust,
                locked_colors=locked,
                chroma_boost=chroma_boost,
                sigma_s=sigma_s,
                sigma_r=sigma_r,
                meanshift_sp=meanshift_sp,
                meanshift_sr=meanshift_sr,
                upscale=upscale,
                img_hash=img_hash,
            )
        gc.collect()
    else:
        composite_bytes, manifest = merge_mod.build_merge_response(
            image_bytes=image_bytes,
            merge_pairs=pairs,
            plates=plates,
            dust=dust,
            locked_colors=locked,
            chroma_boost=chroma_boost,
            sigma_s=sigma_s,
            sigma_r=sigma_r,
            meanshift_sp=meanshift_sp,
            meanshift_sr=meanshift_sr,
            upscale=upscale,
            img_hash=img_hash,
        )

    return Response(
        content=composite_bytes,
        media_type="image/png",
        headers={"X-Manifest": json.dumps(manifest)},
    )


@app.post("/api/plates")
async def plates_endpoint(
    image: UploadFile = File(...),
    plates: int = Form(3),
    dust: int = Form(20),
    version: str = Form("v11"),
    upscale: bool = Form(True),
    chroma_boost: float = Form(1.3),
    sigma_s: float = Form(100),
    sigma_r: float = Form(0.5),
    meanshift_sp: int = Form(15),
    meanshift_sr: int = Form(30),
    locked_colors: str | None = Form(None),
):
    """Return JSON with base64-encoded plate thumbnail images (400px max)."""
    image_bytes = await image.read()
    err = await validate_upload(image_bytes)
    if err is not None:
        return err
    if len(image_bytes) > 50 * 1024 * 1024:
        return JSONResponse(status_code=413, content={"error": "File too large. Maximum 50MB."})
    locked = parse_locked_colors(locked_colors)
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img.load()
    except Exception:
        return JSONResponse(status_code=400, content={"error": "Invalid image file"})

    max_dim = 800
    if max(img.size) > max_dim:
        ratio = max_dim / max(img.size)
        img = img.resize((int(img.size[0] * ratio), int(img.size[1] * ratio)), Image.LANCZOS)

    plates = min(max(int(plates), 2), 35)
    arr = np.array(img)
    mod = get_module(version)
    kwargs = dict(
        n_plates=plates, dust_threshold=dust,
        locked_colors=locked, return_data=True,
        chroma_boost=chroma_boost,
        upscale=False,
    )
    # Add version-specific params
    if version in ("v9", "v10", "v11", "v12", "v14"):
        kwargs.update(sigma_s=sigma_s, sigma_r=sigma_r, meanshift_sp=meanshift_sp, meanshift_sr=meanshift_sr)
    if version in SAM_VERSIONS:
        kwargs.update(use_edges=True, edge_sigma=1.5, shadow_threshold=8, highlight_threshold=95, median_size=3)

    if version in SAM_VERSIONS:
        ok, msg = check_memory_for_sam()
        if not ok:
            return JSONResponse(status_code=503, content={"error": msg, "code": "MEMORY_LOW"})
        async with _heavy_semaphore:
            result = mod.separate(arr, **kwargs)
        gc.collect()
    else:
        result = mod.separate(arr, **kwargs)

    plate_images = []
    for plate_info in result["manifest"]["plates"]:
        name = plate_info["name"]
        plate_data = result["plates"][name]
        buf = io.BytesIO()
        plate_data["image"].save(buf, format="PNG")
        b64 = base64.b64encode(buf.getvalue()).decode("ascii")
        plate_images.append({
            "name": name,
            "color": plate_info["color"],
            "coverage": plate_info.get("coverage_pct", 0),
            "image": f"data:image/png;base64,{b64}",
        })

    return Response(
        content=json.dumps({"plates": plate_images}),
        media_type="application/json",
    )


@app.post("/api/auto-optimize")
async def auto_optimize_endpoint(
    image: UploadFile = File(...),
    plates: int = Form(8),
):
    """Trigger auto-optimization via OpenClaw. Returns job ID for polling."""
    image_bytes = await image.read()
    err = await validate_upload(image_bytes)
    if err is not None:
        return err
    status = auto_optimize.trigger_optimization(image_bytes, initial_plates=plates)
    return Response(
        content=json.dumps(status),
        media_type="application/json",
    )


@app.get("/api/auto-optimize/{job_id}")
async def auto_optimize_status(job_id: str):
    """Poll auto-optimization status."""
    status = auto_optimize.get_status(job_id)
    return Response(
        content=json.dumps(status),
        media_type="application/json",
    )
