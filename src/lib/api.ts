import type { Manifest, PreviewResult, SeparationParams, OptimizeIteration } from "./types";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";

// SAM versions that need GPU — now served by local GPU backend (no RunPod proxy needed)
const SAM_VERSIONS = ["v15", "v16", "v17", "v18", "v19", "v20"];

// GPU proxy disabled — local backend has GPU now
const USE_GPU_PROXY = false;

function getEndpoint(action: string, version: string): string {
  if (USE_GPU_PROXY && SAM_VERSIONS.includes(version)) {
    return `/api/gpu-proxy`;
  }
  return `${BACKEND_URL}/api/${action}`;
}

function buildGpuFormData(file: File, params: SeparationParams, action: string): FormData {
  const fd = buildFormData(file, params);
  fd.append("action", action);
  return fd;
}

function buildFormData(file: File, params: SeparationParams): FormData {
  const fd = new FormData();
  fd.append("image", file);
  fd.append("plates", String(params.plates));
  fd.append("dust", String(params.dust));
  fd.append("use_edges", String(params.useEdges));
  fd.append("edge_sigma", String(params.edgeSigma));
  fd.append("version", params.version);
  if (params.version === "v4") {
    if (params.upscale !== undefined) fd.append("upscale", String(params.upscale));
    if (params.medianSize !== undefined) fd.append("median_size", String(params.medianSize));
    if (params.chromaBoost !== undefined) fd.append("chroma_boost", String(params.chromaBoost));
    if (params.shadowThreshold !== undefined) fd.append("shadow_threshold", String(params.shadowThreshold));
    if (params.highlightThreshold !== undefined) fd.append("highlight_threshold", String(params.highlightThreshold));
  }
  if (params.version === "v6") {
    if (params.nSegments !== undefined) fd.append("n_segments", String(params.nSegments));
    if (params.compactness !== undefined) fd.append("compactness", String(params.compactness));
    if (params.chromaBoost !== undefined) fd.append("chroma_boost", String(params.chromaBoost));
    if (params.upscale !== undefined) fd.append("upscale", String(params.upscale));
    if (params.shadowThreshold !== undefined) fd.append("shadow_threshold", String(params.shadowThreshold));
    if (params.highlightThreshold !== undefined) fd.append("highlight_threshold", String(params.highlightThreshold));
  }
  if (params.version === "v7" || params.version === "v8") {
    if (params.crfSpatial !== undefined) fd.append("crf_spatial", String(params.crfSpatial));
    if (params.crfColor !== undefined) fd.append("crf_color", String(params.crfColor));
    if (params.crfCompat !== undefined) fd.append("crf_compat", String(params.crfCompat));
    if (params.chromaBoost !== undefined) fd.append("chroma_boost", String(params.chromaBoost));
    if (params.shadowThreshold !== undefined) fd.append("shadow_threshold", String(params.shadowThreshold));
    if (params.highlightThreshold !== undefined) fd.append("highlight_threshold", String(params.highlightThreshold));
  }
  if (["v9","v10","v11","v12","v13"].includes(params.version)) {
    if (params.sigmaS !== undefined) fd.append("sigma_s", String(params.sigmaS));
    if (params.sigmaR !== undefined) fd.append("sigma_r", String(params.sigmaR));
    if (params.meanshiftSp !== undefined) fd.append("meanshift_sp", String(params.meanshiftSp));
    if (params.meanshiftSr !== undefined) fd.append("meanshift_sr", String(params.meanshiftSr));
    if (params.chromaBoost !== undefined) fd.append("chroma_boost", String(params.chromaBoost));
    if (params.upscale !== undefined) fd.append("upscale", String(params.upscale));
  }
  if (params.version === "v14") {
    if (params.sigmaS !== undefined) fd.append("sigma_s", String(params.sigmaS));
    if (params.sigmaR !== undefined) fd.append("sigma_r", String(params.sigmaR));
    if (params.meanshiftSp !== undefined) fd.append("meanshift_sp", String(params.meanshiftSp));
    if (params.meanshiftSr !== undefined) fd.append("meanshift_sr", String(params.meanshiftSr));
    if (params.chromaBoost !== undefined) fd.append("chroma_boost", String(params.chromaBoost));
    if (params.upscale !== undefined) fd.append("upscale", String(params.upscale));
    if (params.detailStrength !== undefined) fd.append("detail_strength", String(params.detailStrength));
  }
  if (["v15","v16","v17","v18","v19","v20"].includes(params.version)) {
    if (params.upscale !== undefined) fd.append("upscale", String(params.upscale));
    if (params.chromaBoost !== undefined) fd.append("chroma_boost", String(params.chromaBoost));
    if (params.shadowThreshold !== undefined) fd.append("shadow_threshold", String(params.shadowThreshold));
    if (params.highlightThreshold !== undefined) fd.append("highlight_threshold", String(params.highlightThreshold));
    if (params.medianSize !== undefined) fd.append("median_size", String(params.medianSize));
  }
  if (params.lockedColors.length > 0) {
    fd.append("locked_colors", JSON.stringify(params.lockedColors));
  }
  return fd;
}

export async function fetchPreview(
  file: File,
  params: SeparationParams,
): Promise<PreviewResult> {
  const isGpu = USE_GPU_PROXY && SAM_VERSIONS.includes(params.version);
  const fd = isGpu ? buildGpuFormData(file, params, "preview") : buildFormData(file, params);
  const url = isGpu ? `/api/gpu-proxy` : `${BACKEND_URL}/api/preview`;
  const res = await fetch(url, {
    method: "POST",
    body: fd,
  });

  if (res.status === 503) {
    const err = await res.json();
    throw new Error(err.error || "Server overloaded — not enough memory for SAM processing");
  }
  if (res.status === 504) {
    throw new Error("GPU worker is starting up (~30s cold start). Please try again in a moment.");
  }
  if (!res.ok) {
    throw new Error(`Preview failed: ${res.status}`);
  }

  const manifestHeader = res.headers.get("X-Manifest");
  const rawManifest = manifestHeader ? JSON.parse(manifestHeader) : { width: 0, height: 0, plates: [] };
  // Normalize backend field names to frontend types
  const manifest: Manifest = {
    width: rawManifest.width,
    height: rawManifest.height,
    plates: (rawManifest.plates || []).map((p: Record<string, unknown>) => ({
      name: p.name,
      color: p.color,
      coverage: p.coverage_pct ?? p.coverage ?? 0,
    })),
    ai_analysis: rawManifest.ai_analysis ?? null,
    upscaled: rawManifest.upscaled ?? false,
    merge_suggestions: rawManifest.merge_suggestions ?? undefined,
  };

  const blob = await res.blob();
  const compositeUrl = URL.createObjectURL(blob);

  return { compositeUrl, manifest };
}

export async function fetchSeparation(
  file: File,
  params: SeparationParams,
): Promise<Blob> {
  const isGpu = USE_GPU_PROXY && SAM_VERSIONS.includes(params.version);
  const fd = isGpu ? buildGpuFormData(file, params, "separate") : buildFormData(file, params);
  const url = isGpu ? `/api/gpu-proxy` : `${BACKEND_URL}/api/separate`;
  const res = await fetch(url, {
    method: "POST",
    body: fd,
  });

  if (res.status === 503) {
    const err = await res.json();
    throw new Error(err.error || "Server overloaded — not enough memory for SAM processing");
  }
  if (res.status === 504) {
    throw new Error("GPU worker is starting up (~30s cold start). Please try again in a moment.");
  }
  if (!res.ok) {
    throw new Error(`Separation failed: ${res.status}`);
  }

  return res.blob();
}

export async function fetchAutoOptimize(
  file: File,
  plates: number,
  onIteration: (data: OptimizeIteration) => void,
): Promise<void> {
  const fd = new FormData();
  fd.append("image", file);
  fd.append("plates", String(plates));

  const res = await fetch(`${BACKEND_URL}/api/auto-optimize`, {
    method: "POST",
    body: fd,
  });

  if (!res.ok) {
    throw new Error(`Auto-optimize failed: ${res.status}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = JSON.parse(line.slice(6)) as OptimizeIteration;
        onIteration(data);
      }
    }
  }
}

export async function fetchUpscale(
  file: File,
): Promise<{ hash: string; cached: boolean; upscaled: boolean }> {
  const fd = new FormData();
  fd.append("image", file);
  const res = await fetch(`${BACKEND_URL}/api/upscale`, {
    method: "POST",
    body: fd,
  });
  if (!res.ok) {
    throw new Error(`Upscale failed: ${res.status}`);
  }
  return res.json();
}

export async function fetchMerge(
  file: File,
  params: SeparationParams,
  mergePairs: number[][],
  imgHash?: string | null,
): Promise<PreviewResult> {
  const fd = new FormData();
  fd.append("image", file);
  fd.append("merge_pairs", JSON.stringify(mergePairs));
  fd.append("plates", String(params.plates));
  fd.append("dust", String(params.dust));
  fd.append("version", params.version);
  if (params.sigmaS !== undefined) fd.append("sigma_s", String(params.sigmaS));
  if (params.sigmaR !== undefined) fd.append("sigma_r", String(params.sigmaR));
  if (params.meanshiftSp !== undefined) fd.append("meanshift_sp", String(params.meanshiftSp));
  if (params.meanshiftSr !== undefined) fd.append("meanshift_sr", String(params.meanshiftSr));
  if (params.chromaBoost !== undefined) fd.append("chroma_boost", String(params.chromaBoost));
  if (params.upscale !== undefined) fd.append("upscale", String(params.upscale));
  if (params.lockedColors.length > 0) {
    fd.append("locked_colors", JSON.stringify(params.lockedColors));
  }
  if (imgHash) fd.append("img_hash", imgHash);

  const res = await fetch(`${BACKEND_URL}/api/merge`, {
    method: "POST",
    body: fd,
  });
  if (res.status === 503) {
    const err = await res.json();
    throw new Error(err.error || "Server overloaded — not enough memory for SAM processing");
  }
  if (!res.ok) {
    throw new Error(`Merge failed: ${res.status}`);
  }

  const manifestHeader = res.headers.get("X-Manifest");
  const rawManifest = manifestHeader ? JSON.parse(manifestHeader) : { width: 0, height: 0, plates: [] };
  const manifest: Manifest = {
    width: rawManifest.width,
    height: rawManifest.height,
    plates: (rawManifest.plates || []).map((p: Record<string, unknown>) => ({
      name: p.name,
      color: p.color,
      coverage: p.coverage_pct ?? p.coverage ?? 0,
    })),
    ai_analysis: rawManifest.ai_analysis ?? null,
    upscaled: rawManifest.upscaled ?? false,
    merge_suggestions: rawManifest.merge_suggestions ?? undefined,
  };

  const blob = await res.blob();
  const compositeUrl = URL.createObjectURL(blob);
  return { compositeUrl, manifest };
}

export async function fetchPreviewStream(
  file: File,
  params: SeparationParams,
  onProgress: (stage: string, pct: number) => void,
): Promise<PreviewResult> {
  const fd = buildFormData(file, params);
  const res = await fetch(`${BACKEND_URL}/api/preview-stream`, {
    method: "POST",
    body: fd,
  });
  if (res.status === 503) {
    const err = await res.json();
    throw new Error(err.error || "Server overloaded — not enough memory for SAM processing");
  }
  if (!res.ok) throw new Error(`Preview stream failed: ${res.status}`);

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";
  let result: PreviewResult | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const chunks = buffer.split("\n\n");
    buffer = chunks.pop() ?? "";

    for (const chunk of chunks) {
      if (chunk.startsWith("data: ")) {
        const data = JSON.parse(chunk.slice(6));
        if (data.stage === "complete") {
          const bytes = Uint8Array.from(atob(data.image), c => c.charCodeAt(0));
          const blob = new Blob([bytes], { type: "image/png" });
          const compositeUrl = URL.createObjectURL(blob);
          const manifest: Manifest = {
            width: data.manifest.width,
            height: data.manifest.height,
            plates: (data.manifest.plates || []).map((p: Record<string, unknown>) => ({
              name: p.name,
              color: p.color,
              coverage: (p.coverage_pct ?? p.coverage ?? 0) as number,
            })),
            ai_analysis: (data.manifest.ai_analysis as Manifest["ai_analysis"]) ?? null,
            upscaled: (data.manifest.upscaled as boolean) ?? false,
            merge_suggestions: data.manifest.merge_suggestions as Manifest["merge_suggestions"],
          };
          result = { compositeUrl, manifest };
        } else {
          onProgress(data.stage as string, data.pct as number);
        }
      }
    }
  }

  if (!result) throw new Error("No result received from stream");
  return result;
}
