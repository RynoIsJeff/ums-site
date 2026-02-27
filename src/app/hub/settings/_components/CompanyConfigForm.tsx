"use client";

import { useActionState } from "react";
import type { CompanyConfigFormState } from "../actions";
import type { CompanyConfig } from "@prisma/client";

type CompanyConfigFormProps = {
  action: (
    prev: CompanyConfigFormState,
    formData: FormData
  ) => Promise<CompanyConfigFormState>;
  config: CompanyConfig | null;
};

export function CompanyConfigForm({ action, config }: CompanyConfigFormProps) {
  const [state, formAction] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          Company settings saved.
        </div>
      )}
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="companyName"
            className="block text-sm font-medium text-(--hub-text)"
          >
            Company name
          </label>
          <input
            id="companyName"
            name="companyName"
            type="text"
            defaultValue={config?.companyName ?? ""}
            placeholder="e.g. Ultimate Marketing Smash (Pty) Ltd"
            className="mt-1 w-full rounded-lg border border-(--hub-border-light) px-3 py-2.5 text-sm focus:border-(--primary) focus:outline-none focus:ring-1 focus:ring-(--primary)"
          />
        </div>
        <div>
          <label
            htmlFor="supportEmail"
            className="block text-sm font-medium text-(--hub-text)"
          >
            Support email
          </label>
          <input
            id="supportEmail"
            name="supportEmail"
            type="email"
            defaultValue={config?.supportEmail ?? ""}
            placeholder="e.g. billing@company.com"
            className="mt-1 w-full rounded-lg border border-(--hub-border-light) px-3 py-2.5 text-sm focus:border-(--primary) focus:outline-none focus:ring-1 focus:ring-(--primary)"
          />
          <p className="mt-1 text-xs text-(--hub-muted)">
            Used for invoice emails and client correspondence.
          </p>
        </div>
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-(--hub-text)"
          >
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="text"
            defaultValue={config?.phone ?? ""}
            placeholder="e.g. +27 79 490 5070"
            className="mt-1 w-full rounded-lg border border-(--hub-border-light) px-3 py-2.5 text-sm focus:border-(--primary) focus:outline-none focus:ring-1 focus:ring-(--primary)"
          />
        </div>
        <div>
          <label
            htmlFor="defaultCurrency"
            className="block text-sm font-medium text-(--hub-text)"
          >
            Default currency
          </label>
          <select
            id="defaultCurrency"
            name="defaultCurrency"
            defaultValue={config?.defaultCurrency ?? "ZAR"}
            className="mt-1 w-full rounded-lg border border-(--hub-border-light) px-3 py-2.5 text-sm focus:border-(--primary) focus:outline-none focus:ring-1 focus:ring-(--primary)"
          >
            <option value="ZAR">ZAR</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="defaultVatRate"
            className="block text-sm font-medium text-(--hub-text)"
          >
            Default VAT rate (%)
          </label>
          <input
            id="defaultVatRate"
            name="defaultVatRate"
            type="number"
            min="0"
            step="0.01"
            defaultValue={config ? Number(config.defaultVatRate) : 15}
            className="mt-1 w-full rounded-lg border border-(--hub-border-light) px-3 py-2.5 text-sm focus:border-(--primary) focus:outline-none focus:ring-1 focus:ring-(--primary)"
          />
        </div>
        <div>
          <label
            htmlFor="invoicePrefix"
            className="block text-sm font-medium text-(--hub-text)"
          >
            Invoice number prefix
          </label>
          <input
            id="invoicePrefix"
            name="invoicePrefix"
            type="text"
            defaultValue={config?.invoicePrefix ?? ""}
            placeholder="e.g. INV- or empty"
            className="mt-1 w-full rounded-lg border border-(--hub-border-light) px-3 py-2.5 text-sm focus:border-(--primary) focus:outline-none focus:ring-1 focus:ring-(--primary)"
          />
          <p className="mt-1 text-xs text-(--hub-muted)">
            Optional prefix for invoice numbers (e.g. INV-0001).
          </p>
        </div>
      </div>
      <div>
        <label
          htmlFor="billingAddress"
          className="block text-sm font-medium text-(--hub-text)"
        >
          Billing address
        </label>
        <textarea
          id="billingAddress"
          name="billingAddress"
          rows={3}
          defaultValue={config?.billingAddress ?? ""}
          placeholder="Company address for invoices"
          className="mt-1 w-full rounded-lg border border-(--hub-border-light) px-3 py-2.5 text-sm focus:border-(--primary) focus:outline-none focus:ring-1 focus:ring-(--primary)"
        />
      </div>
      <button
        type="submit"
        className="rounded-lg bg-(--primary) px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
      >
        Save company settings
      </button>
    </form>
  );
}
