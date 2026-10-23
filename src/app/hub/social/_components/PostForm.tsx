"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { PendingSubmitButton } from "@/app/hub/_components/PendingSubmitButton";
import { MediaUploadInput } from "./MediaUploadInput";

type PageOption = {
  id: string;
  pageName: string;
  clientId: string;
  hasInstagram?: boolean;
};

type EntryState = { id: string };

const INIT_STATE: { error?: string } = {};

type PostFormProps = {
  action: (prev: { error?: string }, formData: FormData) => Promise<{ error?: string }>;
  clients: { id: string; companyName: string }[];
  pages: PageOption[];
  defaultClientId?: string;
  defaultPageId?: string;
  defaultCaption?: string;
  defaultScheduledFor?: string;
  defaultMediaUrls?: string[];
  defaultMediaType?: "IMAGE" | "VIDEO" | "";
  submitLabel: string;
  backHref: string;
  /** When true, allow selecting multiple pages and multiple date+caption entries. For edit mode, use false. */
  multiPage?: boolean;
};

export function PostForm({
  action,
  clients,
  pages,
  defaultClientId = "",
  defaultPageId = "",
  defaultCaption = "",
  defaultScheduledFor = "",
  defaultMediaUrls = [],
  defaultMediaType = "",
  submitLabel,
  backHref,
  multiPage = false,
}: PostFormProps) {
  const [state, formAction] = useActionState(action, INIT_STATE);
  const router = useRouter();
  const [selectedClientId, setSelectedClientId] = useState(defaultClientId);
  const [selectedPageIds, setSelectedPageIds] = useState<Set<string>>(
    defaultPageId ? new Set([defaultPageId]) : new Set()
  );
  const [minDateTime] = useState(() => {
    const d = new Date();
    d.setSeconds(0, 0);
    return new Date(d.getTime() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16);
  });

  // Each entry = one scheduled post (date + caption). Shared images apply to all.
  const [entries, setEntries] = useState<EntryState[]>([{ id: "entry-init" }]);

  useEffect(() => {
    if (state !== INIT_STATE && !state?.error) {
      router.push(backHref);
    }
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  const pagesForClient = selectedClientId
    ? pages.filter((p) => p.clientId === selectedClientId)
    : [];

  const togglePage = (pageId: string) => {
    setSelectedPageIds((prev) => {
      const next = new Set(prev);
      if (next.has(pageId)) next.delete(pageId);
      else next.add(pageId);
      return next;
    });
  };

  const selectAllPages = () => setSelectedPageIds(new Set(pagesForClient.map((p) => p.id)));
  const deselectAllPages = () => setSelectedPageIds(new Set());

  const addEntry = () => setEntries((prev) => [...prev, { id: `entry-${Date.now()}` }]);
  const removeEntry = (id: string) => setEntries((prev) => prev.filter((e) => e.id !== id));

  const totalPosts = selectedPageIds.size * entries.length;

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {state.error}
        </div>
      )}

      {/* Client */}
      <div>
        <label htmlFor="clientId" className="block text-sm font-medium">Client *</label>
        <select
          id="clientId"
          name="clientId"
          required
          value={selectedClientId}
          onChange={(e) => {
            setSelectedClientId(e.target.value);
            setSelectedPageIds(new Set());
          }}
          className="mt-1 w-full rounded-lg border border-(--hub-border-light) px-3 py-2.5 text-sm focus:border-(--primary) focus:outline-none focus:ring-1 focus:ring-(--primary)"
        >
          <option value="">Select client</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.companyName}</option>
          ))}
        </select>
      </div>

      {/* Pages */}
      <div>
        <label className="block text-sm font-medium">Facebook page{multiPage ? "s" : ""} *</label>
        {multiPage ? (
          <div className="mt-2 space-y-2">
            {selectedClientId && pagesForClient.length === 0 && (
              <p className="text-sm text-black/50">No connected pages — connect one first</p>
            )}
            {pagesForClient.length > 0 && (
              <>
                <div className="flex gap-2">
                  <button type="button" onClick={selectAllPages} className="text-xs text-black/60 hover:text-black underline">Select all</button>
                  <button type="button" onClick={deselectAllPages} className="text-xs text-black/60 hover:text-black underline">Deselect all</button>
                </div>
                <div className="max-h-40 space-y-1.5 overflow-y-auto rounded-lg border border-(--hub-border-light) p-2">
                  {pagesForClient.map((p) => (
                    <label key={p.id} className="flex cursor-pointer items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        name="socialPageIds"
                        value={p.id}
                        checked={selectedPageIds.has(p.id)}
                        onChange={() => togglePage(p.id)}
                        className="rounded border-black/20"
                      />
                      <span>
                        {p.pageName}
                        {p.hasInstagram && (
                          <span className="ml-2 inline-flex items-center rounded-full bg-gradient-to-r from-purple-100 to-pink-100 px-1.5 py-0.5 text-[10px] font-medium text-purple-700">
                            + Instagram
                          </span>
                        )}
                      </span>
                    </label>
                  ))}
                </div>
                {selectedPageIds.size > 0 && (
                  <p className="text-xs text-black/50">
                    {selectedPageIds.size} page{selectedPageIds.size !== 1 ? "s" : ""} selected
                    {entries.length > 1 && ` · ${totalPosts} posts will be created total`}
                    {". Pages with "}
                    <span className="text-purple-600 font-medium">+ Instagram</span>
                    {" will also publish to Instagram."}
                  </p>
                )}
              </>
            )}
          </div>
        ) : (
          <select
            id="socialPageId"
            name="socialPageId"
            required
            defaultValue={defaultPageId}
            className="mt-1 w-full rounded-lg border border-(--hub-border-light) px-3 py-2.5 text-sm focus:border-(--primary) focus:outline-none focus:ring-1 focus:ring-(--primary)"
          >
            <option value="">Select page</option>
            {pagesForClient.map((p) => (
              <option key={p.id} value={p.id}>{p.pageName}</option>
            ))}
            {selectedClientId && pagesForClient.length === 0 && (
              <option value="" disabled>No connected pages — connect one first</option>
            )}
          </select>
        )}
      </div>

      {/* Media — in multi-date mode this is shared across all posts */}
      <MediaUploadInput
        defaultMediaUrls={defaultMediaUrls}
        defaultMediaType={defaultMediaType as "IMAGE" | "VIDEO" | ""}
      />
      {multiPage && (
        <p className="!-mt-4 text-xs text-black/40">Images or video above are shared across all scheduled posts.</p>
      )}

      {/* Caption + schedule — multi-entry in create mode, single fields in edit mode */}
      {multiPage ? (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-(--hub-text)">Dates &amp; captions</p>
              <p className="text-xs text-(--hub-muted) mt-0.5">Each entry is a separate post with its own date and caption.</p>
            </div>
            <button
              type="button"
              onClick={addEntry}
              className="inline-flex items-center gap-1.5 rounded-lg border border-(--hub-border-light) bg-white px-3 py-1.5 text-sm font-medium hover:bg-black/5"
            >
              <Plus className="h-4 w-4" />
              Add date
            </button>
          </div>

          <div className="space-y-3">
            {entries.map((entry, idx) => (
              <div key={entry.id} className="rounded-xl border border-(--hub-border-light) bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-(--hub-muted)">
                    Post {idx + 1}
                  </span>
                  {entries.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEntry(entry.id)}
                      className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
                    >
                      <X className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-(--hub-muted) mb-1">
                      Schedule for <span className="font-normal">(leave empty to save as draft)</span>
                    </label>
                    <input
                      type="datetime-local"
                      name="entryScheduledFor"
                      defaultValue={idx === 0 ? defaultScheduledFor : ""}
                      min={minDateTime}
                      className="w-full rounded-lg border border-(--hub-border-light) px-3 py-2 text-sm focus:border-(--primary) focus:outline-none focus:ring-1 focus:ring-(--primary)"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-(--hub-muted) mb-1">
                      Caption *
                    </label>
                    <textarea
                      name="entryCaption"
                      required
                      rows={3}
                      defaultValue={idx === 0 ? defaultCaption : ""}
                      placeholder="Post text…"
                      className="w-full rounded-lg border border-(--hub-border-light) px-3 py-2 text-sm focus:border-(--primary) focus:outline-none focus:ring-1 focus:ring-(--primary)"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div>
            <label htmlFor="caption" className="block text-sm font-medium">Caption *</label>
            <textarea
              id="caption"
              name="caption"
              required
              rows={4}
              defaultValue={defaultCaption}
              placeholder="Post text..."
              className="mt-1 w-full rounded-lg border border-(--hub-border-light) px-3 py-2.5 text-sm focus:border-(--primary) focus:outline-none focus:ring-1 focus:ring-(--primary)"
            />
          </div>
          <div>
            <label htmlFor="scheduledFor" className="block text-sm font-medium">Schedule for (optional)</label>
            <input
              id="scheduledFor"
              name="scheduledFor"
              type="datetime-local"
              defaultValue={defaultScheduledFor}
              min={minDateTime}
              className="mt-1 w-full rounded-lg border border-(--hub-border-light) px-3 py-2.5 text-sm focus:border-(--primary) focus:outline-none focus:ring-1 focus:ring-(--primary)"
            />
            <p className="mt-1 text-xs text-black/50">Leave empty for draft. Set a future time to schedule.</p>
          </div>
        </>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <PendingSubmitButton className="rounded-lg border border-transparent bg-(--primary) px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-95">
          {submitLabel}
          {multiPage && totalPosts > 1 && (
            <span className="ml-1.5 rounded-full bg-white/20 px-1.5 py-0.5 text-xs">
              {totalPosts}
            </span>
          )}
        </PendingSubmitButton>
        <a
          href={backHref}
          className="rounded-lg border border-(--hub-border-light) px-4 py-2.5 text-sm font-medium hover:bg-black/5"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
