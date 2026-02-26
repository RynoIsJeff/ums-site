"use client";

import { useActionState } from "react";
import { connectFacebookPage } from "../actions";

type Props = { clients: { id: string; companyName: string }[] };

export function ConnectFacebookForm({ clients }: Props) {
  const [state, formAction] = useActionState(connectFacebookPage, {});

  return (
    <form action={formAction} className="space-y-4 rounded-xl border border-[var(--hub-border-light)] bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--meta-blue)]/10">
          <svg className="h-5 w-5 text-[var(--meta-blue)]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-[var(--hub-text)]">Connect Facebook Page</h2>
          <p className="text-sm text-[var(--hub-muted)]">
            Add a Page access token from Meta Business Suite or Graph API Explorer.
          </p>
        </div>
      </div>
      {state?.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {state.error}
        </div>
      )}
      <div>
        <label htmlFor="clientId" className="block text-sm font-medium text-[var(--hub-text)]">Client *</label>
        <select
          id="clientId"
          name="clientId"
          required
          className="mt-1 w-full rounded-lg border border-[var(--hub-border-light)] px-3 py-2.5 text-sm focus:border-[var(--meta-blue)] focus:outline-none focus:ring-1 focus:ring-[var(--meta-blue)]"
        >
          <option value="">Select client</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.companyName}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="pageId" className="block text-sm font-medium text-[var(--hub-text)]">Facebook Page ID *</label>
        <input
          id="pageId"
          name="pageId"
          type="text"
          required
          placeholder="e.g. 123456789012345"
          className="mt-1 w-full rounded-lg border border-[var(--hub-border-light)] px-3 py-2.5 text-sm focus:border-[var(--meta-blue)] focus:outline-none focus:ring-1 focus:ring-[var(--meta-blue)]"
        />
      </div>
      <div>
        <label htmlFor="pageName" className="block text-sm font-medium text-[var(--hub-text)]">Page name *</label>
        <input
          id="pageName"
          name="pageName"
          type="text"
          required
          placeholder="e.g. My Business Page"
          className="mt-1 w-full rounded-lg border border-[var(--hub-border-light)] px-3 py-2.5 text-sm focus:border-[var(--meta-blue)] focus:outline-none focus:ring-1 focus:ring-[var(--meta-blue)]"
        />
      </div>
      <div>
        <label htmlFor="pageAccessToken" className="block text-sm font-medium text-[var(--hub-text)]">Page access token *</label>
        <input
          id="pageAccessToken"
          name="pageAccessToken"
          type="password"
          required
          placeholder="EAAxxxx..."
          className="mt-1 w-full rounded-lg border border-[var(--hub-border-light)] px-3 py-2.5 text-sm font-mono focus:border-[var(--meta-blue)] focus:outline-none focus:ring-1 focus:ring-[var(--meta-blue)]"
        />
      </div>
      <button
        type="submit"
        className="rounded-lg bg-[var(--meta-blue)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--meta-blue-hover)]"
      >
        Connect page
      </button>
    </form>
  );
}
