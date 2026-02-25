"use client";

import { useActionState } from "react";
import { connectFacebookPage } from "../actions";

type Props = { clients: { id: string; companyName: string }[] };

export function ConnectFacebookForm({ clients }: Props) {
  const [state, formAction] = useActionState(connectFacebookPage, {});

  return (
    <form action={formAction} className="space-y-4 rounded-xl border border-black/10 bg-white p-5">
      <h2 className="text-lg font-semibold">Connect Facebook Page</h2>
      <p className="text-sm text-black/60">
        Get a Page access token from Meta Business Suite or Graph API Explorer (with pages_manage_posts).
        Enter the Page ID and token below.
      </p>
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
          className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm"
        >
          <option value="">Select client</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.companyName}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="pageId" className="block text-sm font-medium">Facebook Page ID *</label>
        <input
          id="pageId"
          name="pageId"
          type="text"
          required
          placeholder="e.g. 123456789012345"
          className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label htmlFor="pageName" className="block text-sm font-medium">Page name *</label>
        <input
          id="pageName"
          name="pageName"
          type="text"
          required
          placeholder="e.g. My Business Page"
          className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label htmlFor="pageAccessToken" className="block text-sm font-medium">Page access token *</label>
        <input
          id="pageAccessToken"
          name="pageAccessToken"
          type="password"
          required
          placeholder="EAAxxxx..."
          className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm font-mono"
        />
      </div>
      <button
        type="submit"
        className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black/90"
      >
        Connect page
      </button>
    </form>
  );
}
