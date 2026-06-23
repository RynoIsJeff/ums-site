"use client";

import { useState } from "react";

type Product = {
  id: string;
  name: string;
  variant?: string | null;
  price: string;
  imageData?: string | null;
};

type Props = {
  products: Product[];
  defaultSelected?: string[];
};

export function ProductSelector({ products, defaultSelected = [] }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set(defaultSelected));

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    setSelected(new Set(products.map((p) => p.id)));
  }

  function clearAll() {
    setSelected(new Set());
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="block text-sm font-medium">Products ({selected.size} selected)</span>
        <div className="flex gap-3">
          <button type="button" onClick={selectAll} className="text-xs text-black/60 hover:text-black underline">
            All
          </button>
          <button type="button" onClick={clearAll} className="text-xs text-black/60 hover:text-black underline">
            None
          </button>
        </div>
      </div>

      {products.length === 0 ? (
        <p className="text-sm text-(--hub-muted) py-2">
          No products in library yet.{" "}
          <a href="/hub/promos/products/new" className="underline">Add a product</a> first.
        </p>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {products.map((p) => {
            const isOn = selected.has(p.id);
            return (
              <label
                key={p.id}
                className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                  isOn ? "border-black bg-black/4" : "border-black/10 hover:border-black/20"
                }`}
              >
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
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  {p.variant && <p className="text-xs text-(--hub-muted) truncate">{p.variant}</p>}
                  <p className="text-xs font-semibold text-red-700 mt-0.5">R {parseFloat(p.price).toFixed(2)}</p>
                </div>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
