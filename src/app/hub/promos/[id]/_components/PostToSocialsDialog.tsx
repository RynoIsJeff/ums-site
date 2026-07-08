"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { BuildItCard } from "../../_components/BuildItCard";
import { schedulePromoPost } from "../../actions";
import type { CardVariant } from "../../_components/BuildItCard";

export type CardItem = {
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

type DateSlot = {
  id: number;
  date: string;
  time: string;
  caption: string;
};

type Status = "idle" | "uploading" | "scheduling" | "done" | "error";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  socialPages: { id: string; pageName: string }[];
  defaultPageId: string | null;
  items: CardItem[];
};

function tomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

let slotCounter = 0;

export function PostToSocialsDialog({ isOpen, onClose, clientId, socialPages, defaultPageId, items }: Props) {
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const initialPageIds = () =>
    defaultPageId ? new Set([defaultPageId]) : new Set(socialPages.map((p) => p.id));

  const [selectedPageIds, setSelectedPageIds] = useState<Set<string>>(initialPageIds);
  const [dateSlots, setDateSlots] = useState<DateSlot[]>([
    { id: ++slotCounter, date: tomorrow(), time: "09:00", caption: "" },
  ]);
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);

  // Reset state whenever dialog opens
  useEffect(() => {
    if (isOpen) {
      setSelectedPageIds(defaultPageId ? new Set([defaultPageId]) : new Set(socialPages.map((p) => p.id)));
      setDateSlots([{ id: ++slotCounter, date: tomorrow(), time: "09:00", caption: "" }]);
      setStatus("idle");
      setProgress(0);
      setErrors([]);
    }
  }, [isOpen, defaultPageId, socialPages]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && status === "idle") onClose();
    },
    [onClose, status],
  );
  useEffect(() => {
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  function togglePage(pageId: string) {
    setSelectedPageIds((prev) => {
      const next = new Set(prev);
      if (next.has(pageId)) next.delete(pageId);
      else next.add(pageId);
      return next;
    });
  }

  function addSlot() {
    setDateSlots((prev) => [
      ...prev,
      { id: ++slotCounter, date: tomorrow(), time: "09:00", caption: "" },
    ]);
  }

  function removeSlot(id: number) {
    setDateSlots((prev) => prev.filter((s) => s.id !== id));
  }

  function updateSlot(id: number, field: keyof Omit<DateSlot, "id">, value: string) {
    setDateSlots((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  }

  async function handleScheduleAll() {
    if (selectedPageIds.size === 0 || dateSlots.length === 0) return;

    setStatus("uploading");
    setProgress(0);
    setErrors([]);

    try {
      // 1. Render all cards to PNG data URLs
      const { toPng } = await import("html-to-image");
      const dataUrls = await Promise.all(
        items.map((item) => {
          const el = cardRefs.current.get(item.id);
          if (!el) throw new Error(`Card element not mounted for item ${item.id}`);
          return toPng(el, { pixelRatio: 2, cacheBust: true });
        }),
      );

      // 2. Upload each PNG to Supabase Storage
      const publicUrls = await Promise.all(
        dataUrls.map(async (dataUrl) => {
          const res = await fetch("/api/hub/social/upload-url?name=promo-card.png");
          if (!res.ok) throw new Error("Failed to get upload URL");
          const { signedUrl, publicUrl } = (await res.json()) as { signedUrl: string; publicUrl: string };
          const blob = await fetch(dataUrl).then((r) => r.blob());
          const uploadRes = await fetch(signedUrl, {
            method: "PUT",
            body: blob,
            headers: { "Content-Type": "image/png" },
          });
          if (!uploadRes.ok) throw new Error("Failed to upload image");
          return publicUrl;
        }),
      );

      // 3. Schedule one post per date slot
      setStatus("scheduling");
      const errs: string[] = [];
      for (let i = 0; i < dateSlots.length; i++) {
        const slot = dateSlots[i];
        const result = await schedulePromoPost(
          clientId,
          [...selectedPageIds],
          slot.caption,
          `${slot.date}T${slot.time}`,
          publicUrls,
        );
        if (!result.ok) {
          errs.push(`${slot.date} ${slot.time} — ${result.error ?? "Unknown error"}`);
        }
        setProgress(i + 1);
      }

      if (errs.length === 0) {
        setStatus("done");
        setTimeout(onClose, 1800);
      } else {
        setStatus("error");
        setErrors(errs);
      }
    } catch (e) {
      setStatus("error");
      setErrors([e instanceof Error ? e.message : String(e)]);
    }
  }

  const busy = status === "uploading" || status === "scheduling";
  const canSchedule =
    selectedPageIds.size > 0 &&
    dateSlots.length > 0 &&
    dateSlots.every((s) => s.date && s.time && s.caption.trim());

  if (!isOpen) return null;

  return (
    <>
      {/* Hidden off-screen card renders for html-to-image */}
      <div
        aria-hidden="true"
        style={{ position: "fixed", left: -9999, top: 0, pointerEvents: "none", zIndex: -1 }}
      >
        {items.map((item) => (
          <div
            key={item.id}
            ref={(el) => {
              if (el) cardRefs.current.set(item.id, el);
              else cardRefs.current.delete(item.id);
            }}
            style={{ display: "inline-block" }}
          >
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
        ))}
      </div>

      {/* Backdrop */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="absolute inset-0" onClick={busy ? undefined : onClose} aria-hidden="true" />

        {/* Dialog */}
        <div
          className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-(--hub-border-light) bg-white p-6 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-(--hub-text)">Post to Socials</h2>
            {!busy && (
              <button
                type="button"
                onClick={onClose}
                className="rounded p-1 text-black/50 hover:bg-black/5 hover:text-black"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Facebook pages */}
          <div className="mb-5">
            <label className="mb-1.5 block text-sm font-medium">Facebook page(s)</label>
            {socialPages.length === 0 ? (
              <p className="text-sm text-(--hub-muted)">
                No Facebook pages connected. Connect a page in{" "}
                <a href="/hub/social/pages" className="underline">Social → Pages</a>.
              </p>
            ) : (
              <>
                <div className="mb-1.5 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedPageIds(new Set(socialPages.map((p) => p.id)))}
                    className="text-xs underline text-black/60 hover:text-black"
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPageIds(new Set())}
                    className="text-xs underline text-black/60 hover:text-black"
                  >
                    None
                  </button>
                  <span className="text-xs text-black/40">{selectedPageIds.size} selected</span>
                </div>
                <div className="max-h-28 space-y-1.5 overflow-y-auto rounded-lg border border-(--hub-border-light) p-2">
                  {socialPages.map((p) => (
                    <label key={p.id} className="flex cursor-pointer items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedPageIds.has(p.id)}
                        onChange={() => togglePage(p.id)}
                        disabled={busy}
                        className="rounded border-black/20"
                      />
                      <span>{p.pageName}</span>
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Date slots */}
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium">Post schedule</label>
            <div className="space-y-4">
              {dateSlots.map((slot, idx) => (
                <div key={slot.id} className="rounded-lg border border-(--hub-border-light) p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-(--hub-muted)">Post {idx + 1}</span>
                    {dateSlots.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSlot(slot.id)}
                        disabled={busy}
                        className="rounded p-0.5 text-black/40 hover:text-red-600 disabled:opacity-40"
                        aria-label="Remove this date"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="mb-2 flex gap-2">
                    <input
                      type="date"
                      value={slot.date}
                      onChange={(e) => updateSlot(slot.id, "date", e.target.value)}
                      disabled={busy}
                      required
                      className="flex-1 rounded-md border border-black/15 px-3 py-2 text-sm disabled:opacity-50"
                    />
                    <input
                      type="time"
                      value={slot.time}
                      onChange={(e) => updateSlot(slot.id, "time", e.target.value)}
                      disabled={busy}
                      required
                      className="w-28 rounded-md border border-black/15 px-3 py-2 text-sm disabled:opacity-50"
                    />
                  </div>
                  <textarea
                    value={slot.caption}
                    onChange={(e) => updateSlot(slot.id, "caption", e.target.value)}
                    disabled={busy}
                    required
                    rows={3}
                    placeholder="Caption for this post…"
                    className="w-full rounded-md border border-black/15 px-3 py-2 text-sm disabled:opacity-50"
                  />
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addSlot}
              disabled={busy}
              className="mt-3 inline-flex items-center gap-1.5 text-sm text-black/60 hover:text-black disabled:opacity-40"
            >
              <Plus className="h-4 w-4" />
              Add date
            </button>
          </div>

          {/* Progress / status */}
          {status !== "idle" && (
            <div
              className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
                status === "done"
                  ? "border-green-200 bg-green-50 text-green-800"
                  : status === "error"
                    ? "border-red-200 bg-red-50 text-red-800"
                    : "border-black/10 bg-black/4 text-black/70"
              }`}
            >
              {status === "uploading" && (
                <p>Uploading {items.length} card image{items.length !== 1 ? "s" : ""}…</p>
              )}
              {status === "scheduling" && (
                <p>
                  Scheduling post {Math.min(progress + 1, dateSlots.length)} of {dateSlots.length}…
                </p>
              )}
              {status === "done" && <p>All {dateSlots.length} post{dateSlots.length !== 1 ? "s" : ""} scheduled!</p>}
              {status === "error" && (
                <>
                  <p className="font-medium">Some posts could not be scheduled:</p>
                  <ul className="mt-1 list-inside list-disc space-y-0.5">
                    {errors.map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleScheduleAll}
              disabled={busy || !canSchedule || socialPages.length === 0}
              className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black/80 disabled:opacity-40"
            >
              {busy
                ? status === "uploading"
                  ? "Uploading…"
                  : `Scheduling ${progress}/${dateSlots.length}…`
                : `Schedule ${dateSlots.length} post${dateSlots.length !== 1 ? "s" : ""}`}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="rounded-md border border-black/15 px-4 py-2 text-sm hover:bg-black/5 disabled:opacity-40"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
