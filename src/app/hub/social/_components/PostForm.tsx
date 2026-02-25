"use client";

import { useActionState } from "react";
import { useState } from "react";

type PageOption = { id: string; pageName: string; clientId: string };

type PostFormProps = {
  action: (prev: { error?: string }, formData: FormData) => Promise<{ error?: string }>;
  clients: { id: string; companyName: string }[];
  pages: PageOption[];
  defaultClientId?: string;
  defaultPageId?: string;
  defaultCaption?: string;
  defaultScheduledFor?: string;
  submitLabel: string;
  backHref: string;
};

export function PostForm({
  action,
  clients,
  pages,
  defaultClientId = "",
  defaultPageId = "",
  defaultCaption = "",
  defaultScheduledFor = "",
  submitLabel,
  backHref,
}: PostFormProps) {
  const [state, formAction] = useActionState(action, {});
  const [selectedClientId, setSelectedClientId] = useState(defaultClientId);

  const pagesForClient = selectedClientId
    ? pages.filter((p) => p.clientId === selectedClientId)
    : [];

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="clientId" className="block text-sm font-medium">Client *</label>
        <select
          id="clientId"
          name="clientId"
          required
          value={selectedClientId}
          onChange={(e) => setSelectedClientId(e.target.value)}
          className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm"
        >
          <option value="">Select client</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.companyName}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="socialPageId" className="block text-sm font-medium">Facebook page *</label>
        <select
          id="socialPageId"
          name="socialPageId"
          required
          defaultValue={defaultPageId}
          className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm"
        >
          <option value="">Select page</option>
          {pagesForClient.map((p) => (
            <option key={p.id} value={p.id}>{p.pageName}</option>
          ))}
          {selectedClientId && pagesForClient.length === 0 && (
            <option value="" disabled>No connected pages — connect one first</option>
          )}
        </select>
      </div>

      <div>
        <label htmlFor="caption" className="block text-sm font-medium">Caption *</label>
        <textarea
          id="caption"
          name="caption"
          required
          rows={4}
          defaultValue={defaultCaption}
          placeholder="Post text..."
          className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="scheduledFor" className="block text-sm font-medium">Schedule for (optional)</label>
        <input
          id="scheduledFor"
          name="scheduledFor"
          type="datetime-local"
          defaultValue={defaultScheduledFor}
          className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm"
        />
        <p className="mt-1 text-xs text-black/50">Leave empty for draft. Set a future time to schedule.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black/90"
        >
          {submitLabel}
        </button>
        <a
          href={backHref}
          className="rounded-md border border-black/15 px-4 py-2 text-sm font-medium hover:bg-black/5"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
