"use client";

import { useFormStatus } from "react-dom";
import { sendProposalFormAction } from "../actions";

type SendProposalButtonProps = {
  proposalId: string;
};

export function SendProposalButton({ proposalId }: SendProposalButtonProps) {
  return (
    <form action={sendProposalFormAction}>
      <input type="hidden" name="proposalId" value={proposalId} />
      <button
        type="submit"
        className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
      >
        <SendButtonLabel />
      </button>
    </form>
  );
}

function SendButtonLabel() {
  const { pending } = useFormStatus();
  return pending ? "Sending…" : "Send to client";
}
