"use client";

import { useRef, useState } from "react";
import { Download, AlertCircle, X, GripVertical } from "lucide-react";
import { BuildItCard, type CardVariant } from "./BuildItCard";
import { A4Flyer, type A4FlyerProduct } from "./A4Flyer";

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

function toFlyerProduct(item: CardItem): A4FlyerProduct {
  return {
    productName: item.productName,
    productUnit: item.productUnit,
    productVariant: item.productVariant,
    productVariants: item.productVariants,
    productPrice: item.productPrice,
    productImageData: item.productImageData,
    priceOverride: item.priceOverride,
    originalPrice: item.originalPrice,
  };
}

export function PromoCardsSection({
  items,
  promoSlug,
}: {
  items: CardItem[];
  promoSlug: string;
}) {
  // --- Square card state ---
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [exportingAll, setExportingAll] = useState(false);
  const [exportDone, setExportDone] = useState(0);
  const [batchFailures, setBatchFailures] = useState<FailedItem[]>([]);
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});

  // --- Format / flyer state ---
  const [viewMode, setViewMode] = useState<"cards" | "flyer">("cards");
  const [flyerPages, setFlyerPages] = useState<1 | 2>(1);
  const [productOrder, setProductOrder] = useState<string[]>(() => items.map((i) => i.id));
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const flyerRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const [exportingFlyer, setExportingFlyer] = useState(false);
  const [flyerExportDone, setFlyerExportDone] = useState(0);
  const [flyerFailures, setFlyerFailures] = useState<FailedItem[]>([]);

  // Keep productOrder in sync when items change (e.g. navigating back)
  const knownIds = new Set(items.map((i) => i.id));
  const filteredOrder = productOrder.filter((id) => knownIds.has(id));
  const missingIds = items.map((i) => i.id).filter((id) => !filteredOrder.includes(id));
  const effectiveOrder = [...filteredOrder, ...missingIds];

  const orderedItems = effectiveOrder
    .map((id) => items.find((i) => i.id === id))
    .filter(Boolean) as CardItem[];

  const splitIdx = Math.ceil(orderedItems.length / 2);
  const page1Items = flyerPages === 2 ? orderedItems.slice(0, splitIdx) : orderedItems;
  const page2Items = flyerPages === 2 ? orderedItems.slice(splitIdx) : [];

  const flyerPageCount = flyerPages === 2 ? 2 : 1;
  const flyerFilename = (page: number) =>
    `${promoSlug}-flyer-page-${page}.png`;

  // --- Drag-to-reorder handlers ---
  function handleDragStart(e: React.DragEvent<HTMLLIElement>, idx: number) {
    setDraggingIndex(idx);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e: React.DragEvent<HTMLLIElement>, idx: number) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverIndex !== idx) setDragOverIndex(idx);
  }

  function handleDrop(e: React.DragEvent<HTMLLIElement>, idx: number) {
    e.preventDefault();
    if (draggingIndex === null || draggingIndex === idx) {
      setDraggingIndex(null);
      setDragOverIndex(null);
      return;
    }
    setProductOrder((prev) => {
      const next = [...prev];
      const [moved] = next.splice(draggingIndex, 1);
      next.splice(idx, 0, moved);
      return next;
    });
    setDraggingIndex(null);
    setDragOverIndex(null);
  }

  function handleDragEnd() {
    setDraggingIndex(null);
    setDragOverIndex(null);
  }

  // --- Square card export helpers ---
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

    if ("showDirectoryPicker" in window) {
      let dirHandle: FileSystemDirectoryHandle;
      try {
        dirHandle = await (
          window as Window &
            typeof globalThis & {
              showDirectoryPicker: (o?: object) => Promise<FileSystemDirectoryHandle>;
            }
        ).showDirectoryPicker({ mode: "readwrite", startIn: "downloads" });
      } catch {
        return;
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

  // --- Flyer export helpers ---
  function setFlyerRef(page: number, el: HTMLDivElement | null) {
    if (el) flyerRefs.current.set(page, el);
    else flyerRefs.current.delete(page);
  }

  async function exportFlyer(page: number) {
    const el = flyerRefs.current.get(page);
    if (!el) throw new Error("Flyer element not found — try scrolling it into view first.");
    const { toPng } = await import("html-to-image");
    const dataUrl = await toPng(el, { pixelRatio: 2, cacheBust: true });
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = flyerFilename(page + 1);
    a.click();
  }

  async function handleExportAllFlyers() {
    const { toPng } = await import("html-to-image");
    setFlyerExportDone(0);
    setFlyerFailures([]);

    const pages = Array.from({ length: flyerPageCount }, (_, i) => i);

    if ("showDirectoryPicker" in window) {
      let dirHandle: FileSystemDirectoryHandle;
      try {
        dirHandle = await (
          window as Window &
            typeof globalThis & {
              showDirectoryPicker: (o?: object) => Promise<FileSystemDirectoryHandle>;
            }
        ).showDirectoryPicker({ mode: "readwrite", startIn: "downloads" });
      } catch {
        return;
      }
      setExportingFlyer(true);
      try {
        for (const page of pages) {
          const el = flyerRefs.current.get(page);
          const fname = flyerFilename(page + 1);
          if (!el) {
            setFlyerFailures((f) => [...f, { filename: fname, error: "Page element not found." }]);
            continue;
          }
          try {
            const dataUrl = await toPng(el, { pixelRatio: 2, cacheBust: true });
            const blob = await (await fetch(dataUrl)).blob();
            const fileHandle = await dirHandle.getFileHandle(fname, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(blob);
            await writable.close();
            setFlyerExportDone((n) => n + 1);
          } catch (err) {
            setFlyerFailures((f) => [...f, { filename: fname, error: friendlyError(err) }]);
          }
        }
      } finally {
        setExportingFlyer(false);
      }
      return;
    }

    setExportingFlyer(true);
    try {
      for (const page of pages) {
        try {
          await exportFlyer(page);
          setFlyerExportDone((n) => n + 1);
        } catch (err) {
          setFlyerFailures((f) => [
            ...f,
            { filename: flyerFilename(page + 1), error: friendlyError(err) },
          ]);
        }
        await new Promise<void>((r) => setTimeout(r, 300));
      }
    } finally {
      setExportingFlyer(false);
    }
  }

  const totalAttempted = exportDone + batchFailures.length;
  const progressPct = items.length > 0 ? Math.round((totalAttempted / items.length) * 100) : 0;
  const flyerTotalAttempted = flyerExportDone + flyerFailures.length;
  const flyerProgressPct =
    flyerPageCount > 0 ? Math.round((flyerTotalAttempted / flyerPageCount) * 100) : 0;

  const sharedFlyerProps = {
    headerImageData: items[0]?.headerImageData ?? null,
    promoDateFrom: items[0]?.promoDateFrom ?? new Date(),
    promoDateTo: items[0]?.promoDateTo ?? new Date(),
    storeName: items[0]?.storeName,
    storeAddress: items[0]?.storeAddress,
    storePhone: items[0]?.storePhone,
  };

  return (
    <div className="mt-8">
      {/* Format + controls toolbar */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        {/* Format toggle */}
        <div className="flex rounded-md border border-black/15 overflow-hidden text-sm">
          <button
            type="button"
            onClick={() => setViewMode("cards")}
            className={`px-3 py-1.5 font-medium transition-colors ${viewMode === "cards" ? "bg-black text-white" : "bg-white text-black hover:bg-black/5"}`}
          >
            Square Cards
          </button>
          <button
            type="button"
            onClick={() => setViewMode("flyer")}
            className={`px-3 py-1.5 font-medium transition-colors border-l border-black/15 ${viewMode === "flyer" ? "bg-black text-white" : "bg-white text-black hover:bg-black/5"}`}
          >
            A4 Flyer
          </button>
        </div>

        {viewMode === "flyer" && (
          <div className="flex rounded-md border border-black/15 overflow-hidden text-sm">
            <button
              type="button"
              onClick={() => setFlyerPages(1)}
              className={`px-3 py-1.5 font-medium transition-colors ${flyerPages === 1 ? "bg-black text-white" : "bg-white text-black hover:bg-black/5"}`}
            >
              1 Page
            </button>
            <button
              type="button"
              onClick={() => setFlyerPages(2)}
              className={`px-3 py-1.5 font-medium transition-colors border-l border-black/15 ${flyerPages === 2 ? "bg-black text-white" : "bg-white text-black hover:bg-black/5"}`}
            >
              2 Pages
            </button>
          </div>
        )}

        {viewMode === "cards" && (
          <>
            <p className="text-sm text-(--hub-muted)">
              {items.length} card{items.length !== 1 ? "s" : ""} — click Export PNG on each card to
              download at 1080×1080px.
            </p>
            {items.length > 1 && (
              <button
                type="button"
                onClick={handleExportAll}
                disabled={exportingAll}
                className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white hover:bg-black/80 disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                {exportingAll ? "Downloading…" : "Download All"}
              </button>
            )}
          </>
        )}

        {viewMode === "flyer" && (
          <button
            type="button"
            onClick={handleExportAllFlyers}
            disabled={exportingFlyer}
            className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white hover:bg-black/80 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            {exportingFlyer
              ? "Exporting…"
              : flyerPageCount === 1
                ? "Export Flyer"
                : "Export All Pages"}
          </button>
        )}
      </div>

      {/* ── Square cards mode ── */}
      {viewMode === "cards" && (
        <>
          {/* Progress bar */}
          {exportingAll && (
            <div className="mb-6 rounded-lg border border-black/10 bg-black/3 p-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-(--hub-text)">Downloading cards…</span>
                <span className="text-(--hub-muted)">
                  {totalAttempted} / {items.length}
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

          {/* Batch failure summary */}
          {!exportingAll && batchFailures.length > 0 && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                  <p className="text-sm font-medium text-red-800">
                    {batchFailures.length} card{batchFailures.length !== 1 ? "s" : ""} failed to
                    download
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
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
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
                  <div className="flex max-w-[200px] items-start gap-1.5">
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
                    <p className="text-xs leading-snug text-red-600">{cardErrors[item.id]}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── A4 Flyer mode ── */}
      {viewMode === "flyer" && (
        <>
          {/* Product reorder panel */}
          {orderedItems.length > 1 && (
            <div className="mb-6 rounded-xl border border-black/10 bg-white p-4">
              <p className="mb-3 text-sm font-medium text-(--hub-text)">
                Product order{" "}
                <span className="font-normal text-(--hub-muted)">
                  — drag to rearrange
                  {flyerPages === 2 && (
                    <>
                      {" "}(first {splitIdx} on page 1, rest on page 2)
                    </>
                  )}
                </span>
              </p>
              <ul className="space-y-1.5">
                {orderedItems.map((item, idx) => (
                  <li
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDrop={(e) => handleDrop(e, idx)}
                    onDragEnd={handleDragEnd}
                    className={`flex cursor-grab select-none items-center gap-2 rounded-md border px-2.5 py-2 text-sm transition-colors active:cursor-grabbing ${
                      dragOverIndex === idx && draggingIndex !== idx
                        ? "border-blue-400 bg-blue-50"
                        : draggingIndex === idx
                          ? "border-black/20 bg-black/5 opacity-60"
                          : "border-black/10 bg-white"
                    }`}
                  >
                    <GripVertical className="h-4 w-4 shrink-0 text-black/30" />
                    <span className="font-medium text-black/80">{item.productName}</span>
                    {flyerPages === 2 && (
                      <span className="ml-auto text-xs text-black/40">
                        Page {idx < splitIdx ? 1 : 2}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Flyer export progress */}
          {exportingFlyer && (
            <div className="mb-6 rounded-lg border border-black/10 bg-black/3 p-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-(--hub-text)">Exporting flyer pages…</span>
                <span className="text-(--hub-muted)">
                  {flyerTotalAttempted} / {flyerPageCount}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-black/10">
                <div
                  className="h-full rounded-full bg-black transition-all duration-300 ease-out"
                  style={{ width: `${flyerProgressPct}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs text-(--hub-muted)">{flyerProgressPct}% complete</p>
            </div>
          )}

          {/* Flyer failure summary */}
          {!exportingFlyer && flyerFailures.length > 0 && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                  <p className="text-sm font-medium text-red-800">
                    {flyerFailures.length} page{flyerFailures.length !== 1 ? "s" : ""} failed to
                    export
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFlyerFailures([])}
                  className="shrink-0 text-red-400 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <ul className="mt-2 space-y-1 pl-6">
                {flyerFailures.map((f, i) => (
                  <li key={i} className="text-xs text-red-700">
                    <span className="font-medium">{f.filename}</span> — {f.error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Flyer page(s) */}
          <div className="flex flex-col gap-10">
            {[page1Items, ...(flyerPages === 2 ? [page2Items] : [])].map((pageProducts, pageIdx) => (
              <div key={pageIdx} className="flex flex-col items-start gap-3">
                {flyerPages === 2 && (
                  <p className="text-sm font-semibold text-(--hub-muted)">Page {pageIdx + 1}</p>
                )}
                <div className="overflow-x-auto">
                  <div
                    ref={(el) => setFlyerRef(pageIdx, el)}
                    style={{ display: "inline-block" }}
                  >
                    <A4Flyer
                      {...sharedFlyerProps}
                      products={pageProducts.map(toFlyerProduct)}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  disabled={exportingFlyer}
                  onClick={() => exportFlyer(pageIdx)}
                  className="inline-flex items-center gap-1.5 rounded-md bg-black px-3 py-1.5 text-xs font-medium text-white hover:bg-black/80 disabled:opacity-50"
                >
                  <Download className="h-3.5 w-3.5" />
                  Export Page {pageIdx + 1}
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
