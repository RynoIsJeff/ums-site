"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
};

type PageOption = { id: string; pageName: string; clientId: string; clientName: string };

type SocialCalendarClientProps = {
  month: number;
  year: number;
  posts: CalendarPost[];
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

function postsForDay(posts: CalendarPost[], isoDate: string) {
  return posts.filter((p) => {
    const d = new Date(p.scheduledFor);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return iso === isoDate;
  });
}

export function SocialCalendarClient({
  month,
  year,
  posts,
  pages,
  clients,
  selectedPageIds,
  baseUrl,
}: SocialCalendarClientProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState("");

  const cells = getCalendarGrid(month, year);
  const today = new Date();
  const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

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
      <div className="mb-6 rounded-xl border border-black/10 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold">Filter by Facebook page</h3>
        {pages.length === 0 ? (
          <p className="text-sm text-black/50">No Facebook pages connected. Connect one in Social.</p>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-wrap gap-2">
              {pages.map((p) => (
                <label
                  key={p.id}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-black/10 px-3 py-2 text-sm hover:bg-black/2 has-[:checked]:border-black/20 has-[:checked]:bg-black/5"
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
              <button
                type="button"
                onClick={selectAllPages}
                className="text-black/60 underline hover:text-black"
              >
                Select all
              </button>
              <button
                type="button"
                onClick={clearPageFilter}
                className="text-black/60 underline hover:text-black"
              >
                Clear filter
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-black/10 bg-white">
        <div className="grid grid-cols-7 border-b border-black/10">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="border-r border-black/5 bg-black/2 px-2 py-2 text-center text-xs font-semibold text-black/70 last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((cell, idx) => {
            const dayPosts = postsForDay(posts, cell.iso);
            const isToday = cell.iso === todayIso;

            return (
              <div
                key={idx}
                className={`group relative min-h-[7rem] border-b border-r border-black/5 p-1.5 last:border-r-0 ${
                  !cell.isCurrentMonth ? "bg-black/2" : ""
                } ${isToday ? "ring-1 ring-inset ring-black/10" : ""}`}
              >
                <button
                  type="button"
                  onClick={() => cell.isCurrentMonth && openScheduleModal(cell.iso)}
                  className={`absolute inset-0 flex flex-col p-1.5 text-left transition-colors ${
                    cell.isCurrentMonth
                      ? "hover:bg-black/5 cursor-pointer"
                      : "cursor-default"
                  }`}
                  aria-label={cell.isCurrentMonth ? `Schedule post for ${cell.iso}` : undefined}
                >
                  <span
                    className={`text-xs font-medium ${
                      cell.isCurrentMonth ? (isToday ? "text-black font-semibold" : "text-black/70") : "text-black/40"
                    }`}
                  >
                    {cell.date}
                  </span>
                  {cell.isCurrentMonth && (
                    <span className="mt-1 inline-flex w-6 items-center justify-center rounded bg-black/5 text-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                      +
                    </span>
                  )}
                  <div className="mt-1 flex-1 space-y-1 overflow-hidden">
                    {dayPosts.map((post) => (
                      <Link
                        key={post.id}
                        href={`/hub/social/posts/${post.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className={`block rounded px-1.5 py-1 text-xs transition-colors hover:bg-black/5 ${
                          post.status === "SCHEDULED" ? "bg-amber-50 text-amber-900" : "bg-black/5 text-black/70"
                        }`}
                      >
                        <span className="line-clamp-2" title={post.caption}>
                          {post.caption.slice(0, 40)}
                          {post.caption.length > 40 ? "…" : ""}
                        </span>
                        <span className="mt-0.5 block text-[10px] text-black/50">
                          {new Date(post.scheduledFor).toLocaleTimeString("en-ZA", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          · {post.pageName}
                        </span>
                      </Link>
                    ))}
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <SchedulePostModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => router.refresh()}
        selectedDate={modalDate}
        defaultTime="09:00"
        clients={clients}
        pages={pageOptions}
        preselectedPageIds={selectedPageIds.length > 0 ? selectedPageIds : undefined}
        createPost={createPost}
      />
    </>
  );
}
