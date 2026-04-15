"use client";

import { PendingSubmitButton } from "@/app/hub/_components/PendingSubmitButton";
import { sendProposalFormAction } from "../actions";

type SendProposalButtonProps = {
  proposalId: string;
};

export function SendProposalButton({ proposalId }: SendProposalButtonProps) {
  return (
    <form action={sendProposalFormAction}>
      <input type="hidden" name="proposalId" value={proposalId} />
      <PendingSubmitButton className="rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700">
        Send to client
      </PendingSubmitButton>
    </form>
  );
}
