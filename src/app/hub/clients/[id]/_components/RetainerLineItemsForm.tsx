"use client";

import { useActionState, useState } from "react";
import { Plus, X, ChevronDown, ChevronUp } from "lucide-react";
import {
  updateClientRetainerLineItems,
  type RetainerLineItemsFormState,
} from "../../actions";
import { PendingSubmitButton } from "@/app/hub/_components/PendingSubmitButton";
import type { RetainerInvoiceGroup } from "@/lib/retainer-invoice-lines";

type Row = { id: string; description: string; quantity: string; unitPrice: string };
type Group = { id: string; name: string; rows: Row[] };

function makeRow(): Row {
  return { id: `r-${Math.random().toString(36).slice(2)}`, description: "", quantity: "1", unitPrice: "" };
}
function makeGroup(src?: RetainerInvoiceGroup): Group {
  return {
    id: `g-${Math.random().toString(36).slice(2)}`,
    name: src?.name ?? "",
    rows: src?.lines?.length
      ? src.lines.map((l) => ({
          id: `r-${Math.random().toString(36).slice(2)}`,
          description: l.description,
          quantity: String(l.quantity),
          unitPrice: String(l.unitPrice),
        }))
      : [makeRow()],
  };
}

function groupTotal(g: Group): number {
  return g.rows.reduce((sum, r) => sum + (parseFloat(r.quantity) || 0) * (parseFloat(r.unitPrice) || 0), 0);
}

function toJson(groups: Group[]) {
  return JSON.stringify(
    groups.map((g) => ({
      name: g.name,
      lines: g.rows
        .filter((r) => r.description.trim())
        .map((r) => ({
          description: r.description,
          quantity: parseFloat(r.quantity) || 1,
          unitPrice: parseFloat(r.unitPrice) || 0,
        })),
    }))
  );
}

type Props = { clientId: string; defaultGroups: RetainerInvoiceGroup[] };

export function RetainerLineItemsForm({ clientId, defaultGroups }: Props) {
  const bound = updateClientRetainerLineItems.bind(null, clientId);
  const [state, formAction] = useActionState(bound, {} as RetainerLineItemsFormState);
  const [groups, setGroups] = useState<Group[]>(() =>
    defaultGroups.length > 0 ? defaultGroups.map((g) => makeGroup(g)) : [makeGroup()]
  );

  // --- group operations ---
  const addGroup = () => setGroups((prev) => [...prev, makeGroup()]);
  const removeGroup = (gid: string) =>
    setGroups((prev) => (prev.length > 1 ? prev.filter((g) => g.id !== gid) : prev));
  const updateGroupName = (gid: string, name: string) =>
    setGroups((prev) => prev.map((g) => (g.id === gid ? { ...g, name } : g)));

  // --- row operations ---
  const addRow = (gid: string) =>
    setGroups((prev) =>
      prev.map((g) => (g.id === gid ? { ...g, rows: [...g.rows, makeRow()] } : g))
    );
  const removeRow = (gid: string, rid: string) =>
    setGroups((prev) =>
      prev.map((g) =>
        g.id === gid
          ? { ...g, rows: g.rows.length > 1 ? g.rows.filter((r) => r.id !== rid) : g.rows }
          : g
      )
    );
  const updateRow = (gid: string, rid: string, field: keyof Omit<Row, "id">, value: string) =>
    setGroups((prev) =>
      prev.map((g) =>
        g.id === gid
          ? { ...g, rows: g.rows.map((r) => (r.id === rid ? { ...r, [field]: value } : r)) }
          : g
      )
    );

  const overallTotal = groups.reduce((sum, g) => sum + groupTotal(g), 0);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="retainerGroupsJson" value={toJson(groups)} />

      {state?.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {state.error}
        </div>
      )}
      {state?.ok && (
        <p className="text-sm text-emerald-700">Retainer invoice lines saved.</p>
      )}

      <div className="space-y-4">
        {groups.map((group, gi) => (
          <div key={group.id} className="rounded-lg border border-(--hub-border-light) bg-white">
            {/* Group header */}
            <div className="flex items-center gap-2 border-b border-(--hub-border-light) px-3 py-2.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-(--hub-muted) shrink-0">
                Invoice {gi + 1}
              </span>
              <input
                type="text"
                placeholder="Label (e.g. Social Media Retainer)"
                value={group.name}
                onChange={(e) => updateGroupName(group.id, e.target.value)}
                className="flex-1 rounded-md border border-(--hub-border-light) px-2.5 py-1.5 text-sm focus:border-(--primary) focus:outline-none focus:ring-1 focus:ring-(--primary)"
              />
              {groups.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeGroup(group.id)}
                  className="ml-auto rounded p-1 text-black/40 hover:text-red-500"
                  aria-label="Remove invoice group"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Line rows */}
            <div className="p-3 space-y-2">
              <div className="grid grid-cols-12 gap-2 px-1 text-xs font-medium text-(--hub-muted)">
                <div className="col-span-6">Description</div>
                <div className="col-span-2">Qty</div>
                <div className="col-span-3">Unit price (R)</div>
              </div>
              {group.rows.map((row) => (
                <div key={row.id} className="grid grid-cols-12 gap-2 items-center">
                  <input
                    placeholder="e.g. Social media management"
                    value={row.description}
                    onChange={(e) => updateRow(group.id, row.id, "description", e.target.value)}
                    className="col-span-6 rounded-md border border-(--hub-border-light) px-3 py-2 text-sm focus:border-(--primary) focus:outline-none focus:ring-1 focus:ring-(--primary)"
                  />
                  <input
                    type="text"
                    inputMode="decimal"
                    value={row.quantity}
                    onChange={(e) => updateRow(group.id, row.id, "quantity", e.target.value)}
                    className="col-span-2 rounded-md border border-(--hub-border-light) px-3 py-2 text-sm focus:border-(--primary) focus:outline-none focus:ring-1 focus:ring-(--primary)"
                  />
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={row.unitPrice}
                    onChange={(e) => updateRow(group.id, row.id, "unitPrice", e.target.value)}
                    className="col-span-3 rounded-md border border-(--hub-border-light) px-3 py-2 text-sm focus:border-(--primary) focus:outline-none focus:ring-1 focus:ring-(--primary)"
                  />
                  <button
                    type="button"
                    onClick={() => removeRow(group.id, row.id)}
                    disabled={group.rows.length === 1}
                    className="col-span-1 flex items-center justify-center rounded-md p-2 text-black/40 hover:text-red-500 disabled:opacity-20"
                    aria-label="Remove line"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}

              {/* Group footer */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => addRow(group.id)}
                  className="inline-flex items-center gap-1 text-xs text-black/60 hover:text-black"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add line
                </button>
                {groupTotal(group) > 0 && (
                  <p className="text-xs font-medium text-(--hub-muted)">
                    Subtotal: R{" "}
                    {groupTotal(group).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add invoice group */}
      <button
        type="button"
        onClick={addGroup}
        className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-(--hub-border-light) px-3 py-2 text-sm font-medium text-(--hub-muted) hover:border-(--primary) hover:text-(--primary) w-full justify-center"
      >
        <Plus className="h-4 w-4" />
        Add another invoice
      </button>

      <p className="text-xs text-(--hub-muted)">
        Each invoice group generates a separate draft invoice when the monthly billing runs. Leave all descriptions empty to fall back to the retainer amount as a single line.
      </p>

      <div className="flex items-center justify-between">
        <PendingSubmitButton className="rounded-md border border-transparent bg-(--primary) px-4 py-2 text-sm font-semibold text-white hover:opacity-95">
          Save invoice lines
        </PendingSubmitButton>
        {overallTotal > 0 && (
          <p className="text-sm font-medium">
            Retainer total: R{" "}
            {overallTotal.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        )}
      </div>
    </form>
  );
}
