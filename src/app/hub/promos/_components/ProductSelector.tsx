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

type Props = {
  products: Product[];
  defaultSelected?: string[];
  defaultPriceOverrides?: Record<string, string>;   // productId → promo price override
  defaultOriginalPrices?: Record<string, string>;   // productId → original (was) price
};

export function ProductSelector({
  products,
  defaultSelected = [],
  defaultPriceOverrides = {},
  defaultOriginalPrices = {},
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
          {filtered.map((p) => {
            const isOn = selected.has(p.id);
            const ps = prices[p.id] ?? { promo: p.price, original: "" };
            return (
              <div
                key={p.id}
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

                {/* Price overrides — only shown when checked */}
                {isOn && (
                  <div className="border-t border-black/8 px-3 pb-3 pt-2 grid grid-cols-2 gap-2">
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
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
