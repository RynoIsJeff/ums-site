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
  const [pasted, setPasted] = useState(false);
  // PDF crop editor state
  const [cropEditor, setCropEditor] = useState<{
    fullDataUrl: string;
    cropRatio: number;
  } | null>(null);
  const fullPageCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  async function processFile(file: File) {
    setErr("");
    setProcessing(true);
    setSizeKb(null);

    try {
      if (file.type === "application/pdf") {
        const { fullDataUrl, initialCropRatio, fullCanvas } = await renderPdfPage(file);
        fullPageCanvasRef.current = fullCanvas;
        setCropEditor({ fullDataUrl, cropRatio: initialCropRatio });
      } else {
        const dataUrl = await compressImage(file, maxPx, quality);
        const b64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
        setSizeKb(Math.round((b64.length * 3) / 4 / 1024));
        setDataValue(dataUrl);
        setPreview(dataUrl);
        setCleared(false);
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to process file");
    } finally {
      setProcessing(false);
    }
  }

  function confirmCrop() {
    if (!cropEditor || !fullPageCanvasRef.current) return;
    const fullCanvas = fullPageCanvasRef.current;
    const cropHeight = Math.round(fullCanvas.height * cropEditor.cropRatio);

    const canvas = document.createElement("canvas");
    canvas.width = fullCanvas.width;
    canvas.height = cropHeight;
    canvas.getContext("2d")!.drawImage(fullCanvas, 0, 0);

    let dataUrl: string;
    if (fullCanvas.width > maxPx) {
      const out = document.createElement("canvas");
      const ratio = maxPx / fullCanvas.width;
      out.width = maxPx;
      out.height = Math.round(cropHeight * ratio);
      out.getContext("2d")!.drawImage(canvas, 0, 0, out.width, out.height);
      dataUrl = out.toDataURL("image/jpeg", 0.88);
    } else {
      dataUrl = canvas.toDataURL("image/jpeg", 0.88);
    }

    const b64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
    setSizeKb(Math.round((b64.length * 3) / 4 / 1024));
    setDataValue(dataUrl);
    setPreview(dataUrl);
    setCleared(false);
    setCropEditor(null);
    fullPageCanvasRef.current = null;
  }

  function cancelCrop() {
    setCropEditor(null);
    fullPageCanvasRef.current = null;
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

  useEffect(() => {
    async function handleDocPaste(e: ClipboardEvent) {
      const active = document.activeElement;
      const isTextInput =
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement ||
        (active instanceof HTMLElement && active.isContentEditable);
      if (isTextInput) return;
      if (preview && !cleared) return;

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

      <input type="hidden" name={name} value={dataValue} onChange={() => {}} />
      {clearInputName && (
        <input type="hidden" name={clearInputName} value={cleared ? "1" : "0"} onChange={() => {}} />
      )}

      {/* PDF crop editor */}
      {cropEditor && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-(--hub-text)">
            Drag the slider to set where the header ends, then click <strong>Use crop</strong>.
          </p>
          <div className="relative overflow-hidden rounded border border-black/10 select-none" style={{ maxHeight: 420 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cropEditor.fullDataUrl}
              alt="Full PDF page"
              className="w-full h-auto block"
              draggable={false}
            />
            {/* Dimmed area below crop line */}
            <div
              className="absolute left-0 right-0 bottom-0 bg-black/40 pointer-events-none"
              style={{ top: `${cropEditor.cropRatio * 100}%` }}
            />
            {/* Crop line */}
            <div
              className="absolute left-0 right-0 pointer-events-none"
              style={{ top: `${cropEditor.cropRatio * 100}%` }}
            >
              <div className="h-0.5 bg-red-500 w-full" />
              <span className="absolute left-2 -top-5 rounded bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold text-white leading-none">
                crop here
              </span>
            </div>
          </div>
          <div className="space-y-1">
            <input
              type="range"
              min={10}
              max={70}
              step={1}
              value={Math.round(cropEditor.cropRatio * 100)}
              onChange={(e) =>
                setCropEditor((prev) =>
                  prev ? { ...prev, cropRatio: Number(e.target.value) / 100 } : null
                )
              }
              className="w-full accent-red-500"
            />
            <p className="text-xs text-(--hub-muted)">
              Cropping at {Math.round(cropEditor.cropRatio * 100)}% of page height
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={confirmCrop}
              className="rounded-md bg-black px-3 py-1.5 text-sm font-semibold text-white hover:bg-black/80"
            >
              Use crop
            </button>
            <button
              type="button"
              onClick={cancelCrop}
              className="rounded-md border border-black/20 px-3 py-1.5 text-sm text-(--hub-text) hover:bg-black/5"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Normal preview */}
      {!cropEditor && preview && !cleared ? (
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
      ) : !cropEditor ? (
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
              <span>{acceptPdf ? "Rendering PDF…" : "Processing…"}</span>
            </>
          ) : pasted ? (
            <span>Image pasted ✓</span>
          ) : (
            <span>{uploadLabel}</span>
          )}
          <input type="file" accept={accept} className="hidden" onChange={handleFile} disabled={processing} />
        </label>
      ) : null}

      {acceptPdf && !preview && !processing && !cropEditor && (
        <p className="mt-1 text-xs text-(--hub-muted)">
          Upload a PDF leaflet to crop its header, or upload an image directly.
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

// ── PDF rendering ─────────────────────────────────────────────────────────────

/**
 * Scan the rendered page for the product grid (first sustained bright/white region)
 * to suggest an initial crop point. The user can then adjust manually.
 */
function detectHeaderCropRatio(canvas: HTMLCanvasElement): number {
  const W = canvas.width;
  const H = canvas.height;
  const { data } = canvas.getContext("2d")!.getImageData(0, 0, W, H);

  const sampleXs = Array.from({ length: 10 }, (_, i) => Math.floor(W * (i + 1) / 11));

  const minY = Math.floor(H * 0.15);
  const maxY = Math.floor(H * 0.72);
  const minBrightRows = Math.max(5, Math.floor(H * 0.025));

  let brightStartY = -1;
  let consecutiveBrightRows = 0;

  for (let y = minY; y < maxY; y++) {
    const brightnesses = sampleXs.map((x) => {
      const i = (y * W + x) * 4;
      return (data[i] + data[i + 1] + data[i + 2]) / 3;
    });

    const brightCount = brightnesses.filter((b) => b >= 200).length;
    if (brightCount >= Math.ceil(sampleXs.length * 0.7)) {
      if (brightStartY < 0) brightStartY = y;
      consecutiveBrightRows++;
      if (consecutiveBrightRows >= minBrightRows) {
        // Back off ~9% to include logos/text at the bottom of the header
        const dateBarOffset = Math.round(H * 0.09);
        return Math.max(0.12, (brightStartY - dateBarOffset) / H);
      }
    } else {
      brightStartY = -1;
      consecutiveBrightRows = 0;
    }
  }

  const aspectRatio = W / H;
  return aspectRatio < 0.85 ? 0.29 : 0.44;
}

async function renderPdfPage(file: File): Promise<{
  fullDataUrl: string;
  initialCropRatio: number;
  fullCanvas: HTMLCanvasElement;
}> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
  const page = await pdf.getPage(1);

  const scale = 2;
  const viewport = page.getViewport({ scale });

  const fullCanvas = document.createElement("canvas");
  fullCanvas.width = viewport.width;
  fullCanvas.height = viewport.height;
  await page.render({ canvasContext: fullCanvas.getContext("2d")!, canvas: fullCanvas, viewport }).promise;

  const initialCropRatio = detectHeaderCropRatio(fullCanvas);
  const fullDataUrl = fullCanvas.toDataURL("image/jpeg", 0.82);

  return { fullDataUrl, initialCropRatio, fullCanvas };
}
