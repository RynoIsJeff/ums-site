"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
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
    cells.push({
      date: d,
      isCurrentMonth: false,
      iso: `${prevYear}-${String(prevMonth).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
    });
  }

  for (let d = 1; d <= totalDays; d++) {
    cells.push({
      date: d,
      isCurrentMonth: true,
      iso: `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
    });
  }

  const remaining = 42 - cells.length;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  for (let d = 1; d <= remaining; d++) {
    cells.push({
      date: d,
      isCurrentMonth: false,
      iso: `${nextYear}-${String(nextMonth).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
    });
  }

  return cells;
}

function isoDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function postsForDay(posts: CalendarPost[], iso: string) {
  return posts.filter((p) => isoDate(p.scheduledFor) === iso);
}

function externalPostsForDay(posts: ExternalPost[], iso: string, umsPostExternalIds: Set<string>) {
  return posts.filter(
    (p) => isoDate(p.createdTime) === iso && !umsPostExternalIds.has(p.id)
  );
}

export function SocialCalendarClient({
  month,
  year,
  posts,
  externalPosts,
  pages,
  clients,
  selectedPageIds,
  baseUrl,
}: SocialCalendarClientProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState("");
  const [tooltip, setTooltip] = useState<{ id: string; message: string; x: number; y: number } | null>(null);

  const handleClose = useCallback(() => setModalOpen(false), []);
  const handleSuccess = useCallback(() => router.refresh(), [router]);

  const cells = getCalendarGrid(month, year);
  const today = new Date();
  const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  // IDs of UMS-published posts so we don't double-display them as "external"
  const umsExternalIds = new Set(posts.map((p) => p.externalPostId).filter(Boolean) as string[]);

  const togglePageInUrl = (pageId: string) => {
    const allIds = pages.map((p) => p.id);
    let next: string[];
    if (selectedPageIds.length === 0) {
      next = allIds.filter((id) => id !== pageId);
    } else if (selectedPageIds.includes(pageId)) {
      next = selectedPageIds.filter((id) => id !== pageId);
    } else {
      next = [...selectedPageIds, pageId];
    }
    const params = new URLSearchParams({ month: String(month), year: String(year) });
    if (next.length > 0 && next.length < allIds.length) params.set("pages", next.join(","));
    router.push(`${baseUrl}?${params.toString()}`);
  };

  const selectAllPages = () => {
    const params = new URLSearchParams({ month: String(month), year: String(year) });
    params.set("pages", pages.map((p) => p.id).join(","));
    router.push(`${baseUrl}?${params.toString()}`);
  };

  const clearPageFilter = () => {
    const params = new URLSearchParams({ month: String(month), year: String(year) });
    router.push(`${baseUrl}?${params.toString()}`);
  };

  const openScheduleModal = (isoDate: string) => {
    setModalDate(isoDate);
    setModalOpen(true);
  };

  const pageOptions = pages.map((p) => ({ id: p.id, pageName: p.pageName, clientId: p.clientId }));

  return (
    <>
      <div className="mb-6 rounded-xl border border-(--hub-border-light) bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-(--hub-text)">Filter by Facebook page</h3>
        {pages.length === 0 ? (
          <p className="text-sm text-(--hub-muted)">No Facebook pages connected. Connect one in Pages.</p>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-wrap gap-2">
              {pages.map((p) => (
                <label
                  key={p.id}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-(--hub-border-light) px-3 py-2 text-sm hover:bg-black/5 has-[:checked]:border-(--primary) has-[:checked]:bg-(--primary)/5"
                >
                  <input
                    type="checkbox"
                    checked={selectedPageIds.length === 0 ? true : selectedPageIds.includes(p.id)}
                    onChange={() => togglePageInUrl(p.id)}
                    className="rounded border-black/20"
                  />
                  <span>{p.pageName}</span>
                  <span className="text-xs text-black/40">({p.clientName})</span>
                </label>
              ))}
            </div>
            <div className="flex gap-2 text-sm">
              <button type="button" onClick={selectAllPages} className="text-black/60 underline hover:text-black">Select all</button>
              <button type="button" onClick={clearPageFilter} className="text-black/60 underline hover:text-black">Clear filter</button>
            </div>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-(--hub-border-light) bg-white shadow-sm">
        <div className="grid grid-cols-7 border-b border-(--hub-border-light)">
          {WEEKDAYS.map((day) => (
            <div key={day} className="border-r border-(--hub-border-light) bg-black/2 px-2 py-2 text-center text-xs font-semibold text-(--hub-muted) last:border-r-0">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((cell, idx) => {
            const dayPosts = postsForDay(posts, cell.iso);
            const dayExternal = externalPostsForDay(externalPosts, cell.iso, umsExternalIds);
            const isToday = cell.iso === todayIso;
            const MAX_VISIBLE = 3;
            const allItems = [...dayPosts.map((p) => ({ type: "ums" as const, post: p })), ...dayExternal.map((p) => ({ type: "ext" as const, post: p }))];
            const visibleItems = allItems.slice(0, MAX_VISIBLE);
            const overflow = allItems.length - MAX_VISIBLE;

            return (
              <div
                key={idx}
                className={`group relative min-h-[7rem] border-b border-r border-(--hub-border-light) p-1.5 last:border-r-0 ${!cell.isCurrentMonth ? "bg-black/2" : ""} ${isToday ? "ring-1 ring-inset ring-(--primary)" : ""}`}
              >
                <button
                  type="button"
                  onClick={() => cell.isCurrentMonth && openScheduleModal(cell.iso)}
                  className={`absolute inset-0 flex flex-col p-1.5 text-left transition-colors ${cell.isCurrentMonth ? "hover:bg-black/5 cursor-pointer" : "cursor-default"}`}
                  aria-label={cell.isCurrentMonth ? `Schedule post for ${cell.iso}` : undefined}
                >
                  <span className={`text-xs font-medium ${cell.isCurrentMonth ? (isToday ? "text-black font-semibold" : "text-black/70") : "text-black/40"}`}>
                    {cell.date}
                  </span>
                  {cell.isCurrentMonth && (
                    <span className="mt-1 inline-flex w-6 items-center justify-center rounded bg-(--primary)/20 text-(--primary) opacity-0 transition-opacity group-hover:opacity-100">+</span>
                  )}
                  <div className="mt-1 flex-1 space-y-1 overflow-hidden">
                    {visibleItems.map(({ type, post }) =>
                      type === "ums" ? (
                        <Link
                          key={post.id}
                          href={`/hub/social/posts/${post.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className={`block rounded px-1.5 py-1 text-xs transition-colors hover:opacity-80 ${
                            (post as CalendarPost).status === "SCHEDULED"
                              ? "bg-amber-50 text-amber-900"
                              : (post as CalendarPost).status === "PUBLISHED"
                                ? "bg-green-50 text-green-800"
                                : "bg-black/5 text-(--hub-muted)"
                          }`}
                        >
                          <span className="line-clamp-1" title={(post as CalendarPost).caption}>
                            {(post as CalendarPost).caption.slice(0, 40)}{(post as CalendarPost).caption.length > 40 ? "…" : ""}
                          </span>
                          <span className="mt-0.5 block text-[10px] text-(--hub-muted)">
                            {new Date((post as CalendarPost).scheduledFor).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })} · {post.pageName}
                          </span>
                        </Link>
                      ) : (
                        <div
                          key={post.id}
                          onClick={(e) => e.stopPropagation()}
                          onMouseEnter={(e) => {
                            const msg = (post as ExternalPost).message;
                            if (!msg) return;
                            const rect = e.currentTarget.getBoundingClientRect();
                            const tw = 256;
                            const x = rect.right + 8 + tw > window.innerWidth ? rect.left - tw - 8 : rect.right + 8;
                            setTooltip({ id: post.id, message: msg, x, y: rect.top });
                          }}
                          onMouseLeave={() => setTooltip(null)}
                        >
                          {(post as ExternalPost).permalink ? (
                            <a
                              href={(post as ExternalPost).permalink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block rounded px-1.5 py-1 text-xs bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                            >
                              <span className="line-clamp-1">{(post as ExternalPost).message?.slice(0, 40) ?? "(image/video)"}</span>
                              <span className="mt-0.5 block text-[10px] text-slate-400">
                                {new Date((post as ExternalPost).createdTime).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })} · {post.pageName} · fb
                              </span>
                            </a>
                          ) : (
                            <div className="block rounded px-1.5 py-1 text-xs bg-slate-100 text-slate-600">
                              <span className="line-clamp-1">{(post as ExternalPost).message?.slice(0, 40) ?? "(image/video)"}</span>
                              <span className="mt-0.5 block text-[10px] text-slate-400">
                                {new Date((post as ExternalPost).createdTime).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })} · {post.pageName} · fb
                              </span>
                            </div>
                          )}
                        </div>
                      )
                    )}
                    {overflow > 0 && (
                      <p className="px-1.5 text-[10px] text-(--hub-muted)">+{overflow} more</p>
                    )}
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hover tooltip for external posts */}
      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 max-w-64 rounded-xl border border-slate-200 bg-white p-3 shadow-xl text-xs"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <p className="mb-1 font-semibold text-slate-500 uppercase tracking-wide text-[10px]">Posted on Facebook</p>
          <p className="text-slate-800 whitespace-pre-wrap leading-relaxed">{tooltip.message.slice(0, 400)}{tooltip.message.length > 400 ? "…" : ""}</p>
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
