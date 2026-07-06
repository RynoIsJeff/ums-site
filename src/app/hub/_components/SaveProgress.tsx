"use client";

import { useFormStatus } from "react-dom";

export function SaveProgress({ label = "Saving, please wait…" }: { label?: string }) {
  const { pending } = useFormStatus();
  if (!pending) return null;
  return (
    <>
      <style>{`
        @keyframes save-slide {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(350%); }
        }
        .save-progress-bar { animation: save-slide 1.2s ease-in-out infinite; }
      `}</style>
      <div className="mt-1 space-y-1.5">
        <div className="h-1.5 w-full rounded-full overflow-hidden bg-black/8">
          <div className="save-progress-bar h-full w-2/5 rounded-full bg-black/50" />
        </div>
        <p className="text-xs text-(--hub-muted)">{label}</p>
      </div>
    </>
  );
}
