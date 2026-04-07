"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function LoginError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Login Error]", error);
  }, [error]);

  return (
    <div
      className="flex min-h-screen items-center justify-center px-6"
      style={{ background: "var(--hub-content-bg)" }}
    >
      <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-black/90">Something went wrong</h2>
        <p className="mt-2 text-sm text-black/60">
          Sign-in could not finish loading. This is usually a server configuration issue, not your
          password.
        </p>
        <details className="mt-5 text-left text-xs text-black/55">
          <summary className="cursor-pointer font-medium text-black/70">
            Check DATABASE_URL (hosting)
          </summary>
          <p className="mt-2 leading-relaxed">
            Prisma needs{" "}
            <code className="rounded bg-black/5 px-1 py-0.5 text-[10px]">DATABASE_URL</code> in
            Vercel (or your host) to be a <strong>full Postgres URI</strong> that starts with{" "}
            <code className="rounded bg-black/5 px-1 text-[10px]">postgresql://</code> or{" "}
            <code className="rounded bg-black/5 px-1 text-[10px]">postgres://</code>. It cannot be
            empty, a host-only string, or wrapped in quote characters. Copy the connection string
            from Supabase → Database → use Transaction pooler (port 6543) for Vercel, and paste the
            entire value. See <code className="text-[10px]">README.md</code> and{" "}
            <code className="text-[10px]">.env.example</code>.
          </p>
        </details>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button type="button" onClick={reset} className="btn-primary">
            Try again
          </button>
          <Link href="/" className="btn-outline">
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
