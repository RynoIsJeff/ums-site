"use client";

import { useState } from "react";
import { verify2FA } from "./actions";

type Props = { callbackUrl: string };

export function Verify2FAForm({ callbackUrl }: Props) {
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      action={async (formData) => {
        setError(null);
        const result = await verify2FA(formData, callbackUrl);
        if (result?.error) setError(result.error);
      }}
      className="space-y-4 rounded-2xl border border-black/10 bg-white p-6 shadow-sm"
    >
      <div>
        <label htmlFor="token" className="mb-1 block text-sm font-medium">
          Verification code
        </label>
        <input
          id="token"
          name="token"
          type="text"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          required
          placeholder="000000"
          className="w-full rounded-md border border-black/15 px-3 py-2 text-center text-lg font-mono tracking-widest"
        />
      </div>
      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
      <button
        type="submit"
        className="inline-flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold text-white"
        style={{ background: "linear-gradient(90deg, var(--primary), var(--accent))" }}
      >
        Verify
      </button>
      <p className="text-center text-xs text-black/50">
        Use a recovery code if you don&apos;t have access to your authenticator app.
      </p>
    </form>
  );
}
