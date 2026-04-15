"use client";

import { PendingSubmitButton } from "@/app/hub/_components/PendingSubmitButton";
import { signOut } from "./actions";

export function LogoutForm() {
  return (
    <form action={signOut} className="mt-6">
      <PendingSubmitButton
        className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white"
        style={{ background: "linear-gradient(90deg, var(--primary), var(--accent))" }}
      >
        Sign out
      </PendingSubmitButton>
    </form>
  );
}
