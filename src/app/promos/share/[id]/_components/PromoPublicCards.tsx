"use client";

import { useRef, useState } from "react";
import { Download, AlertCircle } from "lucide-react";
import { BuildItCard, type CardVariant } from "@/app/hub/promos/_components/BuildItCard";

export type PublicCardItem = {
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

export function PromoPublicCards({ items }: { items: PublicCardItem[] }) {
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [exportErrors, setExportErrors] = useState<Record<string, string>>({});

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

  return (
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
            disabled={exportingId === item.id}
            onClick={() => {
              setExportingId(item.id);
              exportCard(item.id, item.filename)
                .catch((err) =>
                  setExportErrors((prev) => ({ ...prev, [item.id]: String(err) }))
                )
                .finally(() => setExportingId(null));
            }}
            className="inline-flex items-center gap-1.5 rounded-md bg-black px-3 py-1.5 text-xs font-medium text-white hover:bg-black/80 disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" />
            {exportingId === item.id ? "Saving…" : "Save image"}
          </button>
          {exportErrors[item.id] && (
            <div className="flex max-w-[200px] items-start gap-1.5">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
              <p className="text-xs text-red-600">{exportErrors[item.id]}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
