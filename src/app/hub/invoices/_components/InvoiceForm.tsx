"use client";

import { useActionState, useState } from "react";
import { PendingSubmitButton } from "@/app/hub/_components/PendingSubmitButton";

const LINE_ROWS = 6;

type LineItemDefault = { description: string; quantity: number; unitPrice: number };

type StoreOption = { id: string; name: string; clientId: string };

type InvoiceFormProps = {
  action: (prev: { error?: string }, formData: FormData) => Promise<{ error?: string }>;
  clients: { id: string; companyName: string }[];
  stores: StoreOption[];
  defaultInvoiceNumber: string;
  defaultIssueDate: string;
  defaultDueDate: string;
  submitLabel: string;
  backHref: string;
  defaultLineItems?: LineItemDefault[];
  defaultNotes?: string;
  defaultClientId?: string;
  defaultStoreId?: string;
};

export function InvoiceForm({
  action,
  clients,
  stores,
  defaultInvoiceNumber,
  defaultIssueDate,
  defaultDueDate,
  submitLabel,
  backHref,
  defaultLineItems = [],
  defaultNotes = "",
  defaultClientId,
  defaultStoreId,
}: InvoiceFormProps) {
  const [state, formAction] = useActionState(action, {});
  const [selectedClientId, setSelectedClientId] = useState(defaultClientId ?? "");
  const rows = Math.max(LINE_ROWS, defaultLineItems.length || 1);
  const lineRows = Array.from({ length: rows }, (_, i) => defaultLineItems[i] ?? { description: "", quantity: 1, unitPrice: 0 });

  const clientStores = stores;

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {state.error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="clientId" className="mb-1 block text-sm font-medium">
            Client *
          </label>
          <select
            id="clientId"
            name="clientId"
            required
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className="w-full rounded-md border border-black/15 px-3 py-2 text-sm"
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
          <label htmlFor="invoiceNumber" className="mb-1 block text-sm font-medium">
            Invoice number *
          </label>
          <input
            id="invoiceNumber"
            name="invoiceNumber"
            required
            defaultValue={defaultInvoiceNumber}
            className="w-full rounded-md border border-black/15 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="issueDate" className="mb-1 block text-sm font-medium">
            Issue date *
          </label>
          <input
            id="issueDate"
            name="issueDate"
            type="date"
            required
            defaultValue={defaultIssueDate}
            className="w-full rounded-md border border-black/15 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="dueDate" className="mb-1 block text-sm font-medium">
            Due date *
          </label>
          <input
            id="dueDate"
            name="dueDate"
            type="date"
            required
            defaultValue={defaultDueDate}
            className="w-full rounded-md border border-black/15 px-3 py-2 text-sm"
          />
        </div>

        {/* Store — shown whenever a client is selected */}
        {selectedClientId && (
          <div className="sm:col-span-2">
            <label htmlFor="storeId" className="mb-1 block text-sm font-medium">
              Store <span className="font-normal text-black/50">(optional — bill a specific branch)</span>
            </label>
            {clientStores.length > 0 ? (
              <select
                id="storeId"
                name="storeId"
                defaultValue={defaultStoreId ?? ""}
                className="w-full rounded-md border border-black/15 px-3 py-2 text-sm"
              >
                <option value="">No specific store</option>
                {clientStores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-black/50 py-2">
                No stores set up for this client.{" "}
                <a href="/hub/promos/stores" className="underline hover:text-black">
                  Add a store
                </a>{" "}
                first.
              </p>
            )}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-sm font-medium">Line items</h3>
        <p className="mt-1 text-xs text-black/60">Leave description empty to skip a row.</p>
        <div className="mt-2 space-y-2">
          <div className="grid grid-cols-12 gap-2 text-xs font-medium text-black/60">
            <div className="col-span-6">Description</div>
            <div className="col-span-2">Qty</div>
            <div className="col-span-3">Unit price (R)</div>
          </div>
          {lineRows.map((row, i) => (
            <div key={i} className="grid grid-cols-12 gap-2">
              <input
                name="description"
                placeholder="Description"
                defaultValue={row.description}
                className="col-span-6 rounded-md border border-black/15 px-3 py-2 text-sm"
              />
              <input
                name="quantity"
                type="text"
                inputMode="decimal"
                defaultValue={row.quantity}
                placeholder="1"
                className="col-span-2 rounded-md border border-black/15 px-3 py-2 text-sm"
              />
              <input
                name="unitPrice"
                type="text"
                inputMode="decimal"
                defaultValue={row.unitPrice}
                placeholder="0"
                className="col-span-3 rounded-md border border-black/15 px-3 py-2 text-sm"
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="mb-1 block text-sm font-medium">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={2}
          defaultValue={defaultNotes}
          className="w-full rounded-md border border-black/15 px-3 py-2 text-sm"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <PendingSubmitButton className="rounded-md border border-transparent bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black/90">
          {submitLabel}
        </PendingSubmitButton>
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
