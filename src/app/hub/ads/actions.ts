"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireHubAuth } from "@/lib/auth";
import { canAccessClient } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

const ConnectAdAccountSchema = z.object({
  clientId: z.string().min(1),
  accountId: z
    .string()
    .min(1, "Ad account ID is required")
    .regex(/^act_\d+$/, "Format: act_ followed by numbers (e.g. act_123456789)"),
  accountName: z.string().optional(),
  accessToken: z.string().optional(),
});

export type AdsFormState = { error?: string };

export async function connectAdAccount(
  _prev: AdsFormState,
  formData: FormData
): Promise<AdsFormState> {
  const { scope } = await requireHubAuth();

  const raw = {
    clientId: formData.get("clientId"),
    accountId: (formData.get("accountId") as string)?.trim().toLowerCase(),
    accountName: (formData.get("accountName") as string)?.trim() || undefined,
    accessToken: (formData.get("accessToken") as string)?.trim() || undefined,
  };

  const parsed = ConnectAdAccountSchema.safeParse(raw);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Invalid input";
    return { error: msg };
  }

  const { clientId, accountId, accountName, accessToken } = parsed.data;

  if (!canAccessClient(scope, clientId)) {
    return { error: "Access denied to this client." };
  }

  const existing = await prisma.adAccount.findUnique({
    where: { accountId },
  });
  if (existing && existing.clientId !== clientId) {
    return { error: "This ad account is already connected to another client." };
  }

  await prisma.adAccount.upsert({
    where: { accountId },
    create: {
      clientId,
      accountId,
      accountName,
      accessTokenEncrypted: accessToken,
    },
    update: {
      accountName,
      accessTokenEncrypted: accessToken ?? undefined,
    },
  });

  revalidatePath("/hub/ads");
  revalidatePath("/hub/ads/accounts");
  redirect("/hub/ads");
}
