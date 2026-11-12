"use client";

import { useActionState, useState } from "react";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { PendingSubmitButton } from "@/app/hub/_components/PendingSubmitButton";
import type { ClientStatus, BillingFrequency } from "@prisma/client";

type BrandVoice = {
  tone?: string;
  slogans?: string;
  audience?: string;
  hashtags?: string;
  useWords?: string;
  avoidWords?: string;
  cta?: string;
};

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
    bv_tone?: string;
    bv_slogans?: string;
    bv_audience?: string;
    bv_hashtags?: string;
    bv_useWords?: string;
    bv_avoidWords?: string;
    bv_cta?: string;
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
  const [bvOpen, setBvOpen] = useState(false);

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

      {/* AI Brand Voice */}
      <div className="rounded-xl border border-purple-200 bg-purple-50/50">
        <button
          type="button"
          onClick={() => setBvOpen((o) => !o)}
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-purple-900"
        >
          <span className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-600" />
            AI Brand Voice
          </span>
          {bvOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {bvOpen && (
          <div className="grid gap-4 border-t border-purple-200 px-4 pb-4 pt-4 sm:grid-cols-2">
            <p className="sm:col-span-2 text-xs text-purple-700">
              These details help the AI Campaign Generator write captions that match your client&apos;s brand. All fields are optional.
            </p>
            <div className="sm:col-span-2">
              <label htmlFor="bv_tone" className="mb-1 block text-sm font-medium">Tone &amp; style</label>
              <input id="bv_tone" name="bv_tone" defaultValue={defaultValues?.bv_tone}
                placeholder="e.g. friendly, down-to-earth, community-focused"
                className="w-full rounded-md border border-black/15 px-3 py-2 text-sm" />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="bv_slogans" className="mb-1 block text-sm font-medium">Slogans &amp; taglines</label>
              <input id="bv_slogans" name="bv_slogans" defaultValue={defaultValues?.bv_slogans}
                placeholder="e.g. BUILD IT! | SupaTrade Specials | Prices you'll love"
                className="w-full rounded-md border border-black/15 px-3 py-2 text-sm" />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="bv_audience" className="mb-1 block text-sm font-medium">Target audience</label>
              <input id="bv_audience" name="bv_audience" defaultValue={defaultValues?.bv_audience}
                placeholder="e.g. Working-class South African families and builders"
                className="w-full rounded-md border border-black/15 px-3 py-2 text-sm" />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="bv_hashtags" className="mb-1 block text-sm font-medium">Preferred hashtags</label>
              <input id="bv_hashtags" name="bv_hashtags" defaultValue={defaultValues?.bv_hashtags}
                placeholder="e.g. #SupaTrade #BuildIt #WeeklySpecials"
                className="w-full rounded-md border border-black/15 px-3 py-2 text-sm" />
            </div>
            <div>
              <label htmlFor="bv_useWords" className="mb-1 block text-sm font-medium">Words/phrases to use</label>
              <textarea id="bv_useWords" name="bv_useWords" rows={2} defaultValue={defaultValues?.bv_useWords}
                placeholder="e.g. affordable, fresh, value, specials, deals"
                className="w-full rounded-md border border-black/15 px-3 py-2 text-sm" />
            </div>
            <div>
              <label htmlFor="bv_avoidWords" className="mb-1 block text-sm font-medium">Words/phrases to avoid</label>
              <textarea id="bv_avoidWords" name="bv_avoidWords" rows={2} defaultValue={defaultValues?.bv_avoidWords}
                placeholder="e.g. luxury, exclusive, premium, upmarket"
                className="w-full rounded-md border border-black/15 px-3 py-2 text-sm" />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="bv_cta" className="mb-1 block text-sm font-medium">Preferred call-to-action</label>
              <input id="bv_cta" name="bv_cta" defaultValue={defaultValues?.bv_cta}
                placeholder="e.g. Visit your nearest BUILD IT SupaTrade today!"
                className="w-full rounded-md border border-black/15 px-3 py-2 text-sm" />
            </div>
          </div>
        )}
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
