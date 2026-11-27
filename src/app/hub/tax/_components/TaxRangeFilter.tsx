"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Preset = { label: string; from: string; to: string };

const yr = new Date().getFullYear();

const PRESETS: Preset[] = [
  { label: `SA Tax ${yr}/${String(yr + 1).slice(2)}`, from: `${yr}-03-01`, to: `${yr + 1}-02-28` },
  { label: `SA Tax ${yr - 1}/${String(yr).slice(2)}`, from: `${yr - 1}-03-01`, to: `${yr}-02-28` },
  { label: `SA Tax ${yr - 2}/${String(yr - 1).slice(2)}`, from: `${yr - 2}-03-01`, to: `${yr - 1}-02-28` },
  { label: `CIPC ${yr - 1}/${yr}`, from: `${yr - 1}-06-01`, to: `${yr}-05-31` },
  { label: `CIPC ${yr - 2}/${yr - 1}`, from: `${yr - 2}-06-01`, to: `${yr - 1}-05-31` },
  { label: `Calendar ${yr}`, from: `${yr}-01-01`, to: `${yr}-12-31` },
  { label: `Calendar ${yr - 1}`, from: `${yr - 1}-01-01`, to: `${yr - 1}-12-31` },
];

export function TaxRangeFilter({ currentFrom, currentTo }: { currentFrom: string; currentTo: string }) {
  const router = useRouter();
  const [from, setFrom] = useState(currentFrom);
  const [to, setTo] = useState(currentTo);

  function apply(f: string, t: string) {
    router.push(`/hub/tax?from=${f}&to=${t}`);
  }

  return (
    <div className="rounded-xl border border-(--hub-border-light) bg-white p-5 shadow-sm space-y-4">
      <div>
        <p className="text-sm font-semibold text-(--hub-text)">Period presets</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {PRESETS.map((p) => {
            const active = p.from === currentFrom && p.to === currentTo;
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => { setFrom(p.from); setTo(p.to); apply(p.from, p.to); }}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? "bg-(--primary) text-white"
                    : "border border-(--hub-border-light) text-(--hub-text) hover:bg-black/5"
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-(--hub-muted)">From</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-md border border-(--hub-border-light) px-3 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-(--hub-muted)">To</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-md border border-(--hub-border-light) px-3 py-1.5 text-sm"
          />
        </div>
        <button
          type="button"
          onClick={() => apply(from, to)}
          className="rounded-md bg-(--primary) px-4 py-1.5 text-sm font-medium text-white hover:opacity-90"
        >
          Apply
        </button>
      </div>
    </div>
  );
}
