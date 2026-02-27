"use client";

import { useActionState } from "react";
import { connectAdAccount } from "../actions";

type Props = { clients: { id: string; companyName: string }[] };

export function ConnectAdAccountForm({ clients }: Props) {
  const [state, formAction] = useActionState(connectAdAccount, {});

  return (
    <form action={formAction} className="space-y-4 rounded-xl border border-(--hub-border-light) bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-(--meta-blue)/10">
          <svg className="h-5 w-5 text-(--meta-blue)" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-(--hub-text)">Connect ad account</h2>
          <p className="text-sm text-(--hub-muted)">
            Add an ad account from Meta Business Manager.
          </p>
        </div>
      </div>

      {state?.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="clientId" className="block text-sm font-medium text-(--hub-text)">
          Client *
        </label>
        <select
          id="clientId"
          name="clientId"
          required
          className="mt-1 w-full rounded-lg border border-(--hub-border-light) px-3 py-2.5 text-sm focus:border-(--meta-blue) focus:outline-none focus:ring-1 focus:ring-(--meta-blue)"
        >
          <option value="">Select client</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.companyName}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="accountId" className="block text-sm font-medium text-(--hub-text)">
          Ad account ID *
        </label>
        <input
          id="accountId"
          name="accountId"
          type="text"
          required
          placeholder="act_123456789"
          className="mt-1 w-full rounded-lg border border-(--hub-border-light) px-3 py-2.5 text-sm font-mono focus:border-(--meta-blue) focus:outline-none focus:ring-1 focus:ring-(--meta-blue)"
        />
        <p className="mt-1 text-xs text-(--hub-muted)">
          Format: act_ followed by numbers. Find in Ads Manager → Settings.
        </p>
      </div>

      <div>
        <label htmlFor="accountName" className="block text-sm font-medium text-(--hub-text)">
          Account name (optional)
        </label>
        <input
          id="accountName"
          name="accountName"
          type="text"
          placeholder="e.g. Main ad account"
          className="mt-1 w-full rounded-lg border border-(--hub-border-light) px-3 py-2.5 text-sm focus:border-(--meta-blue) focus:outline-none focus:ring-1 focus:ring-(--meta-blue)"
        />
      </div>

      <div>
        <label htmlFor="accessToken" className="block text-sm font-medium text-(--hub-text)">
          Access token (optional)
        </label>
        <input
          id="accessToken"
          name="accessToken"
          type="password"
          placeholder="For API access — add later"
          className="mt-1 w-full rounded-lg border border-(--hub-border-light) px-3 py-2.5 text-sm font-mono focus:border-(--meta-blue) focus:outline-none focus:ring-1 focus:ring-(--meta-blue)"
        />
        <p className="mt-1 text-xs text-(--hub-muted)">
          User or System User token with ads_management, business_management.
        </p>
      </div>

      <button
        type="submit"
        className="rounded-lg bg-(--meta-blue) px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-(--meta-blue-hover)"
      >
        Connect
      </button>
    </form>
  );
}
