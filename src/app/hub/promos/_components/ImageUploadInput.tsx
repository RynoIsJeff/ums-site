"use client";

import { useRef, useState } from "react";

type Props = {
  name: string;
  label: string;
  currentImageData?: string | null;
  clearInputName?: string;
  // When true, also accepts PDFs and extracts the top 30% of page 1 as the header image
  acceptPdf?: boolean;
};

export function ImageUploadInput({ name, label, currentImageData, clearInputName, acceptPdf }: Props) {
  const [preview, setPreview] = useState<string | null>(currentImageData ?? null);
  const [cleared, setCleared] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [err, setErr] = useState("");
  const hiddenRef = useRef<HTMLInputElement>(null);
  const clearRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setErr("");
    setProcessing(true);

    try {
      const dataUrl =
        file.type === "application/pdf"
          ? await extractPdfHeader(file)
          : await compressImage(file, 1200, 0.85);

      setPreview(dataUrl);
      setCleared(false);
      if (hiddenRef.current) hiddenRef.current.value = dataUrl;
      if (clearRef.current) clearRef.current.value = "0";
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to process file");
    } finally {
      setProcessing(false);
    }
  }

  function handleClear() {
    setPreview(null);
    setCleared(true);
    setErr("");
    if (hiddenRef.current) hiddenRef.current.value = "";
    if (clearRef.current) clearRef.current.value = "1";
  }

  const accept = acceptPdf ? "image/*,application/pdf" : "image/*";
  const uploadLabel = acceptPdf ? "Click to upload image or PDF" : "Click to upload image";

  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input type="hidden" name={name} ref={hiddenRef} defaultValue={currentImageData ?? ""} />
      {clearInputName && (
        <input type="hidden" name={clearInputName} ref={clearRef} defaultValue={cleared ? "1" : "0"} />
      )}

      {preview && !cleared ? (
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
      ) : (
        <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-black/20 px-4 py-3 text-sm text-(--hub-muted) hover:border-black/40">
          {processing ? (
            <>
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>{acceptPdf ? "Extracting header from PDF…" : "Processing…"}</span>
            </>
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

// Fraction of page 1's height to capture as the header image.
// The Build It "Say Yes to Great Deals" banner occupies ~28% of the A4 page.
const PDF_HEADER_CROP = 0.28;

async function extractPdfHeader(file: File): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist");

  // Load worker from CDN — avoids bundling the heavy worker into the app chunk
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
  const page = await pdf.getPage(1);

  // Render at 2× for crisp output; canvas height is cropped to header area only
  const scale = 2;
  const viewport = page.getViewport({ scale });
  const cropHeight = Math.round(viewport.height * PDF_HEADER_CROP);

  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = cropHeight;

  const ctx = canvas.getContext("2d")!;
  // Render the full page into the undersized canvas — content below cropHeight is clipped
  await page.render({ canvasContext: ctx, viewport }).promise;

  return canvas.toDataURL("image/jpeg", 0.92);
}
