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

function formatDetailDate(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("en-ZA", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

// Day detail modal — shows all posts for a day regardless of the calendar cell cap
function DayDetailModal({
  iso, posts, externalPosts, umsExternalIds, onClose, onSchedule,
}: {
  iso: string;
  posts: CalendarPost[];
  externalPosts: ExternalPost[];
  umsExternalIds: Set<string>;
  onClose: () => void;
  onSchedule: () => void;
}) {
  const dayPosts = posts.filter((p) => toIsoDay(p.scheduledFor) === iso);
  const dayExternal = externalPosts.filter((p) => toIsoDay(p.createdTime) === iso && !umsExternalIds.has(p.id));
  const total = dayPosts.length + dayExternal.length;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl bg-white shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-(--hub-border-light) bg-white px-5 py-4">
          <div>
            <h2 className="font-semibold text-(--hub-text)">{formatDetailDate(iso)}</h2>
            <p className="text-xs text-(--hub-muted) mt-0.5">{total} post{total !== 1 ? "s" : ""}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-black/50 hover:bg-black/5 hover:text-black">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 p-4 space-y-3">
          {/* UMS posts */}
          {dayPosts.map((post) => (
            <Link
              key={post.id}
              href={`/hub/social/posts/${post.id}`}
              onClick={onClose}
              className="flex items-start gap-3 rounded-xl border border-(--hub-border-light) p-3 hover:bg-black/2 transition-colors"
            >
              <div className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${post.status === "SCHEDULED" ? "bg-amber-400" : post.status === "PUBLISHED" ? "bg-green-500" : "bg-black/20"}`} />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-(--hub-text) line-clamp-2">{post.caption}</p>
                <p className="mt-1 text-xs text-(--hub-muted)">
                  {new Date(post.scheduledFor).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Johannesburg" })} · {post.pageName}
                  <span className={`ml-2 inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-medium ${post.status === "SCHEDULED" ? "bg-amber-100 text-amber-700" : post.status === "PUBLISHED" ? "bg-green-100 text-green-700" : "bg-black/5 text-black/50"}`}>
                    {post.status.toLowerCase()}
                  </span>
                </p>
              </div>
            </Link>
          ))}

          {/* External FB posts */}
          {dayExternal.map((post) => (
            <div key={post.id} className="rounded-xl border border-(--hub-border-light) overflow-hidden">
              {post.picture && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={post.picture} alt="" className="w-full h-40 object-cover" />
              )}
              <div className="p-3">
                {post.message && <p className="text-sm text-(--hub-text) line-clamp-3">{post.message}</p>}
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-xs text-(--hub-muted)">
                    {new Date(post.createdTime).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Johannesburg" })} · {post.pageName}
                    <span className="ml-2 inline-flex rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">fb</span>
                  </p>
                  {post.permalink && (
                    <a href={post.permalink} target="_blank" rel="noopener noreferrer" className="text-xs text-(--meta-blue) hover:underline shrink-0 ml-2">View →</a>
                  )}
                </div>
              </div>
            </div>
          ))}

          {total === 0 && (
            <p className="py-6 text-center text-sm text-(--hub-muted)">No posts for this day.</p>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-t border-(--hub-border-light) bg-white px-4 py-3">
          <button
            type="button"
            onClick={onSchedule}
            className="w-full rounded-lg bg-(--primary) py-2.5 text-sm font-semibold text-white hover:opacity-90"
          >
            + Schedule post for this day
          </button>
        </div>
      </div>
    </div>
  );
}

export function SocialCalendarClient({ month, year, posts, externalPosts, pages, clients, selectedPageIds, baseUrl }: SocialCalendarClientProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState("");
  const [dayDetail, setDayDetail] = useState<string | null>(null);

  // Local filter state for instant checkbox feedback
  const allPageIds = pages.map((p) => p.id);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(
    () => new Set(selectedPageIds.length > 0 ? selectedPageIds : allPageIds)
  );
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

  const selectAll = () => { setCheckedIds(new Set(allPageIds)); pushFilter([]); };
  const clearFilter = () => { setCheckedIds(new Set()); };

  const handleClose = useCallback(() => setModalOpen(false), []);
  const handleSuccess = useCallback(() => router.refresh(), [router]);

  const cells = getCalendarGrid(month, year);
  const today = new Date();
  const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const umsExternalIds = new Set(posts.map((p) => p.externalPostId).filter(Boolean) as string[]);
  const pageOptions = pages.map((p) => ({ id: p.id, pageName: p.pageName, clientId: p.clientId }));

  const openDayDetail = (iso: string) => setDayDetail(iso);
  const openScheduleForDay = (iso: string) => { setDayDetail(null); setModalDate(iso); setModalOpen(true); };

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
                  <input type="checkbox" checked={checkedIds.has(p.id)} onChange={() => togglePage(p.id)} className="rounded border-black/20" />
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
            const hasAny = allItems.length > 0;

            return (
              <div key={idx} className={`group relative min-h-[7rem] border-b border-r border-(--hub-border-light) last:border-r-0 ${!cell.isCurrentMonth ? "bg-black/2" : ""} ${isToday ? "ring-1 ring-inset ring-(--primary)" : ""}`}>
                {/* Header row: day number + schedule button */}
                <div className="flex items-center justify-between p-1.5 pb-0">
                  <button
                    type="button"
                    disabled={!cell.isCurrentMonth}
                    onClick={() => cell.isCurrentMonth && hasAny && openDayDetail(cell.iso)}
                    className={`text-xs font-medium rounded px-1 transition-colors ${
                      !cell.isCurrentMonth ? "text-black/30 cursor-default"
                        : isToday ? "text-black font-semibold"
                        : hasAny ? "text-black/70 hover:bg-black/5 cursor-pointer"
                        : "text-black/70 cursor-default"
                    }`}
                  >
                    {cell.date}
                  </button>
                  {cell.isCurrentMonth && (
                    <button
                      type="button"
                      onClick={() => openScheduleForDay(cell.iso)}
                      title="Schedule post"
                      className="opacity-0 group-hover:opacity-100 flex h-5 w-5 items-center justify-center rounded bg-(--primary)/20 text-(--primary) text-xs hover:bg-(--primary)/30 transition-opacity"
                    >
                      +
                    </button>
                  )}
                </div>

                {/* Post chips */}
                <div className="px-1.5 pb-1.5 space-y-1 mt-1">
                  {visible.map(({ type, data }) =>
                    type === "ums" ? (
                      <Link
                        key={data.id}
                        href={`/hub/social/posts/${data.id}`}
                        className={`block rounded px-1.5 py-1 text-xs hover:opacity-80 transition-opacity ${
                          (data as CalendarPost).status === "SCHEDULED" ? "bg-amber-50 text-amber-900"
                            : (data as CalendarPost).status === "PUBLISHED" ? "bg-green-50 text-green-800"
                            : "bg-black/5 text-(--hub-muted)"
                        }`}
                      >
                        <span className="line-clamp-1">{(data as CalendarPost).caption.slice(0, 40)}{(data as CalendarPost).caption.length > 40 ? "…" : ""}</span>
                        <span className="mt-0.5 block text-[10px] text-(--hub-muted)">
                          {new Date((data as CalendarPost).scheduledFor).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Johannesburg" })} · {data.pageName}
                        </span>
                      </Link>
                    ) : (
                      <button
                        key={data.id}
                        type="button"
                        onClick={() => openDayDetail(cell.iso)}
                        className="w-full text-left block rounded px-1.5 py-1 text-xs bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                      >
                        <span className="line-clamp-1">{(data as ExternalPost).message?.slice(0, 40) ?? "(image/video)"}</span>
                        <span className="mt-0.5 block text-[10px] text-slate-400">
                          {new Date((data as ExternalPost).createdTime).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Johannesburg" })} · {data.pageName} · fb
                        </span>
                      </button>
                    )
                  )}
                  {overflow > 0 && (
                    <button
                      type="button"
                      onClick={() => openDayDetail(cell.iso)}
                      className="w-full text-left px-1.5 text-[10px] text-(--hub-muted) hover:text-(--hub-text) hover:underline"
                    >
                      +{overflow} more from {overflow === 1 ? "1 store" : `${overflow} stores`}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day detail modal */}
      {dayDetail && (
        <DayDetailModal
          iso={dayDetail}
          posts={posts}
          externalPosts={externalPosts}
          umsExternalIds={umsExternalIds}
          onClose={() => setDayDetail(null)}
          onSchedule={() => openScheduleForDay(dayDetail)}
        />
      )}

      <SchedulePostModal
        isOpen={modalOpen}
        onClose={handleClose}
        onSuccess={handleSuccess}
        selectedDate={modalDate}
        defaultTime="09:00"
        clients={clients}
        pages={pageOptions}
        preselectedPageIds={checkedIds.size > 0 ? [...checkedIds] : pages.map((p) => p.id)}
        createPost={createPost}
      />
    </>
  );
}
