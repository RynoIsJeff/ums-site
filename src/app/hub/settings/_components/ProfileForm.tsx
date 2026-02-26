"use client";

import { useActionState } from "react";
import type { ProfileFormState } from "../actions";

type ProfileFormProps = {
  action: (prev: ProfileFormState, formData: FormData) => Promise<ProfileFormState>;
  defaultName: string | null;
};

export function ProfileForm({ action, defaultName }: ProfileFormProps) {
  const [state, formAction] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          Profile updated.
        </div>
      )}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-[var(--hub-text)]">
          Display name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          defaultValue={defaultName ?? ""}
          placeholder="Your name"
          className="mt-1 w-full max-w-sm rounded-lg border border-[var(--hub-border-light)] px-3 py-2.5 text-sm focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
        />
      </div>
      <button
        type="submit"
        className="rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
      >
        Save changes
      </button>
    </form>
  );
}
