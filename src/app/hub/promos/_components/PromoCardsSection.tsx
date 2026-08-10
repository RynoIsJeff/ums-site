"use client";

import { useRef, useState } from "react";
import { Download, AlertCircle, X } from "lucide-react";
import { BuildItCard, type CardVariant } from "./BuildItCard";

type CardItem = {
  id: string;
  filename: string;
  headerImageData: string | null;
  promoDateFrom: Date;
  promoDateTo: Date;
  storeName?: string | null;
  storeNumber?: string | null;
  storeAddress?: string | null;
  storePhone?: string | null;
  productName: string;
  productUnit?: string | null;
  productVariant?: string | null;
  productVariants?: CardVariant[] | null;
  productPrice: number;
  productImageData: string | null;
  priceOverride?: number | null;
  originalPrice?: number | null;
};

type FailedItem = { filename: string; error: string };

function friendlyError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes("cross-origin") || msg.includes("CORS") || msg.includes("tainted"))
    return "Image could not be captured (cross-origin image restriction).";
  if (msg.includes("QuotaExceeded") || msg.includes("quota"))
    return "Not enough disk space to save the file.";
  if (msg.includes("NotAllowedError") || msg.includes("permission"))
    return "Permission denied — check that the save folder is accessible.";
  if (msg.includes("NetworkError") || msg.includes("fetch"))
    return "Network error while preparing the image.";
  return msg || "Unknown error.";
}

export function PromoCardsSection({ items }: { items: CardItem[] }) {
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [exportingAll, setExportingAll] = useState(false);
  const [exportDone, setExportDone] = useState(0);
  const [batchFailures, setBatchFailures] = useState<FailedItem[]>([]);
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});

  function setRef(id: string, el: HTMLDivElement | null) {
    if (el) cardRefs.current.set(id, el);
    else cardRefs.current.delete(id);
  }

  function clearCardError(id: string) {
    setCardErrors((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  async function exportCard(id: string, filename: string) {
    const el = cardRefs.current.get(id);
    if (!el) throw new Error("Card element not found — try scrolling it into view first.");
    const { toPng } = await import("html-to-image");
    const dataUrl = await toPng(el, { pixelRatio: 2, cacheBust: true });
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = filename;
    a.click();
  }

  async function handleExportAll() {
    const { toPng } = await import("html-to-image");
    setExportDone(0);
    setBatchFailures([]);

    // Chrome / Edge: open a folder-picker so the user chooses where to save
    if ("showDirectoryPicker" in window) {
      let dirHandle: FileSystemDirectoryHandle;
      try {
        dirHandle = await (window as Window & typeof globalThis & { showDirectoryPicker: (o?: object) => Promise<FileSystemDirectoryHandle> })
          .showDirectoryPicker({ mode: "readwrite", startIn: "downloads" });
      } catch {
        return; // user cancelled the picker
      }
      setExportingAll(true);
      try {
        for (const item of items) {
          const el = cardRefs.current.get(item.id);
          if (!el) {
            setBatchFailures((f) => [...f, { filename: item.filename, error: "Card element not found." }]);
            continue;
          }
          try {
            const dataUrl = await toPng(el, { pixelRatio: 2, cacheBust: true });
            const blob = await (await fetch(dataUrl)).blob();
            const fileHandle = await dirHandle.getFileHandle(item.filename, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(blob);
            await writable.close();
            setExportDone((n) => n + 1);
          } catch (err) {
            setBatchFailures((f) => [...f, { filename: item.filename, error: friendlyError(err) }]);
          }
        }
      } finally {
        setExportingAll(false);
      }
      return;
    }

    // Fallback for Firefox / Safari: download one by one to the default Downloads folder
    setExportingAll(true);
    try {
      for (const item of items) {
        try {
          await exportCard(item.id, item.filename);
          setExportDone((n) => n + 1);
        } catch (err) {
          setBatchFailures((f) => [...f, { filename: item.filename, error: friendlyError(err) }]);
        }
        await new Promise<void>((r) => setTimeout(r, 300));
      }
    } finally {
      setExportingAll(false);
    }
  }

  const totalAttempted = exportDone + batchFailures.length;
  const progressPct = items.length > 0 ? Math.round((totalAttempted / items.length) * 100) : 0;

  return (
    <div className="mt-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <p className="text-sm text-(--hub-muted)">
          {items.length} card{items.length !== 1 ? "s" : ""} — click Export PNG on each card to download at 1080×1080px.
        </p>
        {items.length > 1 && (
          <button
            type="button"
            onClick={handleExportAll}
            disabled={exportingAll}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white hover:bg-black/80 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            {exportingAll ? "Downloading…" : "Download All"}
          </button>
        )}
      </div>

      {/* Progress bar — shown while Download All is running */}
      {exportingAll && (
        <div className="mb-6 rounded-lg border border-black/10 bg-black/3 p-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-(--hub-text)">Downloading cards…</span>
            <span className="text-(--hub-muted)">{totalAttempted} / {items.length}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-black/10">
            <div
              className="h-full rounded-full bg-black transition-all duration-300 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-(--hub-muted)">{progressPct}% complete</p>
        </div>
      )}

      {/* Batch failure summary — shown after Download All finishes with errors */}
      {!exportingAll && batchFailures.length > 0 && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
              <p className="text-sm font-medium text-red-800">
                {batchFailures.length} card{batchFailures.length !== 1 ? "s" : ""} failed to download
              </p>
            </div>
            <button
              type="button"
              onClick={() => setBatchFailures([])}
              className="shrink-0 text-red-400 hover:text-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <ul className="mt-2 space-y-1 pl-6">
            {batchFailures.map((f, i) => (
              <li key={i} className="text-xs text-red-700">
                <span className="font-medium">{f.filename}</span> — {f.error}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap gap-8">
        {items.map((item) => (
          <div key={item.id} className="flex flex-col items-start gap-2">
            <div ref={(el) => setRef(item.id, el)} style={{ display: "inline-block" }}>
              <BuildItCard
                headerImageData={item.headerImageData}
                promoDateFrom={item.promoDateFrom}
                promoDateTo={item.promoDateTo}
                storeName={item.storeName}
                storeNumber={item.storeNumber}
                storeAddress={item.storeAddress}
                storePhone={item.storePhone}
                productName={item.productName}
                productUnit={item.productUnit}
                productVariant={item.productVariant}
                productVariants={item.productVariants}
                productPrice={item.productPrice}
                productImageData={item.productImageData}
                priceOverride={item.priceOverride}
                originalPrice={item.originalPrice}
              />
            </div>
            <button
              type="button"
              disabled={exportingAll || exportingId === item.id}
              onClick={() => {
                clearCardError(item.id);
                setExportingId(item.id);
                exportCard(item.id, item.filename)
                  .catch((err) =>
                    setCardErrors((prev) => ({ ...prev, [item.id]: friendlyError(err) }))
                  )
                  .finally(() => setExportingId(null));
              }}
              className="inline-flex items-center gap-1.5 rounded-md bg-black px-3 py-1.5 text-xs font-medium text-white hover:bg-black/80 disabled:opacity-50"
            >
              {exportingId === item.id ? (
                <>
                  <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Exporting…
                </>
              ) : (
                <>
                  <Download className="h-3.5 w-3.5" />
                  Export PNG
                </>
              )}
            </button>
            {cardErrors[item.id] && (
              <div className="flex items-start gap-1.5 max-w-[200px]">
                <AlertCircle className="h-3.5 w-3.5 shrink-0 text-red-500 mt-0.5" />
                <p className="text-xs text-red-600 leading-snug">{cardErrors[item.id]}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
