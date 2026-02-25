"use client";

import { useActionState } from "react";
import type { ClientStatus, BillingFrequency } from "@prisma/client";

const STATUS_OPTIONS: { value: ClientStatus; label: string }[] = [
  { value: "LEAD", label: "Lead" },
  { value: "ACTIVE", label: "Active" },
  { value: "PAUSED", label: "Paused" },
  { value: "CHURNED", label: "Churned" },
];

const BILLING_OPTIONS: { value: BillingFrequency; label: string }[] = [
  { value: "MONTHLY", label: "Monthly" },
  { value: "QUARTERLY", label: "Quarterly" },
  { value: "ANNUAL", label: "Annual" },
  { value: "CUSTOM", label: "Custom" },
];

type ClientFormProps = {
  action: (prev: { error?: string }, formData: FormData) => Promise<{ error?: string }>;
  defaultValues?: {
    companyName?: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    vatNumber?: string;
    billingAddress?: string;
    planLabel?: string;
    startDate?: string;
    renewalDate?: string;
    billingFrequency?: string;
    retainerAmount?: string;
    notes?: string;
    status?: string;
  };
  submitLabel: string;
  backHref: string;
};

export function ClientForm({
  action,
  defaultValues,
  submitLabel,
  backHref,
}: ClientFormProps) {
  const [state, formAction] = useActionState(action, {});

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const form = e.currentTarget;
    const firstInvalid = form.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
      "input:invalid, select:invalid, textarea:invalid"
    );
    if (firstInvalid) {
      e.preventDefault();
      firstInvalid.focus();
      firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} className="space-y-6">
      <p className="text-sm text-black/60">
        Required: <strong>Company name</strong> and <strong>Contact person</strong> (at the top of the form).
      </p>
      {state?.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {state.error}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="companyName" className="mb-1 block text-sm font-medium">
            Company name *
          </label>
          <input
            id="companyName"
            name="companyName"
            required
            defaultValue={defaultValues?.companyName}
            className="w-full rounded-md border border-black/15 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="contactPerson" className="mb-1 block text-sm font-medium">
            Contact person *
          </label>
          <input
            id="contactPerson"
            name="contactPerson"
            required
            defaultValue={defaultValues?.contactPerson}
            className="w-full rounded-md border border-black/15 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={defaultValues?.email}
            className="w-full rounded-md border border-black/15 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-medium">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={defaultValues?.phone}
            className="w-full rounded-md border border-black/15 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="vatNumber" className="mb-1 block text-sm font-medium">
            VAT number
          </label>
          <input
            id="vatNumber"
            name="vatNumber"
            defaultValue={defaultValues?.vatNumber}
            className="w-full rounded-md border border-black/15 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="status" className="mb-1 block text-sm font-medium">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={defaultValues?.status ?? "LEAD"}
            className="w-full rounded-md border border-black/15 px-3 py-2 text-sm"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="billingAddress" className="mb-1 block text-sm font-medium">
            Billing address
          </label>
          <textarea
            id="billingAddress"
            name="billingAddress"
            rows={2}
            defaultValue={defaultValues?.billingAddress}
            className="w-full rounded-md border border-black/15 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="planLabel" className="mb-1 block text-sm font-medium">
            Plan label
          </label>
          <input
            id="planLabel"
            name="planLabel"
            defaultValue={defaultValues?.planLabel}
            className="w-full rounded-md border border-black/15 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="billingFrequency" className="mb-1 block text-sm font-medium">
            Billing frequency
          </label>
          <select
            id="billingFrequency"
            name="billingFrequency"
            defaultValue={defaultValues?.billingFrequency ?? ""}
            className="w-full rounded-md border border-black/15 px-3 py-2 text-sm"
          >
            <option value="">—</option>
            {BILLING_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="retainerAmount" className="mb-1 block text-sm font-medium">
            Retainer amount (ZAR)
          </label>
          <input
            id="retainerAmount"
            name="retainerAmount"
            type="text"
            inputMode="decimal"
            defaultValue={defaultValues?.retainerAmount}
            placeholder="e.g. 8500"
            className="w-full rounded-md border border-black/15 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="startDate" className="mb-1 block text-sm font-medium">
            Start date
          </label>
          <input
            id="startDate"
            name="startDate"
            type="date"
            defaultValue={defaultValues?.startDate}
            className="w-full rounded-md border border-black/15 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="renewalDate" className="mb-1 block text-sm font-medium">
            Renewal date
          </label>
          <input
            id="renewalDate"
            name="renewalDate"
            type="date"
            defaultValue={defaultValues?.renewalDate}
            className="w-full rounded-md border border-black/15 px-3 py-2 text-sm"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="notes" className="mb-1 block text-sm font-medium">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            defaultValue={defaultValues?.notes}
            className="w-full rounded-md border border-black/15 px-3 py-2 text-sm"
          />
        </div>
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
