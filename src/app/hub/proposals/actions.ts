"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireHubAuth } from "@/lib/auth";
import { canAccessClient } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

const ProposalSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  title: z.string().min(1, "Title is required").max(500),
  content: z.string().min(1, "Content is required").max(50000),
});

export type ProposalFormState = { error?: string; portalUrl?: string };

export async function createProposal(
  _prev: ProposalFormState,
  formData: FormData
): Promise<ProposalFormState> {
  const { scope } = await requireHubAuth();

  const raw = {
    clientId: (formData.get("clientId") as string)?.trim(),
    title: (formData.get("title") as string)?.trim(),
    content: (formData.get("content") as string)?.trim(),
  };

  const parsed = ProposalSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { clientId, title, content } = parsed.data;

  if (!canAccessClient(scope, clientId)) {
    return { error: "Access denied to this client." };
  }

  const proposal = await prisma.proposal.create({
    data: { clientId, title, content, status: "DRAFT" },
  });

  revalidatePath("/hub/proposals");
  revalidatePath("/hub/clients/[id]");
  redirect(`/hub/proposals/${proposal.id}`);
}

export async function updateProposal(
  proposalId: string,
  _prev: ProposalFormState,
  formData: FormData
): Promise<ProposalFormState> {
  const { scope } = await requireHubAuth();

  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId },
    select: { clientId: true, status: true },
  });
  if (!proposal || !canAccessClient(scope, proposal.clientId)) {
    return { error: "Proposal not found or access denied." };
  }
  if (proposal.status !== "DRAFT") {
    return { error: "Only draft proposals can be edited." };
  }

  const raw = {
    clientId: (formData.get("clientId") as string)?.trim(),
    title: (formData.get("title") as string)?.trim(),
    content: (formData.get("content") as string)?.trim(),
  };

  const parsed = ProposalSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { clientId, title, content } = parsed.data;

  if (!canAccessClient(scope, clientId)) {
    return { error: "Access denied to this client." };
  }

  await prisma.proposal.update({
    where: { id: proposalId },
    data: { clientId, title, content },
  });

  revalidatePath("/hub/proposals");
  revalidatePath(`/hub/proposals/${proposalId}`);
  revalidatePath("/hub/clients/[id]");
  redirect(`/hub/proposals/${proposalId}`);
}

export async function sendProposal(proposalId: string): Promise<ProposalFormState> {
  const { scope } = await requireHubAuth();

  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId },
    select: { clientId: true, status: true },
  });
  if (!proposal || !canAccessClient(scope, proposal.clientId)) {
    return { error: "Proposal not found or access denied." };
  }
  if (proposal.status !== "DRAFT") {
    return { error: "Only draft proposals can be sent." };
  }

  const crypto = await import("crypto");
  const portalToken = crypto.randomBytes(24).toString("base64url");

  await prisma.proposal.update({
    where: { id: proposalId },
    data: {
      status: "SENT",
      portalToken,
      sentAt: new Date(),
    },
  });

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? "https://" + process.env.VERCEL_URL : null) ||
    "http://localhost:3000";
  const portalUrl = baseUrl + "/portal/proposal/" + portalToken;

  revalidatePath("/hub/proposals");
  revalidatePath("/hub/proposals/" + proposalId);
  redirect(`/hub/proposals/${proposalId}?portalUrl=${encodeURIComponent(portalUrl)}`);
}

/** Form action for Send button. Pass proposalId as hidden input. */
export async function sendProposalFormAction(formData: FormData) {
  const proposalId = formData.get("proposalId");
  if (typeof proposalId !== "string") return;
  await sendProposal(proposalId);
}
