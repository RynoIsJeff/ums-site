"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X, Sparkles, AlertCircle, ChevronDown, ChevronUp, Check } from "lucide-react";
import { BuildItCard } from "../../_components/BuildItCard";
import { schedulePromoPost } from "../../actions";
import type { CardItem } from "./PostToSocialsDialog";

type CampaignPost = {
  date: string;
  time: string;
  caption: string;
  reasoning: string;
};

type AICampaignInsights = {
  avgReach: number;
  topHour: number | null;
  historicalPostCount: number;
};

type Step = "configure" | "generating" | "review" | "scheduling" | "done" | "error";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  promoId: string;
  socialPages: { id: string; pageName: string }[];
  defaultPageId: string | null;
  items: CardItem[];
};

export function AICampaignDialog({
  isOpen,
  onClose,
  clientId,
  promoId,
  socialPages,
  defaultPageId,
  items,
}: Props) {
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const [step, setStep] = useState<Step>("configure");
  const [selectedPageId, setSelectedPageId] = useState<string>(
    defaultPageId ?? socialPages[0]?.id ?? "",
  );
  const [schedule, setSchedule] = useState<CampaignPost[]>([]);
  const [insights, setInsights] = useState<AICampaignInsights | null>(null);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setStep("configure");
      setSelectedPageId(defaultPageId ?? socialPages[0]?.id ?? "");
      setSchedule([]);
      setInsights(null);
      setExpandedRow(null);
      setProgress(0);
      setErrors([]);
    }
  }, [isOpen, defaultPageId, socialPages]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (
        e.key === "Escape" &&
        (step === "configure" || step === "review" || step === "done" || step === "error")
      ) {
        onClose();
      }
    },
    [onClose, step],
  );

  useEffect(() => {
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  async function handleGenerate() {
    if (!selectedPageId) return;
    setStep("generating");
    setErrors([]);

    try {
      const res = await fetch(`/api/hub/promos/${promoId}/ai-campaign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ socialPageId: selectedPageId }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }

      const data = (await res.json()) as {
        schedule: CampaignPost[];
        insights: AICampaignInsights;
      };

      setSchedule(data.schedule);
      setInsights(data.insights);
      setStep("review");
    } catch (e) {
      setErrors([e instanceof Error ? e.message : String(e)]);
      setStep("error");
    }
  }

  function updatePost(index: number, field: keyof CampaignPost, value: string) {
    setSchedule((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  }

  async function handleScheduleAll() {
    setStep("scheduling");
    setProgress(0);
    setErrors([]);
    // Close the modal immediately — scheduling continues in the background
    // and progress is shown in the floating pill.
    onClose();

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

      // 2. Upload each PNG to Supabase Storage once — reused for every day's post
      const publicUrls = await Promise.all(
        dataUrls.map(async (dataUrl) => {
          const res = await fetch("/api/hub/social/upload-url?name=promo-card.png");
          if (!res.ok) throw new Error("Failed to get upload URL");
          const { signedUrl, publicUrl } = (await res.json()) as {
            signedUrl: string;
            publicUrl: string;
          };
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

      // 3. Schedule one post per day
      const errs: string[] = [];
      for (let i = 0; i < schedule.length; i++) {
        const post = schedule[i];
        const result = await schedulePromoPost(
          clientId,
          promoId,
          [selectedPageId],
          post.caption,
          `${post.date}T${post.time}`,
          publicUrls,
        );
        if (!result.ok) {
          errs.push(`${post.date} ${post.time} — ${result.error ?? "Unknown error"}`);
        }
        setProgress(i + 1);
      }

      if (errs.length === 0) {
        setStep("done");
      } else {
        setStep("error");
        setErrors(errs);
      }
    } catch (e) {
      setStep("error");
      setErrors([e instanceof Error ? e.message : String(e)]);
    }
  }

  function dismissFloating() {
    setStep("configure");
    setSchedule([]);
    setErrors([]);
  }

  // During scheduling/done: render only the off-screen card divs (still needed for image capture)
  // plus a small floating progress pill — no blocking overlay.
  const isFloating = step === "scheduling" || (step === "done" && !isOpen) || (step === "error" && !isOpen);

  if (!isOpen && step !== "scheduling" && step !== "done" && step !== "error") return null;

  const selectedPage = socialPages.find((p) => p.id === selectedPageId);
  const canSchedule =
    schedule.length > 0 && schedule.every((p) => p.date && p.time && p.caption.trim());

  const pct = schedule.length > 0 ? Math.round((progress / schedule.length) * 100) : 0;

  return (
    <>
      {/* Hidden off-screen card renders for html-to-image — always mounted while component is alive */}
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

      {/* ── Floating progress pill (shown during scheduling / done / error) ── */}
      {isFloating && (
        <div className="fixed bottom-6 right-6 z-50 w-80 rounded-2xl bg-white shadow-2xl ring-1 ring-black/10">
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-black/5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-600 shrink-0" />
              <span className="text-sm font-medium text-gray-800">AI Campaign</span>
            </div>
            {(step === "done" || step === "error") && (
              <button
                type="button"
                onClick={dismissFloating}
                className="rounded p-0.5 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="px-4 py-3">
            {step === "scheduling" && (
              <div className="space-y-2">
                <p className="text-xs text-gray-600">
                  Uploading images &amp; scheduling posts… {progress}/{schedule.length}
                </p>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/10">
                  <div
                    className="h-full rounded-full bg-purple-600 transition-all duration-300 ease-out"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400">{pct}% complete</p>
              </div>
            )}

            {step === "done" && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600 shrink-0" />
                  <p className="text-sm font-medium text-gray-800">
                    {schedule.length} post{schedule.length !== 1 ? "s" : ""} scheduled!
                  </p>
                </div>
                <a
                  href="/hub/social/calendar"
                  className="inline-block text-xs text-purple-600 hover:underline"
                >
                  View in calendar →
                </a>
              </div>
            )}

            {step === "error" && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                  <p className="text-sm font-medium text-red-700">Scheduling failed</p>
                </div>
                {errors.length > 0 && (
                  <p className="text-xs text-red-600">{errors[0]}</p>
                )}
                <button
                  type="button"
                  onClick={() => { setStep("configure"); }}
                  className="text-xs text-gray-500 hover:underline"
                >
                  ← Try again
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Full-screen modal (configure / generating / review) ── */}
      {!isFloating && isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => {
              if (step === "configure" || step === "review" || step === "error") onClose();
            }}
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
              {/* Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-black/10 bg-white px-6 py-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  <h2 className="text-base font-semibold text-gray-900">AI Campaign Generator</h2>
                </div>
                {(step === "configure" || step === "review" || step === "error") && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-md p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>

              <div className="px-6 py-5">
                {/* ── Step: Configure ── */}
                {step === "configure" && (
                  <div className="space-y-5">
                    <p className="text-sm text-gray-600">
                      Select a Facebook page and let the AI plan your entire campaign — one post per
                      day at the optimal time, based on your page&apos;s performance history and fan
                      activity.
                    </p>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Facebook Page
                      </label>
                      {socialPages.length === 0 ? (
                        <p className="text-sm text-red-600">No connected Facebook pages found.</p>
                      ) : (
                        <select
                          value={selectedPageId}
                          onChange={(e) => setSelectedPageId(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                        >
                          {socialPages.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.pageName}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={!selectedPageId || socialPages.length === 0}
                      onClick={handleGenerate}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
                    >
                      <Sparkles className="h-4 w-4" />
                      Generate AI Campaign
                    </button>
                  </div>
                )}

                {/* ── Step: Generating ── */}
                {step === "generating" && (
                  <div className="flex flex-col items-center gap-4 py-8">
                    <div className="relative">
                      <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600" />
                      <Sparkles className="absolute inset-0 m-auto h-5 w-5 text-purple-600" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-gray-800">Analysing your page performance…</p>
                      <p className="mt-1 text-sm text-gray-500">
                        The AI is reviewing trends and crafting your campaign schedule.
                      </p>
                    </div>
                  </div>
                )}

                {/* ── Step: Review ── */}
                {step === "review" && (
                  <div className="space-y-4">
                    {insights && (
                      <div className="rounded-lg border border-purple-200 bg-purple-50 px-4 py-3">
                        <p className="text-xs font-medium text-purple-800">
                          {insights.historicalPostCount > 0
                            ? `Based on ${insights.historicalPostCount} historical promo posts for ${selectedPage?.pageName}`
                            : `No historical data yet — using fan activity patterns for ${selectedPage?.pageName}`}
                          {insights.topHour !== null &&
                            ` · Best hour: ${String(insights.topHour).padStart(2, "0")}:00`}
                          {insights.avgReach > 0 &&
                            ` · Avg reach: ${insights.avgReach.toLocaleString()}`}
                        </p>
                      </div>
                    )}

                    <p className="text-sm text-gray-600">
                      Review and edit the campaign below. Click any row to expand and edit the caption.
                    </p>

                    <div className="overflow-hidden rounded-xl border border-black/10">
                      {schedule.map((post, idx) => {
                        const isExpanded = expandedRow === idx;
                        const dayLabel = new Date(post.date + "T12:00:00").toLocaleDateString(
                          "en-ZA",
                          { weekday: "short", day: "numeric", month: "short" },
                        );

                        return (
                          <div
                            key={idx}
                            className={`border-b border-black/5 last:border-0 ${
                              isExpanded ? "bg-purple-50/40" : "hover:bg-gray-50"
                            }`}
                          >
                            <button
                              type="button"
                              className="flex w-full items-center gap-3 px-4 py-3 text-left"
                              onClick={() => setExpandedRow(isExpanded ? null : idx)}
                            >
                              <span className="w-20 shrink-0 text-xs font-medium text-gray-500">
                                {dayLabel}
                              </span>
                              <input
                                type="time"
                                value={post.time}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => updatePost(idx, "time", e.target.value)}
                                className="w-20 shrink-0 rounded border border-black/10 px-1.5 py-0.5 text-xs text-gray-800 focus:border-purple-400 focus:outline-none"
                              />
                              <span className="flex-1 truncate text-sm text-gray-700">
                                {post.caption}
                              </span>
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4 shrink-0 text-gray-400" />
                              ) : (
                                <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
                              )}
                            </button>

                            {isExpanded && (
                              <div className="space-y-3 px-4 pb-4">
                                <div>
                                  <label className="mb-1 block text-xs font-medium text-gray-600">
                                    Caption
                                  </label>
                                  <textarea
                                    value={post.caption}
                                    onChange={(e) => updatePost(idx, "caption", e.target.value)}
                                    rows={5}
                                    className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm text-gray-800 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20"
                                  />
                                </div>
                                <div className="rounded-md bg-purple-50 px-3 py-2">
                                  <p className="text-xs text-purple-700">
                                    <span className="font-medium">AI reasoning:</span>{" "}
                                    {post.reasoning}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => setStep("configure")}
                        className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
                      >
                        ← Regenerate
                      </button>
                      <button
                        type="button"
                        disabled={!canSchedule}
                        onClick={handleScheduleAll}
                        className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
                      >
                        <Sparkles className="h-4 w-4" />
                        Schedule {schedule.length} Post{schedule.length !== 1 ? "s" : ""}
                      </button>
                    </div>
                  </div>
                )}

                {/* ── Step: Error (while modal still open) ── */}
                {step === "error" && isOpen && (
                  <div className="space-y-4 py-2">
                    <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                      <div>
                        <p className="text-sm font-medium text-red-800">Something went wrong</p>
                        <ul className="mt-1 space-y-0.5">
                          {errors.map((e, i) => (
                            <li key={i} className="text-sm text-red-700">
                              {e}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep("configure")}
                      className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
                    >
                      ← Try again
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
