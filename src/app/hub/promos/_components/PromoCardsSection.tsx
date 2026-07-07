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
        await new Promise<void>((r) => setTimeout(r, 300));
      }
    } finally {
      setExportingAll(false);
    }
  }

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
              <Download className="h-3.5 w-3.5" />
              {exportingId === item.id ? "Exporting…" : "Export PNG"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
