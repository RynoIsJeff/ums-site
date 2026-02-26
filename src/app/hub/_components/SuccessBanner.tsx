"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";

type SuccessBannerProps = {
  /** Search param key to watch (e.g. "success") */
  paramKey?: string;
  /** Message to show when param matches */
  message?: string;
  /** Param value that triggers the message (default "1") */
  paramValue?: string;
  /** Auto-dismiss after ms (default 4000) */
  autoDismiss?: number;
};

export function SuccessBanner({
  paramKey = "success",
  message = "Changes saved successfully.",
  paramValue = "1",
  autoDismiss = 4000,
}: SuccessBannerProps) {
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const val = searchParams.get(paramKey);
    if (val === paramValue) {
      setVisible(true);
      if (autoDismiss > 0) {
        const t = setTimeout(() => setVisible(false), autoDismiss);
        return () => clearTimeout(t);
      }
    } else {
      setVisible(false);
    }
  }, [searchParams, paramKey, paramValue, autoDismiss]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-green-800"
    >
      <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
      <span>{message}</span>
    </div>
  );
}
