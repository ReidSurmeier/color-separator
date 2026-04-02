# woodblock-tools — CLAUDE.md

Color separation tool for CNC woodblock printing. Splits images into flat color plates using K-means++ clustering, Canny edge detection, and optionally SAM2 object segmentation.

## Project Structure

```
woodblock-tools/
├── src/app/color-separator/   # Main UI — page.tsx, components
├── src/lib/api.ts             # All fetch calls — buildFormData(), fetchPreview(), fetchUpscale()
├── backend/main.py            # FastAPI — all endpoints, semaphore, memory checks
├── backend/separate_v*.py     # One file per algorithm version (v2–v20)
├── next.config.ts             # Proxy rewrites /api/* → backend :8001
└── .next/standalone/          # Production build output
```

## Services

- Frontend: `systemctl --user status woodblock-frontend.service` → port 3003 → tools.reidsurmeier.wtf
- Backend: `systemctl --user status woodblock-backend.service` → port 8001
- After ANY backend change: `systemctl --user restart woodblock-backend.service`
- After ANY frontend change: `npm run build && cp -r .next/static .next/standalone/.next/static && cp -r public .next/standalone/public && systemctl --user restart woodblock-frontend.service`

## Critical Rules

1. **Never use `next start`** — output is `standalone`. Always `node .next/standalone/server.js`
2. **buildFormData() in api.ts** must have a case for EVERY version (v2–v20). Missing case = backend uses wrong defaults = OOM or wrong output.
3. **v20 uses SAM2** — 10GB+ RAM peak. Pre-flight memory check in main.py guards this. Don't disable it.
4. **release_sam() is a no-op intentionally** — SAM stays cached after first load. Releasing it causes MORE OOMs (reloads every request). Do not "fix" this.
5. **uvicorn workers** — after OOM kill, workers may have stale code. Always restart both services.

## Algorithm Versions

- **v2–v8**: K-means variants (fast, <1s)
- **v9–v14**: K-means + edge detection/DBSCAN hybrids
- **v15–v19**: SAM-assisted (slow, ~5-10s, needs memory check)
- **v20**: Full SAM2 + RealESRGAN (slowest, ~15s CPU, needs 10GB+ RAM)

## API Endpoints (backend/main.py)

- `POST /separate` — main separation
- `POST /separate/v{N}` — version-specific
- `POST /merge` — merge two plates (version-aware via VERSION_MAP)
- `GET /api/health` — RAM, swap, SAM cache status
- `POST /upscale` — RealESRGAN upscale

## Current Constraints (16GB RAM machine)

- v20 upscale disabled (OOM)
- `_heavy_semaphore = Semaphore(1)` — one SAM request at a time
- Memory threshold: 11GB uncached / 4GB cached SAM

## Testing

```bash
cd backend && python -m pytest tests/ -v
```

CI runs on every push (GitHub Actions). Coverage ~30%.

## Deployment Quick Reference

```bash
cd ~/sites/woodblock-tools
npm run build
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public
systemctl --user restart woodblock-frontend.service woodblock-backend.service
curl -s https://tools.reidsurmeier.wtf/api/health | python3 -m json.tool
```
