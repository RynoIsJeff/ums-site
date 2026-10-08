"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { PendingSubmitButton } from "@/app/hub/_components/PendingSubmitButton";
import {
  LineItemsFieldset,
  type LineItemDefault,
  type CreditLineDefault,
} from "./LineItemsFieldset";
import { StoreSelect, type StoreOption } from "./StoreSelect";

/**
 * Saving ends in a redirect to the invoice list, so the button keeps spinning
 * while that page loads. If it takes long enough to look stuck, say what is
 * happening — and warn against resubmitting, which would double up the work.
 */
function SlowSaveNotice() {
  const { pending } = useFormStatus();
  const [slowSince, setSlowSince] = useState<number | null>(null);

  useEffect(() => {
    if (!pending) return;
    const t = setTimeout(() => setSlowSince(Date.now()), 8000);
    return () => clearTimeout(t);
  }, [pending]);

  if (!pending || slowSince === null) return null;

  return (
    <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
      Still saving. Don&apos;t submit again — if it does not finish, check the{" "}
      <Link href="/hub/invoices" className="underline">
        invoice list
      </Link>{" "}
      first, as this invoice may already have been created.
    </p>
  );
}

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
  defaultCredits?: CreditLineDefault[];
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
  defaultCredits = [],
  defaultNotes = "",
  defaultClientId,
  defaultStoreId,
}: InvoiceFormProps) {
  const [state, formAction] = useActionState(action, {});
  const [selectedClientId, setSelectedClientId] = useState(defaultClientId ?? "");

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
          <StoreSelect
            stores={stores}
            clients={clients}
            selectedClientId={selectedClientId}
            defaultStoreId={defaultStoreId}
            documentLabel="bill"
          />
        )}
      </div>

      <LineItemsFieldset
        defaultLineItems={defaultLineItems}
        allowCredits
        defaultCredits={defaultCredits}
      />

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

      <SlowSaveNotice />

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
