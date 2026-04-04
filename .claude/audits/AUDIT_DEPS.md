# Dependency & CI/CD Audit -- woodblock-tools (color.separator)

**Audit date:** 2026-04-03
**Auditor:** Claude Opus 4.6

## Summary

| Category | Critical | High | Medium | Low |
|----------|----------|------|--------|-----|
| CI/CD | 0 | 2 | 2 | 1 |
| Backend Deps | 1 | 1 | 1 | 0 |
| Frontend Deps | 0 | 0 | 2 | 1 |
| Production Readiness | 0 | 1 | 2 | 0 |
| **Total** | **1** | **4** | **7** | **2** |

---

## 1. CI/CD Analysis

**File:** `.github/workflows/ci.yml`

### What the pipeline does well

- Runs on both push to master and pull requests (lint, build, tests).
- Has a dedicated `security` job with Gitleaks, npm audit, pip-audit, license-checker, and Trivy FS scan.
- Backend tests run with pytest + coverage, uploaded to Codecov.
- Frontend runs lint + build as a quality gate.

### Findings

#### HIGH -- CI-001: GitHub Actions not pinned to SHA

All action references use mutable tags (`@v4`, `@v5`, `@v2`, `@master`):

```yaml
actions/checkout@v4
actions/setup-node@v4
actions/setup-python@v5
codecov/codecov-action@v4
gitleaks/gitleaks-action@v2
aquasecurity/trivy-action@master    # worst offender -- tracks HEAD
```

**Risk:** A compromised or force-pushed tag can inject malicious code into every CI run.
**Fix:** Pin to full commit SHAs. Example:
```yaml
- uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
```

#### HIGH -- CI-002: All security checks use `continue-on-error: true` or `|| true`

Every security tool is configured to never fail the build:
- `gitleaks-action` has `continue-on-error: true`
- `npm audit` has `|| true`
- `pip-audit` has `|| true`
- `license-checker` has `|| true`
- Trivy has `exit-code: '0'`

**Risk:** Vulnerabilities and leaked secrets are reported but never block merges. The security job is purely informational.
**Fix:** At minimum, make Gitleaks and Trivy fail on CRITICAL findings. Remove `|| true` from `pip-audit` or set `--desc` to ignore known acceptable issues explicitly.

#### MEDIUM -- CI-003: No Dockerfile-specific CI steps

There are three Dockerfiles (`Dockerfile.frontend`, `backend/Dockerfile.local`, `backend/Dockerfile.serverless`) but CI does not:
- Build and test Docker images.
- Run Trivy/Grype container image scans.
- Lint Dockerfiles with hadolint.

**Fix:** Add a `docker` job that builds images and runs `trivy image` against them.

#### MEDIUM -- CI-004: Flake8 only lints `backend/main.py`

```yaml
flake8 backend/main.py --max-line-length=120 --ignore=E501,W503,E402,E722,F401
```

This ignores all other Python files (20+ `separate_*.py` modules, `serverless_handler.py`, test files). The ignore list is also very permissive (bare except, import order, unused imports all allowed).
**Fix:** Run `flake8 backend/ --max-line-length=120` and tighten the ignore list.

#### LOW -- CI-005: Node version mismatch

`package.json` declares `"engines": { "node": ">=24" }` but CI uses `node-version: '22'`. The build succeeds because npm does not enforce engines by default, but this is inconsistent.
**Fix:** Either update CI to Node 24 or relax the engine requirement to `>=22`.

---

## 2. Backend Dependencies (Python)

**File:** `backend/requirements.txt`

### Findings

#### CRITICAL -- DEP-001: No version pinning at all

```
numpy
Pillow
pillow-heif
scikit-learn
scikit-image
scipy
opencv-python-headless
fastapi
uvicorn[standard]
python-multipart
httpx
psutil
slowapi
```

Every package is unpinned. A fresh `pip install` will grab whatever is latest, which means:
- Builds are not reproducible.
- A breaking or malicious release of any package will silently enter production.
- The Dockerfiles also install additional unpinned packages inline: `slowapi ultralytics realesrgan basicsr`.

**Fix (immediate):** Generate a pinned file:
```bash
cd backend && pip freeze > requirements.lock
```
Use `requirements.lock` in Dockerfiles and CI. Keep `requirements.txt` as the loose specification.

#### HIGH -- DEP-002: Potential vulnerability exposure from unpinned Pillow and httpx

Without pinning, there is no way to verify which version is deployed. Pillow has had multiple critical CVEs in the past 12 months (e.g., buffer overflows in image decoders). httpx has had SSRF-related advisories. With unpinned deps these could be any version.
**Fix:** Pin versions and run `pip-audit` against the pinned file.

#### MEDIUM -- DEP-003: Dockerfile installs packages not in requirements.txt

`Dockerfile.local` and `Dockerfile.serverless` both run:
```
pip install --no-cache-dir slowapi ultralytics realesrgan basicsr
```
`slowapi` is already in `requirements.txt`, so it is installed twice. `ultralytics`, `realesrgan`, and `basicsr` are not listed at all but are production dependencies.
**Fix:** Add all runtime dependencies to `requirements.txt` with pinned versions.

---

## 3. Frontend Dependencies (Node.js)

**File:** `package.json`

### Findings

Most dependencies use caret ranges (`^`), which is standard for Node.js projects. Two packages are exact-pinned:

| Package | Version | Pinned? |
|---------|---------|---------|
| next | 16.2.1 | exact |
| react | 19.2.4 | exact |
| react-dom | 19.2.4 | exact |
| framer-motion | ^12.38.0 | caret |
| jszip | ^3.10.1 | caret |
| lucide-react | ^1.6.0 | caret |
| shadcn | ^4.1.0 | caret |
| others | ^X.Y.Z | caret |

The `package-lock.json` exists (seen in workspace git status), which provides reproducibility via `npm ci`. This is acceptable.

#### MEDIUM -- DEP-004: `path-to-regexp` override suggests a known vulnerability was patched manually

```json
"overrides": {
  "path-to-regexp": "8.4.1"
}
```

This override was likely added to fix CVE-2024-45296 (ReDoS in path-to-regexp). The override is a valid mitigation, but it should be documented and periodically checked to see if the upstream dependency (Next.js) has updated its own dependency, making the override unnecessary.

#### MEDIUM -- DEP-005: `shadcn` listed as a runtime dependency

`shadcn` (v4.1.0) is a CLI tool for scaffolding UI components. It should be a devDependency or not in `package.json` at all (use `npx shadcn` on demand). Including it in `dependencies` adds unnecessary weight to the production bundle.
**Fix:** Move to `devDependencies` or remove.

#### LOW -- DEP-006: Wide caret ranges on major-0 packages

All caret ranges point to packages at v1+ or higher, so caret ranges are safe (no breaking changes within major). No issues here -- this is informational.

---

## 4. Production Readiness

### Findings

#### HIGH -- PROD-001: No `.env.example` file

The project uses environment variables (`BACKEND_URL`, `PORT`, `HOSTNAME`, `GPU_MODE`, `SAM_WEIGHTS`) set in Docker files and `docker-compose.local.yml`, but there is no `.env.example` documenting what variables are expected, which are required, and what their defaults are. An `.env.local` file exists but is not checked in.

**Fix:** Create `.env.example`:
```env
# Frontend
BACKEND_URL=http://localhost:8001
PORT=3003
HOSTNAME=0.0.0.0

# Backend
GPU_MODE=0
SAM_WEIGHTS=
PYTHONUNBUFFERED=1
```

#### MEDIUM -- PROD-002: No Docker deployment documentation in README

The README documents `npm run dev` and `uvicorn` for local development but does not mention Docker at all, despite having three Dockerfiles and a compose file. A contributor would not know Docker deployment exists.
**Fix:** Add a "Docker" section to README covering `docker compose -f docker-compose.local.yml up --build`.

#### MEDIUM -- PROD-003: Dockerfile.local runs as root

`Dockerfile.serverless` correctly creates a non-root user (`appuser`) and uses `USER appuser`. `Dockerfile.local` does not -- the container runs as root.
**Fix:** Add the same `useradd` + `USER` directives to `Dockerfile.local`.

---

## Recommendations by Priority

### Immediate (this week)

1. **Pin all Python dependencies** with exact versions in a lockfile. This is the single highest-impact fix.
2. **Pin GitHub Actions to SHA** to prevent supply-chain attacks via tag manipulation.
3. **Make at least Gitleaks fail CI** on findings (remove `continue-on-error`).

### Short-term (this month)

4. Add Docker image build + scan to CI.
5. Create `.env.example` and document Docker deployment in README.
6. Run `flake8` on the entire `backend/` directory, not just `main.py`.
7. Run container as non-root in `Dockerfile.local`.
8. Move `shadcn` to devDependencies.

### Maintenance (ongoing)

9. Review `path-to-regexp` override on each Next.js upgrade.
10. Run `pip-audit` and `npm audit` with blocking thresholds (not `|| true`).
11. Periodically regenerate the Python lockfile and check for new CVEs.
