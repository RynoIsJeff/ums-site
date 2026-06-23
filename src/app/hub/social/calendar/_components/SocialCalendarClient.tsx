"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { createPost } from "../../actions";
import { SchedulePostModal } from "./SchedulePostModal";

type CalendarPost = {
  id: string;
  caption: string;
  status: string;
  scheduledFor: string;
  clientName: string;
  clientId: string;
  pageId: string;
  pageName: string;
  externalPostId?: string | null;
};

type ExternalPost = {
  id: string;
  message?: string;
  picture?: string;
  createdTime: string;
  permalink?: string;
  pageId: string;
  pageName: string;
};

type PageOption = { id: string; pageName: string; clientId: string; clientName: string };

type SocialCalendarClientProps = {
  month: number;
  year: number;
  posts: CalendarPost[];
  externalPosts: ExternalPost[];
  pages: PageOption[];
  clients: { id: string; companyName: string }[];
  selectedPageIds: string[];
  baseUrl: string;
};

type TooltipState = { id: string; message?: string; picture?: string; x: number; y: number };

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getCalendarGrid(month: number, year: number) {
  const first = new Date(year, month - 1, 1);
  const last = new Date(year, month, 0);
  const startOffset = first.getDay();
  const totalDays = last.getDate();

  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const prevLast = new Date(prevYear, prevMonth, 0).getDate();

  const cells: { date: number; isCurrentMonth: boolean; iso: string }[] = [];

  for (let i = 0; i < startOffset; i++) {
    const d = prevLast - startOffset + i + 1;
    cells.push({ date: d, isCurrentMonth: false, iso: `${prevYear}-${String(prevMonth).padStart(2, "0")}-${String(d).padStart(2, "0")}` });
  }
  for (let d = 1; d <= totalDays; d++) {
    cells.push({ date: d, isCurrentMonth: true, iso: `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}` });
  }
  const remaining = 42 - cells.length;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  for (let d = 1; d <= remaining; d++) {
    cells.push({ date: d, isCurrentMonth: false, iso: `${nextYear}-${String(nextMonth).padStart(2, "0")}-${String(d).padStart(2, "0")}` });
  }

  return cells;
}

function toIsoDay(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function SocialCalendarClient({ month, year, posts, externalPosts, pages, clients, selectedPageIds, baseUrl }: SocialCalendarClientProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState("");
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  // Local filter state for immediate checkbox feedback (URL drives actual data)
  const allPageIds = pages.map((p) => p.id);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(
    () => new Set(selectedPageIds.length > 0 ? selectedPageIds : allPageIds)
  );
  // Sync when server navigation completes
  useEffect(() => {
    setCheckedIds(new Set(selectedPageIds.length > 0 ? selectedPageIds : allPageIds));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPageIds.join(","), allPageIds.join(",")]);

  const pushFilter = (ids: string[]) => {
    const params = new URLSearchParams({ month: String(month), year: String(year) });
    if (ids.length > 0 && ids.length < allPageIds.length) params.set("pages", ids.join(","));
    router.push(`${baseUrl}?${params.toString()}`);
  };

  const togglePage = (pageId: string) => {
    const next = new Set(checkedIds);
    if (next.has(pageId)) next.delete(pageId);
    else next.add(pageId);
    setCheckedIds(next);
    pushFilter([...next]);
  };

  const selectAll = () => {
    setCheckedIds(new Set(allPageIds));
    pushFilter([]);
  };

  const clearFilter = () => {
    setCheckedIds(new Set(allPageIds));
    pushFilter([]);
  };

  const handleClose = useCallback(() => setModalOpen(false), []);
  const handleSuccess = useCallback(() => router.refresh(), [router]);

  const cells = getCalendarGrid(month, year);
  const today = new Date();
  const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const umsExternalIds = new Set(posts.map((p) => p.externalPostId).filter(Boolean) as string[]);

  const pageOptions = pages.map((p) => ({ id: p.id, pageName: p.pageName, clientId: p.clientId }));

  return (
    <>
      {/* Page filter */}
      <div className="mb-6 rounded-xl border border-(--hub-border-light) bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-(--hub-text)">Filter by Facebook page</h3>
        {pages.length === 0 ? (
          <p className="text-sm text-(--hub-muted)">No Facebook pages connected. Connect one in Pages.</p>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-wrap gap-2">
              {pages.map((p) => (
                <label key={p.id} className="flex cursor-pointer items-center gap-2 rounded-lg border border-(--hub-border-light) px-3 py-2 text-sm hover:bg-black/5 has-[:checked]:border-(--primary) has-[:checked]:bg-(--primary)/5">
                  <input
                    type="checkbox"
                    checked={checkedIds.has(p.id)}
                    onChange={() => togglePage(p.id)}
                    className="rounded border-black/20"
                  />
                  <span>{p.pageName}</span>
                  <span className="text-xs text-black/40">({p.clientName})</span>
                </label>
              ))}
            </div>
            <div className="flex gap-2 text-sm">
              <button type="button" onClick={selectAll} className="text-black/60 underline hover:text-black">Select all</button>
              <button type="button" onClick={clearFilter} className="text-black/60 underline hover:text-black">Clear filter</button>
            </div>
          </div>
        )}
      </div>

      {/* Calendar grid */}
      <div className="overflow-hidden rounded-xl border border-(--hub-border-light) bg-white shadow-sm">
        <div className="grid grid-cols-7 border-b border-(--hub-border-light)">
          {WEEKDAYS.map((day) => (
            <div key={day} className="border-r border-(--hub-border-light) bg-black/2 px-2 py-2 text-center text-xs font-semibold text-(--hub-muted) last:border-r-0">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((cell, idx) => {
            const dayPosts = posts.filter((p) => toIsoDay(p.scheduledFor) === cell.iso);
            const dayExternal = externalPosts.filter((p) => toIsoDay(p.createdTime) === cell.iso && !umsExternalIds.has(p.id));
            const isToday = cell.iso === todayIso;
            const allItems = [
              ...dayPosts.map((p) => ({ type: "ums" as const, data: p })),
              ...dayExternal.map((p) => ({ type: "ext" as const, data: p })),
            ];
            const visible = allItems.slice(0, 3);
            const overflow = allItems.length - 3;

            return (
              <div key={idx} className={`group relative min-h-[7rem] border-b border-r border-(--hub-border-light) p-1.5 last:border-r-0 ${!cell.isCurrentMonth ? "bg-black/2" : ""} ${isToday ? "ring-1 ring-inset ring-(--primary)" : ""}`}>
                <button
                  type="button"
                  onClick={() => cell.isCurrentMonth && (setModalDate(cell.iso), setModalOpen(true))}
                  className={`absolute inset-0 flex flex-col p-1.5 text-left transition-colors ${cell.isCurrentMonth ? "hover:bg-black/5 cursor-pointer" : "cursor-default"}`}
                  aria-label={cell.isCurrentMonth ? `Schedule post for ${cell.iso}` : undefined}
                >
                  <span className={`text-xs font-medium ${cell.isCurrentMonth ? (isToday ? "text-black font-semibold" : "text-black/70") : "text-black/40"}`}>{cell.date}</span>
                  {cell.isCurrentMonth && (
                    <span className="mt-1 inline-flex w-6 items-center justify-center rounded bg-(--primary)/20 text-(--primary) opacity-0 transition-opacity group-hover:opacity-100">+</span>
                  )}
                  <div className="mt-1 flex-1 space-y-1 overflow-hidden">
                    {visible.map(({ type, data }) =>
                      type === "ums" ? (
                        <Link
                          key={data.id}
                          href={`/hub/social/posts/${data.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className={`block rounded px-1.5 py-1 text-xs hover:opacity-80 transition-opacity ${
                            (data as CalendarPost).status === "SCHEDULED" ? "bg-amber-50 text-amber-900"
                              : (data as CalendarPost).status === "PUBLISHED" ? "bg-green-50 text-green-800"
                              : "bg-black/5 text-(--hub-muted)"
                          }`}
                        >
                          <span className="line-clamp-1">{(data as CalendarPost).caption.slice(0, 40)}{(data as CalendarPost).caption.length > 40 ? "…" : ""}</span>
                          <span className="mt-0.5 block text-[10px] text-(--hub-muted)">
                            {new Date((data as CalendarPost).scheduledFor).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })} · {data.pageName}
                          </span>
                        </Link>
                      ) : (
                        <div
                          key={data.id}
                          onClick={(e) => e.stopPropagation()}
                          onMouseEnter={(e) => {
                            const ext = data as ExternalPost;
                            if (!ext.message && !ext.picture) return;
                            const rect = e.currentTarget.getBoundingClientRect();
                            const tw = 280;
                            const x = rect.right + 8 + tw > window.innerWidth ? rect.left - tw - 8 : rect.right + 8;
                            const y = Math.min(rect.top, window.innerHeight - 320);
                            setTooltip({ id: data.id, message: ext.message, picture: ext.picture, x, y });
                          }}
                          onMouseLeave={() => setTooltip(null)}
                        >
                          {(data as ExternalPost).permalink ? (
                            <a href={(data as ExternalPost).permalink} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="block rounded px-1.5 py-1 text-xs bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                              <span className="line-clamp-1">{(data as ExternalPost).message?.slice(0, 40) ?? "(image/video)"}</span>
                              <span className="mt-0.5 block text-[10px] text-slate-400">{new Date((data as ExternalPost).createdTime).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })} · {data.pageName} · fb</span>
                            </a>
                          ) : (
                            <div className="block rounded px-1.5 py-1 text-xs bg-slate-100 text-slate-600">
                              <span className="line-clamp-1">{(data as ExternalPost).message?.slice(0, 40) ?? "(image/video)"}</span>
                              <span className="mt-0.5 block text-[10px] text-slate-400">{new Date((data as ExternalPost).createdTime).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })} · {data.pageName} · fb</span>
                            </div>
                          )}
                        </div>
                      )
                    )}
                    {overflow > 0 && <p className="px-1.5 text-[10px] text-(--hub-muted)">+{overflow} more</p>}
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* External post hover tooltip */}
      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 w-72 rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden text-xs"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.picture && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={tooltip.picture} alt="" className="w-full h-44 object-cover" />
          )}
          <div className="p-3">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Posted on Facebook</p>
            {tooltip.message ? (
              <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">{tooltip.message.slice(0, 400)}{tooltip.message.length > 400 ? "…" : ""}</p>
            ) : (
              <p className="text-slate-400 italic">(no caption)</p>
            )}
          </div>
        </div>
      )}

      <SchedulePostModal
        isOpen={modalOpen}
        onClose={handleClose}
        onSuccess={handleSuccess}
        selectedDate={modalDate}
        defaultTime="09:00"
        clients={clients}
        pages={pageOptions}
        preselectedPageIds={selectedPageIds.length > 0 ? selectedPageIds : pages.map((p) => p.id)}
        createPost={createPost}
      />
    </>
  );
}
