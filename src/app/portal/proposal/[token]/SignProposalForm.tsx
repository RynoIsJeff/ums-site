"use client";

import { useFormStatus } from "react-dom";
import { signProposalFormAction } from "./actions";

type SignProposalFormProps = {
  token: string;
};

export function SignProposalForm({ token }: SignProposalFormProps) {
  return (
    <form action={signProposalFormAction} className="border-t border-slate-200 pt-6">
      <input type="hidden" name="token" value={token} />
      <p className="text-sm text-slate-600 mb-4">
        By clicking below, you agree to the terms of this proposal.
      </p>
      <button
        type="submit"
        className="w-full rounded-lg bg-green-600 px-4 py-3 text-white font-semibold hover:bg-green-700"
      >
        <SignButtonLabel />
      </button>
    </form>
  );
}

function SignButtonLabel() {
  const { pending } = useFormStatus();
  return pending ? "Processing…" : "Sign proposal";
}
