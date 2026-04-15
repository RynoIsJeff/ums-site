"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import type { ComponentProps } from "react";

type Props = Omit<ComponentProps<"button">, "type"> & {
  children: React.ReactNode;
};

/** Use inside a &lt;form&gt; — disables the control and shows a spinner while the server action runs. */
export function PendingSubmitButton({ children, className = "", disabled, ...rest }: Props) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={Boolean(disabled) || pending}
      className={["hub-hit-target", className].filter(Boolean).join(" ")}
      aria-busy={pending}
      {...rest}
    >
      {pending ? (
        <span className="inline-flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
