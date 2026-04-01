"use client";

import Link from "next/link";
import { useState, useCallback, useRef, useEffect, type ChangeEvent } from "react";
import { fetchPreview, fetchSeparation, fetchUpscale, fetchMerge } from "@/lib/api";
import { rgbToHex, hexToRgb } from "@/lib/colors";
import type { SeparationParams, Manifest, PreviewResult } from "@/lib/types";
import JSZip from "jszip";

type VersionId = SeparationParams["version"];

const VERSIONS: { id: VersionId; label: string }[] = [
  { id: "v15", label: "v15 (SAM)" },
  { id: "v16", label: "v16 (SAM+)" },
  { id: "v17", label: "v17 (SAM+lines)" },
  { id: "v18", label: "v18 (SAM best)" },
  { id: "v20", label: "v20 (best)" },
  { id: "v19", label: "v19 (guided)" },
  { id: "v14", label: "v14 (hybrid)" },
  { id: "v13", label: "v13" },
  { id: "v12", label: "v12" },
  { id: "v11", label: "v11 (merge+cache)" },
  { id: "v10", label: "v10 (smooth)" },
  { id: "v9", label: "v9 (clean)" },
  { id: "v8", label: "v8 (bilateral+crf)" },
  { id: "v7", label: "v7 (crf)" },
  { id: "v6", label: "v6 (superpixel)" },
  { id: "v5", label: "v5 (clean)" },
  { id: "v4", label: "v4 (ai)" },
  { id: "v3", label: "v3 (paper)" },
  { id: "v2", label: "v2" },
];

interface PaletteColor {
  rgb: [number, number, number];
  locked: boolean;
}

interface PlateImage {
  name: string;
  url: string;
  color: [number, number, number];
  coverage: number;
}

export default function ColorSeparator() {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [imageInfo, setImageInfo] = useState<{width:number,height:number,size:string,type:string} | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [compositeUrl, setCompositeUrl] = useState<string | null>(null);
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [colors, setColors] = useState<PaletteColor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [plates, setPlates] = useState(4);
  const [dust, setDust] = useState(5);
  const [useEdges, setUseEdges] = useState(true);
  const [edgeSigma, setEdgeSigma] = useState(3.0);
  const [version, setVersion] = useState<VersionId>("v20");
  const [upscale, setUpscale] = useState(true);
  const [medianSize, setMedianSize] = useState(5);
  const [chromaBoost, setChromaBoost] = useState(1.3);
  const [shadowThreshold, setShadowThreshold] = useState(8);
  const [highlightThreshold, setHighlightThreshold] = useState(95);
  const [nSegments, setNSegments] = useState(3000);
  const [compactness, setCompactness] = useState(15);
  const [crfSpatial, setCrfSpatial] = useState(3);
  const [crfColor, setCrfColor] = useState(13);
  const [crfCompat, setCrfCompat] = useState(10);
  const [sigmaS, setSigmaS] = useState(100);
  const [sigmaR, setSigmaR] = useState(0.5);
  const [meanshiftSp, setMeanshiftSp] = useState(15);
  const [meanshiftSr, setMeanshiftSr] = useState(30);
  const [detailStrength, setDetailStrength] = useState(0.5);
  const [progressStage, setProgressStage] = useState<string | null>(null);
  const [progressPct, setProgressPct] = useState(0);
  const progressTimerRef = useRef<ReturnType<typeof setInterval>>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [upscaleHash, setUpscaleHash] = useState<string | null>(null);
  const [isUpscaling, setIsUpscaling] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [mergeMode, setMergeMode] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [selectedForMerge, setSelectedForMerge] = useState<number[]>([]);
  const [zoomedPlate, setZoomedPlate] = useState<number | null>(null);
  const [plateImages, setPlateImages] = useState<PlateImage[]>([]);
  const [isLoadingPlates, setIsLoadingPlates] = useState(false);
  const [cachedZipBlob, setCachedZipBlob] = useState<Blob | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const compositeUrlRef = useRef<string | null>(null);
  const sourceUrlRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const plateAbortRef = useRef<AbortController | null>(null);
  const plateUrlsRef = useRef<string[]>([]);

  // Cleanup plate image blob URLs
  const cleanupPlateUrls = useCallback(() => {
    for (const url of plateUrlsRef.current) {
      URL.revokeObjectURL(url);
    }
    plateUrlsRef.current = [];
  }, []);

  // Keyboard shortcut: spacebar toggles comparison
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        setShowOriginal((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Close nav on outside click (mobile)
  useEffect(() => {
    if (!navOpen) return;
    const handler = (e: MouseEvent) => {
      const nav = document.querySelector(".nav-panel");
      const burger = document.querySelector(".hamburger");
      if (nav && !nav.contains(e.target as Node) && burger && !burger.contains(e.target as Node)) {
        setNavOpen(false);
      }
    };
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, [navOpen]);

  // Version-specific slider visibility
  const hasCrfSliders = version === "v7" || version === "v8";
  const hasSuperpixelSliders = version === "v6";
  const hasV4Sliders = version === "v4";
  const hasUpscaleToggle = version === "v4" || version === "v6" || version === "v9" || version === "v10" || version === "v11" || version === "v14" || version === "v15" || version === "v16" || version === "v17" || version === "v18" || version === "v19" || version === "v20";
  const hasChromaSlider = version === "v4" || version === "v6" || version === "v7" || version === "v8" || version === "v9" || version === "v10" || version === "v11" || version === "v14" || version === "v15" || version === "v16" || version === "v17" || version === "v18" || version === "v19" || version === "v20";
  const hasV9Sliders = version === "v9" || version === "v10" || version === "v11" || version === "v14";

  const getParams = useCallback(
    (overrides?: Partial<SeparationParams>): SeparationParams => ({
      plates: overrides?.plates ?? plates,
      dust: overrides?.dust ?? dust,
      useEdges: overrides?.useEdges ?? useEdges,
      edgeSigma: overrides?.edgeSigma ?? edgeSigma,
      lockedColors: overrides?.lockedColors ?? colors.filter((c) => c.locked).map((c) => c.rgb),
      version: overrides?.version ?? version,
      upscale: overrides?.upscale ?? upscale,
      medianSize: overrides?.medianSize ?? medianSize,
      chromaBoost: overrides?.chromaBoost ?? chromaBoost,
      shadowThreshold: overrides?.shadowThreshold ?? shadowThreshold,
      highlightThreshold: overrides?.highlightThreshold ?? highlightThreshold,
      nSegments: overrides?.nSegments ?? nSegments,
      compactness: overrides?.compactness ?? compactness,
      crfSpatial: overrides?.crfSpatial ?? crfSpatial,
      crfColor: overrides?.crfColor ?? crfColor,
      crfCompat: overrides?.crfCompat ?? crfCompat,
      sigmaS: overrides?.sigmaS ?? sigmaS,
      sigmaR: overrides?.sigmaR ?? sigmaR,
      meanshiftSp: overrides?.meanshiftSp ?? meanshiftSp,
      meanshiftSr: overrides?.meanshiftSr ?? meanshiftSr,
      detailStrength: overrides?.detailStrength ?? detailStrength,
    }),
    [plates, dust, useEdges, edgeSigma, colors, version, upscale, medianSize, chromaBoost, shadowThreshold, highlightThreshold, nSegments, compactness, crfSpatial, crfColor, crfCompat, sigmaS, sigmaR, meanshiftSp, meanshiftSr, detailStrength],
  );

  const startProgress = useCallback((hasUpscaleStep: boolean) => {
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    setProgressPct(0);
    setProgressStage(hasUpscaleStep ? "Upscaling (4x)" : "Separating colors");
    const stages = hasUpscaleStep
      ? [
          { at: 0, label: "Upscaling (4x)" },
          { at: 40, label: "Separating colors" },
          { at: 80, label: "Cleaning up" },
        ]
      : [
          { at: 0, label: "Separating colors" },
          { at: 70, label: "Cleaning up" },
        ];
    let pct = 0;
    progressTimerRef.current = setInterval(() => {
      pct = Math.min(pct + 1, 95);
      setProgressPct(pct);
      const stage = [...stages].reverse().find((s) => pct >= s.at);
      if (stage) setProgressStage(stage.label);
    }, 200);
  }, []);

  const stopProgress = useCallback(() => {
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    progressTimerRef.current = null;
    setProgressPct(100);
    setProgressStage(null);
  }, []);

  // Extract plate images from ZIP blob
  // Fetch plate thumbnail images from /api/plates (fast, 400px max)
  const fetchPlateImagesFromApi = useCallback(async (currentFile: File, params: SeparationParams) => {
    if (plateAbortRef.current) plateAbortRef.current.abort();
    plateAbortRef.current = new AbortController();

    setIsLoadingPlates(true);
    try {
      const fd = new FormData();
      fd.append("image", currentFile);
      fd.append("plates", String(params.plates));
      fd.append("dust", String(params.dust));
      fd.append("version", params.version);
      fd.append("upscale", String(params.upscale ?? true));
      fd.append("chroma_boost", String(params.chromaBoost ?? 1.3));
      if (params.sigmaS) fd.append("sigma_s", String(params.sigmaS));
      if (params.sigmaR) fd.append("sigma_r", String(params.sigmaR));
      if (params.meanshiftSp) fd.append("meanshift_sp", String(params.meanshiftSp));
      if (params.meanshiftSr) fd.append("meanshift_sr", String(params.meanshiftSr));
      if (params.lockedColors.length > 0) fd.append("locked_colors", JSON.stringify(params.lockedColors));

      const res = await fetch("/api/plates", { method: "POST", body: fd, signal: plateAbortRef.current.signal });
      if (res.ok) {
        const data = await res.json();
        cleanupPlateUrls();
        const images: PlateImage[] = data.plates.map((p: { name: string; color: [number, number, number]; coverage: number; image: string }) => ({
          name: p.name,
          url: p.image,
          color: p.color,
          coverage: p.coverage,
        }));
        setPlateImages(images);
      }
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        console.error("Plate fetch failed:", err);
      }
    } finally {
      setIsLoadingPlates(false);
    }
  }, [cleanupPlateUrls]);

  const runPreview = useCallback(
    async (currentFile: File, params: SeparationParams) => {
      setIsLoading(true);
      setPlateImages([]);
      setIsLoadingPlates(true);
      startProgress((["v4","v9","v10","v11","v12","v13","v14","v15","v16","v17","v18","v19","v20"].includes(params.version)) && params.upscale !== false);
      try {
        const result: PreviewResult = await fetchPreview(currentFile, params);
        if (compositeUrlRef.current) URL.revokeObjectURL(compositeUrlRef.current);
        compositeUrlRef.current = result.compositeUrl;
        setCompositeUrl(result.compositeUrl);
        setManifest(result.manifest);

        if (result.manifest.plates.length > 0) {
          setColors((prev) => {
            const locked = prev.filter((c) => c.locked);
            const detected = result.manifest.plates.map((p) => ({
              rgb: p.color,
              locked: false,
            }));
            if (locked.length === 0) return detected;
            return [...locked, ...detected.slice(locked.length)];
          });
        }

        // Auto-fetch plate images from separation ZIP
        fetchPlateImagesFromApi(currentFile, params);
      } catch (err) {
        console.error("Preview failed:", err);
      } finally {
        stopProgress();
        setIsLoading(false);
      }
    },
    [startProgress, stopProgress, fetchPlateImagesFromApi],
  );

  const schedulePreview = useCallback(
    (currentFile: File, params: SeparationParams) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        runPreview(currentFile, params);
      }, 200);
    },
    [runPreview],
  );

  const handleFileSelect = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (!f) return;
      setFile(f);
      setFileName(f.name);
      const imgEl = new window.Image();
      const objUrl = URL.createObjectURL(f);
      imgEl.onload = () => {
        setImageInfo({
          width: imgEl.naturalWidth,
          height: imgEl.naturalHeight,
          size: f.size > 1024*1024 ? (f.size/1024/1024).toFixed(1)+"MB" : Math.round(f.size/1024)+"KB",
          type: f.type.replace("image/","") || "unknown"
        });
        URL.revokeObjectURL(objUrl);
      };
      imgEl.src = objUrl;
      setUpscaleHash(null);
      if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current);
      const url = URL.createObjectURL(f);
      sourceUrlRef.current = url;
      setSourceUrl(url);
      setCompositeUrl(null);
      setManifest(null);
      setColors([]);
      setPlateImages([]);
      cleanupPlateUrls();
      setCachedZipBlob(null);

      // Fire upscale-on-upload if upscale is toggled on
      if (upscale) {
        setIsUpscaling(true);
        fetchUpscale(f)
          .then((result) => {
            setUpscaleHash(result.hash);
          })
          .catch((err) => console.error("Upscale cache failed:", err))
          .finally(() => setIsUpscaling(false));
      }
    },
    [upscale, cleanupPlateUrls],
  );

  const handleProcess = useCallback(() => {
    if (!file) return;
    runPreview(file, getParams());
  }, [file, getParams, runPreview]);

  const handleReset = useCallback(() => {
    setCompositeUrl(null);
    setManifest(null);
    setColors([]);
    setShowOriginal(false);
    setPlateImages([]);
    cleanupPlateUrls();
    setCachedZipBlob(null);
  }, [cleanupPlateUrls]);

  const handleParamChange = useCallback(
    (key: string, value: number | boolean) => {
      const setters: Record<string, (v: never) => void> = {
        plates: setPlates as (v: never) => void,
        dust: setDust as (v: never) => void,
        useEdges: setUseEdges as (v: never) => void,
        edgeSigma: setEdgeSigma as (v: never) => void,
        medianSize: setMedianSize as (v: never) => void,
        chromaBoost: setChromaBoost as (v: never) => void,
        shadowThreshold: setShadowThreshold as (v: never) => void,
        highlightThreshold: setHighlightThreshold as (v: never) => void,
        nSegments: setNSegments as (v: never) => void,
        compactness: setCompactness as (v: never) => void,
        crfSpatial: setCrfSpatial as (v: never) => void,
        crfColor: setCrfColor as (v: never) => void,
        crfCompat: setCrfCompat as (v: never) => void,
        sigmaS: setSigmaS as (v: never) => void,
        sigmaR: setSigmaR as (v: never) => void,
        meanshiftSp: setMeanshiftSp as (v: never) => void,
        meanshiftSr: setMeanshiftSr as (v: never) => void,
        detailStrength: setDetailStrength as (v: never) => void,
      };
      setters[key]?.(value as never);
      if (file && compositeUrl) {
        const overrides = { [key]: value };
        schedulePreview(file, getParams(overrides));
      }
    },
    [file, compositeUrl, schedulePreview, getParams],
  );

  const handleColorChange = useCallback(
    (index: number, hex: string) => {
      const rgb = hexToRgb(hex);
      setColors((prev) => {
        const next = [...prev];
        if (next[index]) {
          next[index] = { rgb, locked: true };
        }
        return next;
      });
    },
    [],
  );

  const handleToggleLock = useCallback(
    (index: number) => {
      setColors((prev) => {
        const next = [...prev];
        if (next[index]) {
          next[index] = { ...next[index], locked: !next[index].locked };
        }
        return next;
      });
    },
    [],
  );

  const handleRemoveColor = useCallback((index: number) => {
    setColors((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleAddColor = useCallback(() => {
    setColors((prev) => [...prev, { rgb: [128, 128, 128], locked: true }]);
  }, []);

  // Generate diagram canvas for ZIP
  const generateDiagram = useCallback(async (
    compositeImgUrl: string,
    plateImgs: PlateImage[],
    manifestData: Manifest,
  ): Promise<Blob> => {
    const compositeImg = await loadImage(compositeImgUrl);
    const plateLoadedImgs: HTMLImageElement[] = [];
    for (const p of plateImgs) {
      plateLoadedImgs.push(await loadImage(p.url));
    }

    const padding = 20;
    const labelHeight = 30;
    const cols = Math.min(plateImgs.length, 4);
    const rows = Math.ceil(plateImgs.length / cols);
    const plateW = Math.floor(compositeImg.width / cols);
    const plateH = Math.floor((compositeImg.height / compositeImg.width) * plateW);

    const canvasW = compositeImg.width + padding * 2;
    const canvasH = compositeImg.height + padding * 3 + (plateH + labelHeight) * rows + padding;

    const canvas = document.createElement("canvas");
    canvas.width = canvasW;
    canvas.height = canvasH;
    const ctx = canvas.getContext("2d")!;

    // White background
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvasW, canvasH);

    // Draw composite
    ctx.drawImage(compositeImg, padding, padding, compositeImg.width, compositeImg.height);

    // Label
    ctx.fillStyle = "#000";
    ctx.font = `${Math.max(14, Math.floor(canvasW / 40))}px monospace`;
    ctx.fillText("composite", padding, compositeImg.height + padding * 2);

    // Draw plates
    const plateStartY = compositeImg.height + padding * 2 + labelHeight;
    for (let i = 0; i < plateImgs.length; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = padding + col * (plateW + padding);
      const y = plateStartY + row * (plateH + labelHeight + padding);

      // Color swatch
      const hex = rgbToHex(plateImgs[i].color);
      ctx.fillStyle = hex;
      ctx.fillRect(x, y - labelHeight, plateW, labelHeight - 2);

      // Label text
      ctx.fillStyle = "#000";
      ctx.font = `${Math.max(10, Math.floor(canvasW / 60))}px monospace`;
      ctx.fillText(
        `${plateImgs[i].name} ${hex} ${plateImgs[i].coverage.toFixed(1)}%`,
        x + 4,
        y - 8,
      );

      // Plate image
      if (plateLoadedImgs[i]) {
        ctx.drawImage(plateLoadedImgs[i], x, y, plateW, plateH);
      }
    }

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob!), "image/png");
    });
  }, []);

  const handleDownload = useCallback(async () => {
    if (!file) return;
    setIsLoading(true);
    setDownloadProgress("fetching...");
    try {
      // Use cached ZIP or fetch new one
      const zipBlob = cachedZipBlob ?? await fetchSeparation(file, getParams());
      setDownloadProgress("building ZIP...");
      const zip = await JSZip.loadAsync(zipBlob);
      const newZip = new JSZip();

      // Rename plate files with hex codes
      const plateColorMap = manifest?.plates ?? [];
      for (const [filename, zipEntry] of Object.entries(zip.files)) {
        if (zipEntry.dir) continue;
        const data = await zipEntry.async("blob");

        // Check if this is a plate file
        const plateMatch = filename.match(/^(plate\d+)\.png$/);
        if (plateMatch) {
          const plateName = plateMatch[1];
          const plateInfo = plateColorMap.find((p) => p.name === plateName);
          if (plateInfo) {
            const hex = rgbToHex(plateInfo.color).replace("#", "").toUpperCase();
            newZip.file(`${plateName}_${hex}.png`, data);
          } else {
            newZip.file(filename, data);
          }
        } else {
          newZip.file(filename, data);
        }
      }

      // Generate diagram if we have plate images and composite
      if (compositeUrl && plateImages.length > 0 && manifest) {
        const diagramBlob = await generateDiagram(compositeUrl, plateImages, manifest);
        newZip.file("diagram.png", diagramBlob);
      }

      const finalBlob = await newZip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(finalBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "color-separator-plates.zip";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
      alert("Download failed. Try fewer plates or a different version.");
    } finally {
      setIsLoading(false);
      setDownloadProgress(null);
    }
  }, [file, getParams, cachedZipBlob, manifest, compositeUrl, plateImages, generateDiagram]);


  const canCompare = compositeUrl !== null && sourceUrl !== null;
  const displayImage = showOriginal && canCompare ? sourceUrl : (compositeUrl ?? sourceUrl);

  return (
    <>
      {/* Back to tools bar */}
      <Link href="/" className="back-to-tools">← tools.reidsurmeier.wtf</Link>

      {/* Hamburger button (mobile only) */}
      <button
        className="hamburger"
        onClick={() => setNavOpen((o) => !o)}
        aria-label="Toggle menu"
      >
        <span /><span /><span />
      </button>

      {/* Nav panel */}
      <div className={`nav-panel${navOpen ? " nav-open" : ""}`}>
        <h3 className="app-title">
          <span>COLOR.SEPARATOR</span>
        </h3>

        {/* Version selector */}
        <select
          value={version}
          onChange={(e) => setVersion(e.target.value as VersionId)}
        >
          {VERSIONS.map((v) => (
            <option key={v.id} value={v.id}>{v.label}</option>
          ))}
        </select>

        {/* Upscale toggle */}
        {hasUpscaleToggle && (
          <>
            <h3>upscale</h3>
            <button
              data-active={upscale ? "true" : "false"}
              onClick={() => setUpscale((u) => !u)}
            >
              {upscale ? (version === "v6" ? "4x on" : "2x on") : "off"}
            </button>
          </>
        )}

        {/* Source */}
        <h3>source</h3>
        <button className="source-btn" onClick={() => fileInputRef.current?.click()}>
          {fileName || "choose file"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
        />

        {/* Plates */}
        <h3>plates {plates}</h3>
        <input
          type="range"
          min={2}
          max={35}
          step={1}
          value={plates}
          onChange={(e) => handleParamChange("plates", Number(e.target.value))}
        />

        {/* Colors */}
        {colors.length > 0 && (
          <>
            <h3>colors</h3>
            <div className="colors">
              {colors.map((c, i) => (
                <span className="color" key={i}>
                  <input
                    type="color"
                    value={rgbToHex(c.rgb)}
                    onChange={(e) => handleColorChange(i, e.target.value)}
                    onClick={() => handleToggleLock(i)}
                  />
                  {c.locked && <span className="lock-indicator" />}
                  <button
                    className="remove-btn"
                    onClick={() => handleRemoveColor(i)}
                  >
                    &times;
                  </button>
                </span>
              ))}
              <button onClick={handleAddColor}>+</button>
            </div>
          </>
        )}

        {/* Dust */}
        <h3>dust {dust}</h3>
        <input
          type="range"
          min={5}
          max={100}
          step={1}
          value={dust}
          onChange={(e) => handleParamChange("dust", Number(e.target.value))}
        />

        {/* Edge Detection */}
        <h3>edge detection</h3>
        <button
          data-active={useEdges ? "true" : "false"}
          onClick={() => handleParamChange("useEdges", !useEdges)}
        >
          {useEdges ? "on" : "off"}
        </button>

        {useEdges && (
          <>
            <h3>edge sigma {edgeSigma.toFixed(1)}</h3>
            <input
              type="range"
              min={0.5}
              max={3.0}
              step={0.1}
              value={edgeSigma}
              onChange={(e) => handleParamChange("edgeSigma", Number(e.target.value))}
            />
          </>
        )}

        {/* CRF controls (v7/v8) */}
        {hasCrfSliders && (
          <>
            <h3>spatial {crfSpatial}</h3>
            <input
              type="range"
              min={1}
              max={20}
              step={1}
              value={crfSpatial}
              onChange={(e) => handleParamChange("crfSpatial", Number(e.target.value))}
            />
            <h3>color {crfColor}</h3>
            <input
              type="range"
              min={5}
              max={50}
              step={1}
              value={crfColor}
              onChange={(e) => handleParamChange("crfColor", Number(e.target.value))}
            />
            <h3>edge {crfCompat}</h3>
            <input
              type="range"
              min={1}
              max={20}
              step={1}
              value={crfCompat}
              onChange={(e) => handleParamChange("crfCompat", Number(e.target.value))}
            />
          </>
        )}

        {/* V9 controls */}
        {hasV9Sliders && (
          <>
            <h3>smooth &sigma;s {sigmaS}</h3>
            <input
              type="range"
              min={20}
              max={200}
              step={5}
              value={sigmaS}
              onChange={(e) => handleParamChange("sigmaS", Number(e.target.value))}
            />
            <h3>range &sigma;r {sigmaR.toFixed(1)}</h3>
            <input
              type="range"
              min={0.1}
              max={1.0}
              step={0.05}
              value={sigmaR}
              onChange={(e) => handleParamChange("sigmaR", Number(e.target.value))}
            />
            <h3>shift sp {meanshiftSp}</h3>
            <input
              type="range"
              min={5}
              max={50}
              step={1}
              value={meanshiftSp}
              onChange={(e) => handleParamChange("meanshiftSp", Number(e.target.value))}
            />
            <h3>shift sr {meanshiftSr}</h3>
            <input
              type="range"
              min={10}
              max={80}
              step={1}
              value={meanshiftSr}
              onChange={(e) => handleParamChange("meanshiftSr", Number(e.target.value))}
            />
          </>
        )}

        {/* V4 tuning controls */}
        {hasV4Sliders && (
          <>
            <h3>smooth {medianSize}</h3>
            <input
              type="range"
              min={1}
              max={11}
              step={2}
              value={medianSize}
              onChange={(e) => handleParamChange("medianSize", Number(e.target.value))}
            />
            <h3>shadows {shadowThreshold}</h3>
            <input
              type="range"
              min={5}
              max={50}
              step={1}
              value={shadowThreshold}
              onChange={(e) => handleParamChange("shadowThreshold", Number(e.target.value))}
            />
            <h3>highlights {highlightThreshold}</h3>
            <input
              type="range"
              min={80}
              max={99}
              step={1}
              value={highlightThreshold}
              onChange={(e) => handleParamChange("highlightThreshold", Number(e.target.value))}
            />
          </>
        )}

        {/* Superpixel controls (v6) */}
        {hasSuperpixelSliders && (
          <>
            <h3>detail {nSegments}</h3>
            <input
              type="range"
              min={500}
              max={10000}
              step={100}
              value={nSegments}
              onChange={(e) => handleParamChange("nSegments", Number(e.target.value))}
            />
            <h3>compact {compactness}</h3>
            <input
              type="range"
              min={5}
              max={40}
              step={1}
              value={compactness}
              onChange={(e) => handleParamChange("compactness", Number(e.target.value))}
            />
          </>
        )}

        {/* Chroma slider */}
        {hasChromaSlider && (
          <>
            <h3>chroma {chromaBoost.toFixed(1)}</h3>
            <input
              type="range"
              min={0.5}
              max={2.0}
              step={0.1}
              value={chromaBoost}
              onChange={(e) => handleParamChange("chromaBoost", Number(e.target.value))}
            />
          </>
        )}

        {/* V14 detail strength */}
        {version === "v14" && (
          <>
            <h3>detail {detailStrength.toFixed(2)}</h3>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={detailStrength}
              onChange={(e) => handleParamChange("detailStrength", Number(e.target.value))}
            />
          </>
        )}

        {/* Actions */}
        <h3>actions</h3>
        <button className="process-btn" onClick={handleProcess} disabled={!file}>
          process
        </button>
        <button onClick={handleReset}>reset</button>
        {canCompare && (
          <button
            data-active={showOriginal ? "true" : "false"}
            onClick={() => setShowOriginal((s) => !s)}
            title="Spacebar to toggle"
          >
            {showOriginal ? "showing original" : "compare"}
          </button>
        )}

        {/* Download */}
        <h3>download</h3>
        <button onClick={handleDownload} disabled={!compositeUrl || isLoading || !!downloadProgress}>
          {downloadProgress ?? "ZIP"}
        </button>
        {downloadProgress && (
          <div className="download-progress">
            <div className="download-progress-bar">
              <div className="download-progress-fill" />
            </div>
          </div>
        )}

        {/* Merge plates */}
        <h3>merge plates</h3>
        <button
          data-active={mergeMode ? "true" : "false"}
          onClick={() => { setMergeMode(m => !m); setSelectedForMerge([]); }}
          disabled={!manifest || plateImages.length === 0}
        >
          {mergeMode ? "cancel" : "select plates"}
        </button>
        {mergeMode && selectedForMerge.length >= 2 && (
          <button className="process-btn" disabled={isMerging} onClick={async () => {
            if (!file || selectedForMerge.length < 2) return;
            setIsMerging(true);
            try {
              const pairs: number[][] = [];
              for (let i = 1; i < selectedForMerge.length; i++) {
                pairs.push([selectedForMerge[0], selectedForMerge[i]]);
              }
              const result = await fetchMerge(file, getParams(), pairs, upscaleHash);
              if (compositeUrlRef.current) URL.revokeObjectURL(compositeUrlRef.current);
              compositeUrlRef.current = result.compositeUrl;
              setCompositeUrl(result.compositeUrl);
              setManifest(result.manifest);
              if (result.manifest.plates.length > 0) {
                setColors(result.manifest.plates.map((p) => ({ rgb: p.color, locked: false })));
              }
              setMergeMode(false);
              setSelectedForMerge([]);
              fetchPlateImagesFromApi(file, getParams());
            } catch (err) { console.error("Merge failed:", err); }
            finally { setIsMerging(false); }
          }}>{isMerging ? "merging..." : `merge ${selectedForMerge.length} plates`}</button>
        )}
        {mergeMode && <div style={{fontSize:11,color:'#999',marginTop:4}}>click plates to select ({selectedForMerge.length} selected)</div>}

        <h3>about</h3>
        <button onClick={() => setShowAbout(a => !a)}>
          {showAbout ? "hide" : "show"}
        </button>
        <a href="https://github.com/ReidSurmeier/color-separator" target="_blank" rel="noreferrer" style={{display:"inline-block",background:"#ddd",padding:"2px 4px",margin:"0 2px",fontSize:14,textDecoration:"none",color:"inherit",cursor:"pointer"}}>
          github
        </a>

        {(imageInfo || manifest) && (
          <div className="data-box">
            <h3>data</h3>
            {imageInfo && (
              <>
                <div className="data-row"><span>size</span><span>{imageInfo.width}×{imageInfo.height}</span></div>
                <div className="data-row"><span>file</span><span>{imageInfo.size}</span></div>
                <div className="data-row"><span>type</span><span>{imageInfo.type}</span></div>
              </>
            )}
            {manifest && (
              <>
                <div className="data-row"><span>plates</span><span>{manifest.plates.length}</span></div>
                {manifest.upscaled && <div className="data-row"><span>upscaled</span><span>2×</span></div>}
                {manifest.ai_analysis && (
                  <div className="data-row"><span>ai score</span><span>{manifest.ai_analysis.quality_score}/100</span></div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* About overlay */}
      {showAbout && (
        <div className="about-overlay">
          <div className="about-content">
            <pre className="about-ascii">{`  ∧＿∧\n （｡･ω･｡)つ━☆・*。\n ⊂　ノ　・゜+.\n 　しーＪ　°。+ *´¨)\n 　.· ´¸.·*´¨) ¸.·*¨)\n 　(¸.·´ (¸.·'* ☆`}</pre>
            <div className="about-box">
              <div className="about-label">ABOUT</div>
              <div>reid surmeier</div>
              <div className="about-separator" />
              <a href="https://www.instagram.com/reidsurmeier/" target="_blank" rel="noreferrer">@reidsurmeier</a>
              <a href="https://reidsurmeier.wtf" target="_blank" rel="noreferrer">reidsurmeier.wtf</a>
              <a href="https://www.are.na/reid-surmeier/channels" target="_blank" rel="noreferrer">are.na</a>
            </div>
            <div className="about-box">
              <div className="about-label">TECH</div>
              <div>Frontend: Next.js 16 + React 19 + TypeScript</div>
              <div>Backend: Python 3.12 + FastAPI + uvicorn</div>
              <div>Separation: K-means++ in CIELAB color space</div>
              <div>Upscaling: Real-ESRGAN 4x (GPU)</div>
              <div>Segmentation: SAM 2.1 (Segment Anything Model)</div>
              <div>Smoothing: bilateral filter + mean-shift clustering</div>
              <div>Edge detection: Canny + CRF refinement</div>
              <div>Line detection: adaptive thresholding + HSV analysis</div>
              <div>Hosting: Linux + systemd + Cloudflare tunnel</div>
            </div>
            <div className="about-box">
              <div className="about-label">ALGORITHMS</div>
              <div className="about-dim">v2: CIELAB K-means++, label map cleanup</div>
              <div className="about-dim">v3: key block extraction (Taohuawu paper)</div>
              <div className="about-dim">v4: Real-ESRGAN 4x upscale + AI assessment</div>
              <div className="about-dim">v5: targeted line noise removal</div>
              <div className="about-dim">v6: SLIC superpixel separation</div>
              <div className="about-dim">v7-v8: CRF smoothing + bilateral filter</div>
              <div className="about-dim">v9-v10: edge-preserving + mean-shift</div>
              <div className="about-dim">v11: plate merging + caching</div>
              <div className="about-dim">v12: vectorized + MiniBatchKMeans (2.5x faster)</div>
              <div className="about-dim">v13: raw pixels + Canny edges (detail mode)</div>
              <div className="about-dim">v14: two-pass gradient-aware fusion</div>
              <div className="about-dim">v15: SAM-guided object-aware separation</div>
              <div className="about-dim">v16: SAM + morphological closing</div>
              <div className="about-dim">v17: SAM + line detection + color-aware post-processing</div>
              <div className="about-dim">v18: SAM + local contrast + two-pass stroke fill</div>
              <div className="about-dim">v19: SAM + guided filter (neutral plates only)</div>
              <div className="about-dim">v20: SAM + guided filter + diff-based hole correction</div>
              <div className="about-dim">v18: SAM + local contrast detection + two-pass fill</div>
            </div>
            <div className="about-box">
              <div className="about-label">REFERENCES</div>
              <a href="https://www.mdpi.com/2076-3417/15/16/9081" target="_blank" rel="noreferrer">Taohuawu Woodblock Restoration (MDPI 2025)</a>
              <a href="https://www.mdpi.com/1424-8220/22/16/6043" target="_blank" rel="noreferrer">Superpixel Color Quantization (MDPI 2022)</a>
              <a href="https://segment-anything.com" target="_blank" rel="noreferrer">Segment Anything Model (Meta AI)</a>
              <a href="https://colorshift.theretherenow.com/" target="_blank" rel="noreferrer">color/shift risograph profiles</a>
              <div className="about-separator" />
              <a href="https://github.com/ReidSurmeier/color-separator" target="_blank" rel="noreferrer">GitHub · source code</a>
            </div>
            <div className="about-box">
              <div className="about-label">PRIVACY</div>
              <div className="about-dim">all processing server-side. no analytics. no tracking.</div>
              <div className="about-dim">no cookies. uploaded images are not stored.</div>
            </div>
            <button className="about-close" onClick={() => setShowAbout(false)}>close</button>
          </div>
        </div>
      )}

      {/* Overlay to close mobile nav */}
      {navOpen && <div className="nav-overlay" onClick={() => setNavOpen(false)} />}

      {/* Main scrollable area */}
      <div className={`main-canvas ${isLoading ? 'is-loading' : ''}`}>
        {/* Composite image */}
        {displayImage && (
          <div className="canvas-wrapper">
            <img src={displayImage} alt="preview" />
            {compositeUrl && !showOriginal && <div className="paper-texture" />}
            {showOriginal && canCompare && (
              <div className="compare-label">ORIGINAL</div>
            )}
          </div>
        )}



        {/* AI Score */}
        {manifest && manifest.ai_analysis && (
          <div className="ai-score-inline" title={manifest.ai_analysis.summary}>
            AI: {manifest.ai_analysis.quality_score}/100
          </div>
        )}

        {/* Plate images grid */}
        {(plateImages.length > 0 || isLoadingPlates) && (
          <div className="plates-section">
            <h3 className="plates-section-title">plates ({plateImages.length})</h3>
            {isMerging && (
              <div className="merge-progress-overlay">
                <div className="merge-spinner" />
                <span>merging plates...</span>
              </div>
            )}
            {isLoadingPlates && (
              <div className="plates-grid">
                {Array.from({ length: plates }).map((_, i) => (
                  <div key={i} className="plate-card plate-skeleton">
                    <div className="plate-card-image plate-skeleton-img" />
                    <div className="plate-card-info">
                      <div className="plate-skeleton-swatch" />
                      <div className="plate-skeleton-text" />
                      <div className="plate-skeleton-text short" />
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="plates-grid">
              {plateImages.map((plate, i) => (
                <div
                  className={`plate-card ${mergeMode && selectedForMerge.includes(i) ? 'plate-selected' : ''}`}
                  key={i}
                  onClick={() => {
                    if (mergeMode) {
                      setSelectedForMerge(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
                    } else {
                      setZoomedPlate(i);
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="plate-card-image" style={{ borderColor: rgbToHex(plate.color) }}>
                    <img src={plate.url} alt={plate.name} />
                    <div
                      className="plate-card-color-overlay"
                      style={{ backgroundColor: rgbToHex(plate.color) }}
                    />
                  </div>
                  <div className="plate-card-info">
                    <span className="plate-card-swatch" style={{ backgroundColor: rgbToHex(plate.color) }} />
                    <span className="plate-card-hex">{rgbToHex(plate.color).toUpperCase()}</span>
                    <span className="plate-card-coverage">{plate.coverage.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Plate zoom overlay */}
        {zoomedPlate !== null && plateImages[zoomedPlate] && (
          <div className="plate-zoom-overlay" onClick={() => setZoomedPlate(null)}>
            <div className="plate-zoom-content" onClick={(e) => e.stopPropagation()}>
              <img src={plateImages[zoomedPlate].url} alt="plate" className="plate-zoom-img" />
              <div className="plate-zoom-info">
                <span className="plate-zoom-swatch" style={{backgroundColor: rgbToHex(plateImages[zoomedPlate].color)}} />
                <span className="plate-zoom-hex">{rgbToHex(plateImages[zoomedPlate].color).toUpperCase()}</span>
                <span className="plate-zoom-name">{plateImages[zoomedPlate].name}</span>
                <span className="plate-zoom-coverage">{plateImages[zoomedPlate].coverage.toFixed(1)}%</span>
              </div>
              <button className="about-close" onClick={() => setZoomedPlate(null)}>close</button>
            </div>
          </div>
        )}

      </div>

      {/* Progress bar */}
      {isLoading && progressStage && (
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progressPct}%` }} />
          <span className="progress-label">
            {progressStage} — {progressPct}%
          </span>
        </div>
      )}

      {/* Upscaling status */}
      {isUpscaling && (
        <div className="upscale-status">upscaling...</div>
      )}
    </>
  );
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
