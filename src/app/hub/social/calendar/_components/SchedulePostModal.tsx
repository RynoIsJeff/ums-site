"use client";

import { useActionState, useCallback, useEffect, useState } from "react";

type PageOption = { id: string; pageName: string; clientId: string };

type SchedulePostModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  selectedDate: string; // YYYY-MM-DD
  defaultTime?: string; // HH:mm
  clients: { id: string; companyName: string }[];
  pages: PageOption[];
  preselectedPageIds?: string[];
  createPost: (prev: { error?: string }, formData: FormData) => Promise<{ error?: string }>;
};

export function SchedulePostModal({
  isOpen,
  onClose,
  selectedDate,
  defaultTime = "09:00",
  clients,
  pages,
  preselectedPageIds = [],
  onSuccess,
  createPost,
}: SchedulePostModalProps) {
  const [state, formAction] = useActionState(createPost, {});
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id ?? "");
  const [selectedPageIds, setSelectedPageIds] = useState<Set<string>>(new Set(preselectedPageIds));

  const pagesForClient = selectedClientId ? pages.filter((p) => p.clientId === selectedClientId) : [];

  useEffect(() => {
    if (isOpen) {
      setSelectedClientId(clients[0]?.id ?? "");
      setSelectedPageIds(new Set(preselectedPageIds));
    }
  }, [isOpen, clients, preselectedPageIds]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );
  useEffect(() => {
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  useEffect(() => {
    if (state && !state.error) {
      onSuccess?.();
      onClose();
    }
  }, [state, onClose, onSuccess]);

  const togglePage = (pageId: string) => {
    setSelectedPageIds((prev) => {
      const next = new Set(prev);
      if (next.has(pageId)) next.delete(pageId);
      else next.add(pageId);
      return next;
    });
  };

  const scheduledFor = `${selectedDate}T${defaultTime}`;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-[#e4e6eb] bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#050505]">Schedule post</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-black/60 hover:bg-black/5 hover:text-black"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="mb-4 text-sm text-[#65676b]">
          Schedule for <strong>{new Date(scheduledFor).toLocaleString("en-ZA", { dateStyle: "long", timeStyle: "short" })}</strong>
        </p>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="noRedirect" value="true" />

          {state?.error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {state.error}
            </div>
          )}

          <div>
            <label htmlFor="modal-clientId" className="block text-sm font-medium">
              Client *
            </label>
            <select
              id="modal-clientId"
              name="clientId"
              required
              value={selectedClientId}
              onChange={(e) => {
                setSelectedClientId(e.target.value);
                setSelectedPageIds(new Set());
              }}
              className="mt-1 w-full rounded-lg border border-[#e4e6eb] px-3 py-2.5 text-sm focus:border-[#1877F2] focus:outline-none focus:ring-1 focus:ring-[#1877F2]"
            >
              <option value="">Select client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.companyName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Facebook page(s) *</label>
            {pagesForClient.length === 0 ? (
              <p className="mt-1 text-sm text-[#65676b]">No connected pages — connect one in Pages</p>
            ) : (
              <div className="mt-2 max-h-32 space-y-1.5 overflow-y-auto rounded-lg border border-[#e4e6eb] p-2">
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
                    <span>{p.pageName}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="modal-caption" className="block text-sm font-medium">
              Caption *
            </label>
            <textarea
              id="modal-caption"
              name="caption"
              required
              rows={3}
              placeholder="Post text..."
              className="mt-1 w-full rounded-lg border border-[#e4e6eb] px-3 py-2.5 text-sm focus:border-[#1877F2] focus:outline-none focus:ring-1 focus:ring-[#1877F2]"
            />
          </div>

          <div>
            <label htmlFor="modal-scheduledFor" className="block text-sm font-medium">
              Date & time
            </label>
            <input
              id="modal-scheduledFor"
              name="scheduledFor"
              type="datetime-local"
              required
              defaultValue={scheduledFor}
              className="mt-1 w-full rounded-lg border border-[#e4e6eb] px-3 py-2.5 text-sm focus:border-[#1877F2] focus:outline-none focus:ring-1 focus:ring-[#1877F2]"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="rounded-lg bg-[#1877F2] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#166fe5]"
            >
              Schedule
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[#e4e6eb] px-4 py-2.5 text-sm font-medium hover:bg-[#f0f2f5]"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
