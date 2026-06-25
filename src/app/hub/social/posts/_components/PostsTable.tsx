"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deletePost } from "../../actions";

type Post = {
  id: string;
  caption: string;
  status: string;
  scheduledFor: string | null;
  publishedAt: string | null;
  pageName: string;
  pageId: string;
  clientName: string;
  externalPostId: string | null;
  publishedUrl: string | null;
};

type Page = { id: string; pageName: string };

const STATUS_OPTIONS = ["", "SCHEDULED", "PUBLISHED", "DRAFT", "FAILED"] as const;

const STATUS_STYLES: Record<string, string> = {
  SCHEDULED: "bg-amber-100 text-amber-700",
  PUBLISHED: "bg-green-100 text-green-700",
  DRAFT: "bg-black/8 text-black/50",
  FAILED: "bg-red-100 text-red-700",
  PROCESSING: "bg-blue-100 text-blue-700",
};

function DeleteButton({ postId, status }: { postId: string; status: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleConfirm() {
    startTransition(async () => {
      const result = await deletePost(postId);
      if (result.error) {
        setError(result.error);
        setConfirming(false);
      } else {
        router.refresh();
      }
    });
  }

  if (!confirming) {
    return (
      <div className="flex flex-col items-end gap-1">
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
        >
          Delete
        </button>
        {error && <p className="text-[10px] text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-red-200 bg-red-50 p-2 text-right">
      <p className="text-xs text-red-800 font-medium">
        {status === "PUBLISHED" ? "Delete from Facebook too?" : "Delete this post?"}
      </p>
      <div className="flex justify-end gap-1.5">
        <button
          type="button"
          onClick={handleConfirm}
          disabled={isPending}
          className="rounded bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          {isPending ? "Deleting…" : "Delete"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={isPending}
          className="rounded border border-black/15 px-2 py-1 text-xs hover:bg-black/5 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export function PostsTable({
  posts,
  pages,
  selectedPageId,
  selectedStatus,
}: {
  posts: Post[];
  pages: Page[];
  selectedPageId: string;
  selectedStatus: string;
}) {
  const router = useRouter();

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(window.location.search);
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/hub/social/posts?${params.toString()}`);
  }

  const filtered = posts.filter((p) => {
    if (selectedPageId && p.pageId !== selectedPageId) return false;
    if (selectedStatus && p.status !== selectedStatus) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={selectedPageId}
          onChange={(e) => updateFilter("page", e.target.value)}
          className="rounded-lg border border-(--hub-border-light) px-3 py-2 text-sm focus:border-(--primary) focus:outline-none focus:ring-1 focus:ring-(--primary)"
        >
          <option value="">All pages</option>
          {pages.map((p) => (
            <option key={p.id} value={p.id}>{p.pageName}</option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => updateFilter("status", e.target.value)}
          className="rounded-lg border border-(--hub-border-light) px-3 py-2 text-sm focus:border-(--primary) focus:outline-none focus:ring-1 focus:ring-(--primary)"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s || "All statuses"}</option>
          ))}
        </select>

        <span className="text-sm text-(--hub-muted)">{filtered.length} post{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-(--hub-border-light) bg-white shadow-sm">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-(--hub-muted)">No posts match the current filters.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-(--hub-border-light) bg-black/2 text-left text-xs font-medium text-(--hub-muted)">
                <th className="px-4 py-3 w-1/2">Caption</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Page</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--hub-border-light)">
              {filtered.map((post) => {
                const date = post.scheduledFor ?? post.publishedAt;
                return (
                  <tr key={post.id} className="hover:bg-black/1.5 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        href={`/hub/social/posts/${post.id}`}
                        className="block font-medium text-(--hub-text) hover:text-(--primary) line-clamp-2"
                      >
                        {post.caption}
                      </Link>
                      <p className="mt-0.5 text-xs text-(--hub-muted)">{post.clientName}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLES[post.status] ?? "bg-black/5 text-black/50"}`}>
                        {post.status.toLowerCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-(--hub-muted) whitespace-nowrap">{post.pageName}</td>
                    <td className="px-4 py-3 text-xs text-(--hub-muted) whitespace-nowrap">
                      {date
                        ? new Date(date).toLocaleString("en-ZA", {
                            dateStyle: "short",
                            timeStyle: "short",
                            timeZone: "Africa/Johannesburg",
                          })
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {post.publishedUrl && (
                          <a
                            href={post.publishedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-(--meta-blue) hover:underline whitespace-nowrap"
                          >
                            View →
                          </a>
                        )}
                        <DeleteButton postId={post.id} status={post.status} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
