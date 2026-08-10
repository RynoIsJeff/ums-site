"use client";

import { useRef, useState } from "react";
import { Download } from "lucide-react";
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

export function PromoCardsSection({ items }: { items: CardItem[] }) {
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [exportingAll, setExportingAll] = useState(false);
  const [exportDone, setExportDone] = useState(0);
  const [exportingId, setExportingId] = useState<string | null>(null);

  function setRef(id: string, el: HTMLDivElement | null) {
    if (el) cardRefs.current.set(id, el);
    else cardRefs.current.delete(id);
  }

  async function exportCard(id: string, filename: string) {
    const el = cardRefs.current.get(id);
    if (!el) return;
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
          if (!el) continue;
          const dataUrl = await toPng(el, { pixelRatio: 2, cacheBust: true });
          const blob = await (await fetch(dataUrl)).blob();
          const fileHandle = await dirHandle.getFileHandle(item.filename, { create: true });
          const writable = await fileHandle.createWritable();
          await writable.write(blob);
          await writable.close();
          setExportDone((n) => n + 1);
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
        await exportCard(item.id, item.filename);
        setExportDone((n) => n + 1);
        await new Promise<void>((r) => setTimeout(r, 300));
      }
    } finally {
      setExportingAll(false);
    }
  }

  const progressPct = items.length > 0 ? Math.round((exportDone / items.length) * 100) : 0;

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
            {exportingAll ? `Downloading…` : "Download All"}
          </button>
        )}
      </div>

      {/* Progress bar — shown during Download All */}
      {exportingAll && (
        <div className="mb-6 rounded-lg border border-black/10 bg-black/3 p-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-(--hub-text)">
              Downloading cards…
            </span>
            <span className="text-(--hub-muted)">
              {exportDone} / {items.length}
            </span>
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
                setExportingId(item.id);
                exportCard(item.id, item.filename).finally(() => setExportingId(null));
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
          </div>
        ))}
      </div>
    </div>
  );
}
