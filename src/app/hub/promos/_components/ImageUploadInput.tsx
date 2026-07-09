"use client";

import { useState, useEffect, useRef } from "react";

type Props = {
  name: string;
  label: string;
  currentImageData?: string | null;
  clearInputName?: string;
  acceptPdf?: boolean;
  maxPx?: number;
  quality?: number;
};

export function ImageUploadInput({
  name,
  label,
  currentImageData,
  clearInputName,
  acceptPdf,
  maxPx = 1080,
  quality = 0.82,
}: Props) {
  const [dataValue, setDataValue] = useState<string>(currentImageData ?? "");
  const [preview, setPreview] = useState<string | null>(currentImageData ?? null);
  const [cleared, setCleared] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [sizeKb, setSizeKb] = useState<number | null>(null);
  const [err, setErr] = useState("");
  // Flashes briefly when a paste is received so the user gets visual feedback
  const [pasted, setPasted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  async function processFile(file: File) {
    setErr("");
    setProcessing(true);
    setSizeKb(null);

    try {
      const dataUrl =
        file.type === "application/pdf"
          ? await extractPdfHeader(file, maxPx)
          : await compressImage(file, maxPx, quality);

      const b64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
      setSizeKb(Math.round((b64.length * 3) / 4 / 1024));

      setDataValue(dataUrl);
      setPreview(dataUrl);
      setCleared(false);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to process file");
    } finally {
      setProcessing(false);
    }
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
  }

  function handleClear() {
    setDataValue("");
    setPreview(null);
    setCleared(true);
    setSizeKb(null);
    setErr("");
  }

  function extractImageFromClipboard(e: ClipboardEvent): File | null {
    const items = Array.from(e.clipboardData?.items ?? []);
    const item = items.find((i) => i.type.startsWith("image/"));
    return item ? item.getAsFile() : null;
  }

  // Global paste listener — fires when no text input is focused
  useEffect(() => {
    async function handleDocPaste(e: ClipboardEvent) {
      const active = document.activeElement;
      const isTextInput =
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement ||
        (active instanceof HTMLElement && active.isContentEditable);
      if (isTextInput) return;
      if (preview && !cleared) return; // already have an image

      const file = extractImageFromClipboard(e);
      if (!file) return;

      e.preventDefault();
      setPasted(true);
      setTimeout(() => setPasted(false), 1200);
      await processFile(file);
    }

    document.addEventListener("paste", handleDocPaste);
    return () => document.removeEventListener("paste", handleDocPaste);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preview, cleared]);

  // Paste directly on the upload zone (user can also click zone then Ctrl+V)
  async function handleZonePaste(e: React.ClipboardEvent) {
    const file = extractImageFromClipboard(e.nativeEvent);
    if (!file) return;
    e.preventDefault();
    setPasted(true);
    setTimeout(() => setPasted(false), 1200);
    await processFile(file);
  }

  const accept = acceptPdf ? "image/*,application/pdf" : "image/*";
  const uploadLabel = acceptPdf
    ? "Click to upload image or PDF · or paste (Ctrl+V)"
    : "Click to upload · or paste image (Ctrl+V)";

  return (
    <div ref={containerRef}>
      <label className="block text-sm font-medium mb-1">{label}</label>

      {/* Controlled hidden inputs — value driven by React state, always in sync */}
      <input type="hidden" name={name} value={dataValue} onChange={() => {}} />
      {clearInputName && (
        <input type="hidden" name={clearInputName} value={cleared ? "1" : "0"} onChange={() => {}} />
      )}

      {preview && !cleared ? (
        <div className="space-y-1">
          <div className="relative inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="preview" className="h-32 w-auto rounded border border-black/10 object-contain" />
            <button
              type="button"
              onClick={handleClear}
              className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white text-xs hover:bg-black"
            >
              ✕
            </button>
          </div>
          {sizeKb !== null && (
            <p className="text-xs text-(--hub-muted)">
              Compressed to ~{sizeKb} KB
              {sizeKb > 800 && (
                <span className="text-amber-600"> — large, save may be slow</span>
              )}
            </p>
          )}
        </div>
      ) : (
        // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
        <label
          className={`flex cursor-pointer items-center gap-2 rounded-md border border-dashed px-4 py-3 text-sm transition-colors ${
            pasted
              ? "border-green-500 bg-green-50 text-green-700"
              : "border-black/20 text-(--hub-muted) hover:border-black/40"
          }`}
          onPaste={handleZonePaste}
        >
          {processing ? (
            <>
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>{acceptPdf ? "Extracting header from PDF…" : "Processing…"}</span>
            </>
          ) : pasted ? (
            <span>Image pasted ✓</span>
          ) : (
            <span>{uploadLabel}</span>
          )}
          <input type="file" accept={accept} className="hidden" onChange={handleFile} disabled={processing} />
        </label>
      )}

      {acceptPdf && !preview && !processing && (
        <p className="mt-1 text-xs text-(--hub-muted)">
          Upload a PDF leaflet to automatically extract its header, or upload an image directly.
        </p>
      )}

      {err && <p className="mt-1 text-xs text-red-600">{err}</p>}
    </div>
  );
}

// ── Image helpers ─────────────────────────────────────────────────────────────

function compressImage(file: File, maxPx: number, quality: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxPx || height > maxPx) {
          const ratio = Math.min(maxPx / width, maxPx / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = ev.target!.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ── PDF header extraction ─────────────────────────────────────────────────────

/**
 * Scan the rendered page to find where the product grid starts (first sustained
 * bright/white region), then back off by ~5% of page height to land above the
 * dark "Promotion valid from…" date bar that separates the header from the grid.
 * BuildItCard renders its own date bar, so the PDF's date bar must be excluded.
 */
function detectHeaderCropRatio(canvas: HTMLCanvasElement): number {
  const W = canvas.width;
  const H = canvas.height;
  const { data } = canvas.getContext("2d")!.getImageData(0, 0, W, H);

  // 10 evenly-spaced columns across the full width
  const sampleXs = Array.from({ length: 10 }, (_, i) => Math.floor(W * (i + 1) / 11));

  const minY = Math.floor(H * 0.15);
  const maxY = Math.floor(H * 0.72);
  // The white area must be sustained for ≥ 2.5% of page height to avoid false
  // positives from bright areas inside the header image (light tiles, grout lines)
  const minBrightRows = Math.max(5, Math.floor(H * 0.025));

  let brightStartY = -1;
  let consecutiveBrightRows = 0;

  for (let y = minY; y < maxY; y++) {
    const brightnesses = sampleXs.map((x) => {
      const i = (y * W + x) * 4;
      return (data[i] + data[i + 1] + data[i + 2]) / 3;
    });

    // Require ≥ 70% of sampled columns to be near-white (≥ 200) — robust
    // against product images that overlap some sample columns
    const brightCount = brightnesses.filter((b) => b >= 200).length;
    if (brightCount >= Math.ceil(sampleXs.length * 0.7)) {
      if (brightStartY < 0) brightStartY = y;
      consecutiveBrightRows++;
      if (consecutiveBrightRows >= minBrightRows) {
        // Found the product area. Back off ~5% of page height to land above
        // the dark date bar that sits between the header image and the grid.
        const dateBarOffset = Math.round(H * 0.05);
        return Math.max(0.12, (brightStartY - dateBarOffset) / H);
      }
    } else {
      brightStartY = -1;
      consecutiveBrightRows = 0;
    }
  }

  // Fallback: aspect-ratio heuristic
  const aspectRatio = W / H;
  return aspectRatio < 0.85 ? 0.29 : 0.44;
}

async function extractPdfHeader(file: File, maxPx: number): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
  const page = await pdf.getPage(1);

  const scale = 2;
  const viewport = page.getViewport({ scale });

  // Render the full page so we can scan for the dark date bar
  const fullCanvas = document.createElement("canvas");
  fullCanvas.width = viewport.width;
  fullCanvas.height = viewport.height;
  await page.render({ canvasContext: fullCanvas.getContext("2d")!, canvas: fullCanvas, viewport }).promise;

  // Auto-detect crop boundary from pixel content
  const cropRatio = detectHeaderCropRatio(fullCanvas);
  const cropHeight = Math.round(viewport.height * cropRatio);

  // Crop to just the header portion
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = cropHeight;
  canvas.getContext("2d")!.drawImage(fullCanvas, 0, 0);

  if (viewport.width > maxPx) {
    const out = document.createElement("canvas");
    const ratio = maxPx / viewport.width;
    out.width = maxPx;
    out.height = Math.round(cropHeight * ratio);
    out.getContext("2d")!.drawImage(canvas, 0, 0, out.width, out.height);
    return out.toDataURL("image/jpeg", 0.88);
  }

  return canvas.toDataURL("image/jpeg", 0.88);
}
