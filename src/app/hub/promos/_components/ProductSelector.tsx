"use client";

import { useState } from "react";

type Product = {
  id: string;
  code?: string | null;
  name: string;
  variant?: string | null;
  price: string;
  imageData?: string | null;
};

type PriceState = { promo: string; original: string };
type VariantRow = { label: string; promoPrice: string; originalPrice: string };

type Props = {
  products: Product[];
  defaultSelected?: string[];
  defaultPriceOverrides?: Record<string, string>;   // productId → promo price override
  defaultOriginalPrices?: Record<string, string>;   // productId → original (was) price
  defaultVariants?: Record<string, VariantRow[]>;   // productId → variant rows (when multi mode)
};

export function ProductSelector({
  products,
  defaultSelected = [],
  defaultPriceOverrides = {},
  defaultOriginalPrices = {},
  defaultVariants = {},
}: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set(defaultSelected));
  const [prices, setPrices] = useState<Record<string, PriceState>>(() => {
    const init: Record<string, PriceState> = {};
    for (const p of products) {
      init[p.id] = {
        promo: defaultPriceOverrides[p.id] ?? p.price,
        original: defaultOriginalPrices[p.id] ?? "",
      };
    }
    return init;
  });
  const [modes, setModes] = useState<Record<string, "single" | "multi">>(() => {
    const init: Record<string, "single" | "multi"> = {};
    for (const p of products) {
      init[p.id] = defaultVariants[p.id]?.length >= 2 ? "multi" : "single";
    }
    return init;
  });
  const [variantRows, setVariantRows] = useState<Record<string, VariantRow[]>>(() => {
    const init: Record<string, VariantRow[]> = {};
    for (const p of products) {
      if (defaultVariants[p.id]?.length >= 2) {
        init[p.id] = defaultVariants[p.id];
      } else {
        init[p.id] = [
          { label: "", promoPrice: defaultPriceOverrides[p.id] ?? p.price, originalPrice: defaultOriginalPrices[p.id] ?? "" },
          { label: "", promoPrice: "", originalPrice: "" },
        ];
      }
    }
    return init;
  });
  const [filter, setFilter] = useState("");

  const filtered = filter.trim()
    ? products.filter((p) => {
        const q = filter.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          (p.code ?? "").toLowerCase().includes(q) ||
          (p.variant ?? "").toLowerCase().includes(q)
        );
      })
    : products;

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function setPrice(id: string, field: "promo" | "original", val: string) {
    setPrices((prev) => ({ ...prev, [id]: { ...prev[id], [field]: val } }));
  }

  function setMode(id: string, mode: "single" | "multi") {
    setModes((prev) => ({ ...prev, [id]: mode }));
  }

  function setVariantRow(pid: string, i: number, field: keyof VariantRow, val: string) {
    setVariantRows((prev) => {
      const rows = [...(prev[pid] ?? [])];
      rows[i] = { ...rows[i], [field]: val };
      return { ...prev, [pid]: rows };
    });
  }

  function addVariantRow(pid: string) {
    setVariantRows((prev) => ({
      ...prev,
      [pid]: [...(prev[pid] ?? []), { label: "", promoPrice: "", originalPrice: "" }],
    }));
  }

  function removeVariantRow(pid: string, i: number) {
    setVariantRows((prev) => {
      const rows = [...(prev[pid] ?? [])];
      if (rows.length <= 2) return prev;
      rows.splice(i, 1);
      return { ...prev, [pid]: rows };
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="block text-sm font-medium">Products ({selected.size} selected)</span>
        <div className="flex gap-3">
          <button type="button" onClick={() => setSelected(new Set(products.map((p) => p.id)))} className="text-xs text-black/60 hover:text-black underline">
            All
          </button>
          <button type="button" onClick={() => setSelected(new Set())} className="text-xs text-black/60 hover:text-black underline">
            None
          </button>
        </div>
      </div>

      {products.length > 5 && (
        <input
          type="search"
          placeholder="Filter by name or code…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="mb-3 w-full rounded-md border border-black/15 px-3 py-1.5 text-sm"
        />
      )}

      {products.length === 0 ? (
        <p className="text-sm text-(--hub-muted) py-2">
          No products in library yet.{" "}
          <a href="/hub/promos/products/new" className="underline">Add a product</a> first.
        </p>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {products.map((p) => {
            const isVisible = filtered.includes(p);
            const isOn = selected.has(p.id);
            const ps = prices[p.id] ?? { promo: p.price, original: "" };
            const mode = modes[p.id] ?? "single";
            const rows = variantRows[p.id] ?? [];
            return (
              <div
                key={p.id}
                style={isVisible ? undefined : { display: "none" }}
                className={`rounded-lg border transition-colors ${
                  isOn ? "border-black bg-black/4" : "border-black/10"
                }`}
              >
                {/* Checkbox row */}
                <label className="flex items-center gap-3 p-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="productIds[]"
                    value={p.id}
                    checked={isOn}
                    onChange={() => toggle(p.id)}
                    className="shrink-0"
                  />
                  {p.imageData && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.imageData}
                      alt={p.name}
                      className="h-10 w-10 rounded object-contain bg-gray-50 shrink-0"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    {p.code && <p className="text-[10px] font-mono text-black/40 leading-none mb-0.5">{p.code}</p>}
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    {p.variant && <p className="text-xs text-(--hub-muted) truncate">{p.variant}</p>}
                    <p className="text-xs text-black/40 mt-0.5">Library: R {parseFloat(p.price).toFixed(2)}</p>
                  </div>
                </label>

                {/* Price / variant controls — only shown when checked */}
                {isOn && (
                  <div className="border-t border-black/8 px-3 pb-3 pt-2 space-y-2">
                    {/* Mode toggle */}
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setMode(p.id, "single")}
                        className={`px-2 py-1 text-xs rounded transition-colors ${
                          mode === "single"
                            ? "bg-black text-white"
                            : "bg-black/5 text-black/60 hover:bg-black/10"
                        }`}
                      >
                        Single price
                      </button>
                      <button
                        type="button"
                        onClick={() => setMode(p.id, "multi")}
                        className={`px-2 py-1 text-xs rounded transition-colors ${
                          mode === "multi"
                            ? "bg-black text-white"
                            : "bg-black/5 text-black/60 hover:bg-black/10"
                        }`}
                      >
                        Multiple variants
                      </button>
                    </div>

                    {/* Hidden mode indicator */}
                    <input type="hidden" name={`variantMode_${p.id}`} value={mode} />

                    {mode === "single" ? (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-medium text-black/60 mb-1">Promo price (R) *</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            name={`priceOverride_${p.id}`}
                            value={ps.promo}
                            onChange={(e) => setPrice(p.id, "promo", e.target.value)}
                            className="w-full rounded border border-black/15 px-2 py-1 text-sm font-semibold text-red-700"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-black/60 mb-1">Was price (R) — optional</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            name={`originalPrice_${p.id}`}
                            value={ps.original}
                            onChange={(e) => setPrice(p.id, "original", e.target.value)}
                            placeholder="e.g. 999.99"
                            className="w-full rounded border border-black/15 px-2 py-1 text-sm text-black/60"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <input type="hidden" name={`variantCount_${p.id}`} value={rows.length} />
                        {rows.map((row, i) => (
                          <div key={i} className="rounded border border-black/10 p-2 space-y-1.5">
                            <div className="flex gap-2 items-center">
                              <input
                                type="text"
                                placeholder="Variant label (e.g. Steel, 20L, 1.2m)"
                                name={`variantLabel_${p.id}_${i}`}
                                value={row.label}
                                onChange={(e) => setVariantRow(p.id, i, "label", e.target.value)}
                                className="flex-1 rounded border border-black/15 px-2 py-1 text-xs"
                              />
                              {rows.length > 2 && (
                                <button
                                  type="button"
                                  onClick={() => removeVariantRow(p.id, i)}
                                  className="shrink-0 text-xs text-red-500 hover:text-red-700"
                                  title="Remove row"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[11px] font-medium text-black/60 mb-1">Promo price (R) *</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  name={`variantPromoPrice_${p.id}_${i}`}
                                  value={row.promoPrice}
                                  onChange={(e) => setVariantRow(p.id, i, "promoPrice", e.target.value)}
                                  className="w-full rounded border border-black/15 px-2 py-1 text-sm font-semibold text-red-700"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-medium text-black/60 mb-1">Was price (R) — optional</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  name={`variantOriginalPrice_${p.id}_${i}`}
                                  value={row.originalPrice}
                                  onChange={(e) => setVariantRow(p.id, i, "originalPrice", e.target.value)}
                                  placeholder="e.g. 999.99"
                                  className="w-full rounded border border-black/15 px-2 py-1 text-sm text-black/60"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addVariantRow(p.id)}
                          className="text-xs text-black/50 hover:text-black underline"
                        >
                          + Add variant
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <p className="col-span-2 text-sm text-(--hub-muted) py-2">No products match your search.</p>
          )}
        </div>
      )}
    </div>
  );
}
