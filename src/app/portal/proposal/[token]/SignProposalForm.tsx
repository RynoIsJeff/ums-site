"use client";

import { PendingSubmitButton } from "@/app/hub/_components/PendingSubmitButton";
import { signProposalFormAction } from "./actions";

type SignProposalFormProps = {
  token: string;
};

export function SignProposalForm({ token }: SignProposalFormProps) {
  return (
    <form action={signProposalFormAction} className="border-t border-slate-200 pt-6">
      <input type="hidden" name="token" value={token} />
      <p className="mb-4 text-sm text-slate-600">
        By clicking below, you agree to the terms of this proposal.
      </p>
      <PendingSubmitButton className="w-full rounded-lg bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-700">
        Sign proposal
      </PendingSubmitButton>
    </form>
  );
}
