"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { connectAllPages } from "../actions";

type FbPage = { id: string; name: string; accessToken: string };
type Client = { id: string; companyName: string };

export function ConnectAllPagesForm({
  pages,
  clients,
  userToken,
  userTokenExpiresAt,
}: {
  pages: FbPage[];
  clients: Client[];
  userToken: string;
  userTokenExpiresAt: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Array<{ page: string; error: string }>>([]);

  const defaultClientId = clients.length === 1 ? clients[0].id : "";
  const [clientMap, setClientMap] = useState<Record<string, string>>(() =>
    Object.fromEntries(pages.map((p) => [p.id, defaultClientId]))
  );
  const [selected, setSelected] = useState<Set<string>>(new Set(pages.map((p) => p.id)));

  const selectedPages = pages.filter((p) => selected.has(p.id));
  const canSubmit = selectedPages.length > 0 && selectedPages.every((p) => clientMap[p.id]);

  function toggleAll(checked: boolean) {
    setSelected(checked ? new Set(pages.map((p) => p.id)) : new Set());
  }

  function setAllClients(clientId: string) {
    setClientMap((prev) => Object.fromEntries(pages.map((p) => [p.id, clientId ?? prev[p.id]])));
  }

  function handleSubmit() {
    setErrors([]);
    const payload = selectedPages.map((p) => ({
      pageId: p.id,
      pageName: p.name,
      pageAccessToken: p.accessToken,
      clientId: clientMap[p.id],
    }));
    startTransition(async () => {
      const result = await connectAllPages(payload, userToken, userTokenExpiresAt);
      if (result.errors.length > 0) {
        setErrors(result.errors);
      } else {
        router.push("/hub/social");
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Bulk client selector */}
      {clients.length > 1 && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-(--hub-border-light) bg-black/2 px-4 py-3">
          <span className="text-sm font-medium text-(--hub-text)">Set all to:</span>
          <select
            className="rounded-lg border border-(--hub-border-light) px-3 py-1.5 text-sm focus:border-(--primary) focus:outline-none focus:ring-1 focus:ring-(--primary)"
            defaultValue=""
            onChange={(e) => { if (e.target.value) setAllClients(e.target.value); }}
          >
            <option value="">Select client…</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.companyName}</option>
            ))}
          </select>
        </div>
      )}

      {/* Pages table */}
      <div className="overflow-hidden rounded-xl border border-(--hub-border-light) bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-(--hub-border-light) bg-black/2">
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selected.size === pages.length}
                  ref={(el) => { if (el) el.indeterminate = selected.size > 0 && selected.size < pages.length; }}
                  onChange={(e) => toggleAll(e.target.checked)}
                  className="rounded"
                />
              </th>
              <th className="px-4 py-3 text-left font-medium text-(--hub-text)">Page</th>
              <th className="px-4 py-3 text-left font-medium text-(--hub-text)">Map to client</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-(--hub-border-light)">
            {pages.map((page) => {
              const isSelected = selected.has(page.id);
              return (
                <tr key={page.id} className={isSelected ? "" : "opacity-40"}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        const next = new Set(selected);
                        if (e.target.checked) next.add(page.id);
                        else next.delete(page.id);
                        setSelected(next);
                      }}
                      className="rounded"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-(--hub-text)">{page.name}</p>
                    <p className="text-xs text-(--hub-muted)">ID: {page.id}</p>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={clientMap[page.id] ?? ""}
                      onChange={(e) => setClientMap((prev) => ({ ...prev, [page.id]: e.target.value }))}
                      disabled={!isSelected}
                      required={isSelected}
                      className="w-full rounded-lg border border-(--hub-border-light) px-3 py-1.5 text-sm focus:border-(--primary) focus:outline-none focus:ring-1 focus:ring-(--primary) disabled:opacity-50"
                    >
                      <option value="">Select client *</option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>{c.companyName}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 space-y-1">
          {errors.map((e, i) => (
            <p key={i}><strong>{e.page}:</strong> {e.error}</p>
          ))}
        </div>
      )}

      {/* Submit */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit || isPending}
          className="rounded-lg bg-(--meta-blue) px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-40"
        >
          {isPending
            ? "Connecting…"
            : `Connect ${selectedPages.length} page${selectedPages.length !== 1 ? "s" : ""}`}
        </button>
        {!canSubmit && selectedPages.length > 0 && (
          <p className="text-xs text-(--hub-muted)">Select a client for each page to continue.</p>
        )}
      </div>
    </div>
  );
}
