"use server";

import { prisma } from "@/lib/prisma";

export async function signProposal(token: string): Promise<{ error?: string }> {
  const proposal = await prisma.proposal.findUnique({
    where: { portalToken: token },
    select: { id: true, status: true },
  });

  if (!proposal) {
    return { error: "Proposal not found." };
  }

  if (proposal.status !== "SENT") {
    return { error: "This proposal can no longer be signed." };
  }

  await prisma.proposal.update({
    where: { id: proposal.id },
    data: { status: "SIGNED", signedAt: new Date() },
  });

  return {};
}

/** Form action for Sign button. Pass token as hidden input. */
export async function signProposalFormAction(formData: FormData) {
  const token = formData.get("token");
  if (typeof token !== "string") return;
  await signProposal(token);
}
