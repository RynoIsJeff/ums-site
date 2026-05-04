"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Trash2, Send, CheckSquare, Square } from "lucide-react";
import { deleteInvoice, setInvoiceStatus } from "../actions";
import { StatusBadge } from "@/app/hub/_components/StatusBadge";
import { DuplicateInvoiceButton } from "./DuplicateInvoiceButton";
import { DeleteInvoiceButton } from "./DeleteInvoiceButton";
import { MarkInvoiceSentButton } from "./MarkInvoiceSentButton";

type Invoice = {
  id: string;
  invoiceNumber: string;
  status: string;
  issueDate: Date;
  dueDate: Date;
  totalAmount: string | number;
  client: { id: string; companyName: string };
  _count: { allocations: number };
};

type Props = {
  invoices: Invoice[];
};

function fmt(n: string | number) {
  return Number(n).toLocaleString("en-ZA");
}

export function BulkInvoiceTable({ invoices }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const toggleAll = useCallback(() => {
    setSelected((prev) =>
      prev.size === invoices.length ? new Set() : new Set(invoices.map((i) => i.id))
    );
  }, [invoices]);

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectedInvoices = invoices.filter((i) => selected.has(i.id));
  const allDraft = selectedInvoices.every((i) => i.status === "DRAFT");
  const anySelected = selected.size > 0;

  const handleBulkSend = async () => {
    if (!allDraft) return;
    if (!confirm(`Mark ${selected.size} invoice(s) as Sent?`)) return;
    setLoading(true);
    setErrors([]);
    const errs: string[] = [];
    for (const id of Array.from(selected)) {
      const r = await setInvoiceStatus(id, "SENT");
      if (r.error) errs.push(`${invoices.find((i) => i.id === id)?.invoiceNumber}: ${r.error}`);
    }
    setErrors(errs);
    setSelected(new Set());
    setLoading(false);
  };

  const handleBulkDelete = async () => {
    if (!allDraft) return;
    if (!confirm(`Permanently delete ${selected.size} draft invoice(s)? This cannot be undone.`)) return;
    setLoading(true);
    setErrors([]);
    const errs: string[] = [];
    for (const id of Array.from(selected)) {
      const r = await deleteInvoice(id);
      if (r.error) errs.push(`${invoices.find((i) => i.id === id)?.invoiceNumber}: ${r.error}`);
    }
    setErrors(errs);
    setSelected(new Set());
    setLoading(false);
  };

  const allChecked = invoices.length > 0 && selected.size === invoices.length;

  return (
    <>
      {errors.length > 0 && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800 space-y-0.5">
          {errors.map((e, i) => <div key={i}>{e}</div>)}
        </div>
      )}

      {anySelected && (
        <div className="mb-3 flex flex-wrap items-center gap-3 rounded-lg border border-(--hub-border-light) bg-white px-4 py-2.5 shadow-sm">
          <span className="text-sm font-medium text-(--hub-text)">
            {selected.size} selected
          </span>
          {allDraft ? (
            <>
              <button
                type="button"
                onClick={handleBulkSend}
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-md bg-(--primary) px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
              >
                <Send className="h-3 w-3" />
                Mark sent
              </button>
              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
              >
                <Trash2 className="h-3 w-3" />
                Delete drafts
              </button>
            </>
          ) : (
            <span className="text-xs text-(--hub-muted)">Bulk actions only available for DRAFT invoices</span>
          )}
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="ml-auto text-xs text-(--hub-muted) hover:text-(--hub-text)"
          >
            Clear selection
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="hub-table min-w-[760px]">
          <thead>
            <tr>
              <th className="w-10 pr-0">
                <button
                  type="button"
                  onClick={toggleAll}
                  className="flex items-center text-(--hub-muted) hover:text-(--hub-text)"
                  aria-label={allChecked ? "Deselect all" : "Select all"}
                >
                  {allChecked
                    ? <CheckSquare className="h-4 w-4 text-(--primary)" />
                    : <Square className="h-4 w-4" />}
                </button>
              </th>
              <th>Number</th>
              <th>Client</th>
              <th>Invoice date</th>
              <th>Due date</th>
              <th>Amount</th>
              <th>Status</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className={selected.has(inv.id) ? "bg-(--primary)/3" : ""}>
                <td className="pr-0">
                  <input
                    type="checkbox"
                    checked={selected.has(inv.id)}
                    onChange={() => toggle(inv.id)}
                    className="rounded border-(--hub-border-light)"
                    aria-label={`Select ${inv.invoiceNumber}`}
                  />
                </td>
                <td>
                  <Link href={`/hub/invoices/${inv.id}`} className="font-medium text-(--hub-text) hover:underline">
                    {inv.invoiceNumber}
                  </Link>
                </td>
                <td>
                  <Link href={`/hub/clients/${inv.client.id}`} className="text-(--hub-muted) hover:underline">
                    {inv.client.companyName}
                  </Link>
                </td>
                <td className="text-(--hub-text)">
                  {inv.issueDate.toLocaleDateString("en-ZA", { dateStyle: "medium" })}
                </td>
                <td className="text-(--hub-text)">
                  {inv.dueDate.toLocaleDateString("en-ZA", { dateStyle: "medium" })}
                </td>
                <td className="text-(--hub-text)">R {fmt(inv.totalAmount)}</td>
                <td>
                  <StatusBadge status={inv.status as "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "VOID"} />
                </td>
                <td className="whitespace-nowrap text-right">
                  <span className="inline-flex flex-wrap items-center justify-end gap-x-3 gap-y-1">
                    <Link href={`/api/hub/invoices/${inv.id}/pdf`} target="_blank" rel="noopener noreferrer" className="text-(--hub-muted) hover:underline">View</Link>
                    <a href={`/api/hub/invoices/${inv.id}/pdf?download=1`} download className="text-(--hub-muted) hover:underline">Download</a>
                    {inv.status === "DRAFT" && (
                      <Link href={`/hub/invoices/${inv.id}/edit`} className="text-(--hub-muted) hover:underline">Edit</Link>
                    )}
                    {inv.status === "DRAFT" && (
                      <MarkInvoiceSentButton invoiceId={inv.id} />
                    )}
                    <DuplicateInvoiceButton invoiceId={inv.id} compact />
                    {inv.status === "DRAFT" && inv._count.allocations === 0 && (
                      <DeleteInvoiceButton invoiceId={inv.id} invoiceNumber={inv.invoiceNumber} compact />
                    )}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
