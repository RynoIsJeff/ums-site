"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function HubError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Hub Error]", error);
  }, [error]);

  return (
    <div className="hub-content__inner flex min-h-[200px] items-center justify-center">
      <div className="card flex max-w-md flex-col items-center gap-4 p-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-(--ink)">
            Something went wrong
          </h2>
          <p className="mt-1 text-sm text-(--ink)/70">
            An error occurred. Please try again or return to the hub.
          </p>
          <details className="mt-4 max-w-md text-left text-xs text-(--ink)/55">
            <summary className="cursor-pointer text-(--ink)/65 hover:text-(--ink)">
              Error details (admin debug)
            </summary>
            <pre className="mt-2 whitespace-pre-wrap break-all rounded bg-black/5 p-2 font-mono text-[10px]">
              {error?.message ?? "(no message)"}
              {"\n"}digest: {error?.digest ?? "(none)"}
            </pre>
            <p className="mt-2 leading-relaxed">
              Hosting hint: repeated crashes are often{" "}
              <strong>Supabase Session pooler</strong> limits (error{" "}
              <code className="rounded bg-black/5 px-1 py-0.5">MaxClientsInSessionMode</code>
              ). Set <code className="rounded bg-black/5 px-1 py-0.5">DATABASE_URL</code>{" "}
              to Transaction pooler port <strong>6543</strong> with{" "}
              <code className="rounded bg-black/5 px-1 py-0.5">?pgbouncer=true&amp;connection_limit=1</code>.
            </p>
          </details>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={reset}
            className="btn-primary"
          >
            Try again
          </button>
          <Link href="/hub" className="btn-outline">
            Back to Hub
          </Link>
        </div>
      </div>
    </div>
  );
}
