<div align="center">

# color.separator

[![CI](https://github.com/ReidSurmeier/color-separator/actions/workflows/ci.yml/badge.svg)](https://github.com/ReidSurmeier/color-separator/actions/workflows/ci.yml)
[![Codecov](https://codecov.io/gh/ReidSurmeier/color-separator/branch/master/graph/badge.svg)](https://codecov.io/gh/ReidSurmeier/color-separator)
[![FOSSA](https://app.fossa.com/api/projects/git%2Bgithub.com%2FReidSurmeier%2Fcolor-separator.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2FReidSurmeier%2Fcolor-separator)
[![Live](https://img.shields.io/badge/live-tools.reidsurmeier.wtf-black?style=flat-square)](https://tools.reidsurmeier.wtf/color-separator)
[![Versions](https://img.shields.io/badge/algorithms-20-blue?style=flat-square)](#algorithms)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.135-009688?style=flat-square)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=flat-square)](https://python.org)
[![SAM](https://img.shields.io/badge/SAM-2.1-purple?style=flat-square)](https://segment-anything.com)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)

Digital color separation for woodblock, CNC, and silkscreen printing.

</div>

Upload an image. Pick how many colors. Get individual plate files for each ink color. One plate = one color = one block. The tool does the hard part of deciding which pixels belong to which plate.

## [Try it](https://tools.reidsurmeier.wtf/color-separator)

## Overview

Area | What color.separator provides
--- | ---
Color quantization | K-means++ clustering in CIELAB perceptual color space
Object segmentation | SAM 2.1 (Segment Anything Model) for object-aware plate boundaries
Upscaling | Real-ESRGAN 4x for enhanced detail before separation
Edge detection | Canny + CRF refinement for preserving linework
Hole filling | Guided filter + diff-based correction against source image
Line preservation | Adaptive thresholding + HSV-aware stroke detection

## How it works

1. Image is optionally upscaled 2x with Real-ESRGAN
2. SAM 2.1 segments the image into object regions (v15+)
3. Colors are quantized per-region using MiniBatchKMeans in CIELAB
4. Label map is refined with guided filter (fills holes, respects edges)
5. Diff against original identifies remaining gaps and corrects them
6. Each plate is cleaned with connected-component dust removal
7. Output: composite preview + individual plate PNGs + SVGs in a ZIP

## Stack

Component | Technology
--- | ---
Frontend | Next.js 16, React 19, TypeScript
Backend | Python 3.12, FastAPI, uvicorn (2 workers)
Separation | K-means++ (CIELAB), MiniBatchKMeans, SLIC superpixels
Segmentation | SAM 2.1 tiny (Meta AI, CPU inference)
Upscaling | Real-ESRGAN (RRDB, 4x, GPU)
Smoothing | bilateral filter, mean-shift clustering, guided filter
Edge detection | Canny + CRF refinement
Line detection | adaptive thresholding, HSV saturation analysis
Hosting | Linux, systemd, Cloudflare tunnel

## Algorithms

20 iterations, each building on the last:

Version | Method | Speed
--- | --- | ---
v2 | CIELAB K-means++, label map cleanup, chroma boost | ~2s
v3 | Key block extraction first, spatial clustering (Taohuawu paper) | ~3s
v4 | Real-ESRGAN 4x upscale + AI quality assessment | ~40s
v5 | Targeted line noise removal, sharp edges | ~2s
v6 | SLIC superpixel separation, zero line noise | ~4s
v7-v8 | CRF smoothing + bilateral filter | ~3s
v9-v10 | Edge-preserving smoothing + mean-shift | ~3s
v11 | Plate merging with ΔE suggestions, result caching | ~4s
v12 | Vectorized cdist + MiniBatchKMeans (2.5x faster) | ~1.7s
v13 | Raw pixels + Canny edges (detail preservation mode) | ~2s
v14 | Two-pass gradient-aware fusion (smooth + detail) | ~4s
v15 | SAM 2.1 object-aware separation | ~5s
v16 | SAM + morphological closing | ~30s
v17 | SAM + line detection + color-aware post-processing | ~30s
v18 | SAM + local contrast detection + two-pass fill | ~30s
v19 | SAM + guided filter (neutral plates only) | ~30s
v20 | SAM + guided filter + diff-based hole correction | ~30s

## Run locally

```bash
# Frontend
npm install
npm run dev

# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8001 --workers 2

# SAM model (auto-downloads on first v15+ run)
# Real-ESRGAN weights go in backend/weights/
```

Frontend proxies `/api/*` to the backend via Next.js rewrites.

## Project layout

```
src/app/              Next.js pages (homepage + color separator)
src/lib/              TypeScript utilities, API client, types
backend/              Python FastAPI backend
backend/separate_*.py Algorithm versions (v2 through v20)
backend/main.py       API endpoints
public/               Static assets, fonts, screenshots
```

## References

- [Digital Restoration of Taohuawu Woodblock New Year Prints](https://www.mdpi.com/2076-3417/15/16/9081) (MDPI 2025)
- [Efficient Color Quantization Using Superpixels](https://www.mdpi.com/1424-8220/22/16/6043) (MDPI Sensors 2022)
- [Segment Anything Model](https://segment-anything.com) (Meta AI)
- [Fast Soft Color Segmentation](https://arxiv.org/abs/2004.08096) (CVPR 2020)

## Author

Reid Surmeier · [reidsurmeier.wtf](https://reidsurmeier.wtf) · [@reidsurmeier](https://instagram.com/reidsurmeier) · [are.na](https://www.are.na/reid-surmeier/channels)
