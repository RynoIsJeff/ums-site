"use client";

import { useRef, useState } from "react";
import { BuildItCard } from "./BuildItCard";
import { Download } from "lucide-react";

type CardProps = React.ComponentProps<typeof BuildItCard>;

type Props = CardProps & { filename?: string };

export function PromoCardExport({ filename, ...cardProps }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    if (!ref.current) return;
    setExporting(true);
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(ref.current, { pixelRatio: 2, cacheBust: true });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = filename ?? "promo-card.png";
      a.click();
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <div ref={ref} style={{ display: "inline-block" }}>
        <BuildItCard {...cardProps} />
      </div>
      <button
        type="button"
        onClick={handleExport}
        disabled={exporting}
        className="inline-flex items-center gap-1.5 rounded-md bg-black px-3 py-1.5 text-xs font-medium text-white hover:bg-black/80 disabled:opacity-50"
      >
        <Download className="h-3.5 w-3.5" />
        {exporting ? "Exporting…" : "Export PNG"}
      </button>
    </div>
  );
}
