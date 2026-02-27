"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireHubAuth } from "@/lib/auth";
import { canAccessSettings } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

const UpdateProfileSchema = z.object({
  name: z.string().max(200).optional(),
});

export type ProfileFormState = { error?: string; success?: boolean };

export async function updateProfile(
  _prev: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const { user } = await requireHubAuth();

  const parsed = UpdateProfileSchema.safeParse({
    name: formData.get("name") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const name = parsed.data.name?.trim() || null;
  await prisma.user.update({
    where: { id: user.id },
    data: { name },
  });

  revalidatePath("/hub/settings");
  revalidatePath("/hub");
  return { success: true };
}

// --- Company config ---

const CompanyConfigSchema = z.object({
  companyName: z.string().max(200).optional(),
  supportEmail: z.string().max(200).optional(),
  defaultCurrency: z.string().max(10).optional(),
  defaultVatRate: z.string().transform((s) => (Number(s) >= 0 ? Number(s) : 15)),
  invoicePrefix: z.string().max(20).optional(),
  billingAddress: z.string().max(1000).optional(),
  phone: z.string().max(50).optional(),
});

export type CompanyConfigFormState = { error?: string; success?: boolean };

export async function updateCompanyConfig(
  _prev: CompanyConfigFormState,
  formData: FormData
): Promise<CompanyConfigFormState> {
  const { scope } = await requireHubAuth();
  if (!canAccessSettings(scope)) {
    return { error: "Access denied." };
  }

  const parsed = CompanyConfigSchema.safeParse({
    companyName: formData.get("companyName") ?? "",
    supportEmail: formData.get("supportEmail") ?? "",
    defaultCurrency: formData.get("defaultCurrency") ?? "ZAR",
    defaultVatRate: formData.get("defaultVatRate") ?? "15",
    invoicePrefix: formData.get("invoicePrefix") ?? "",
    billingAddress: formData.get("billingAddress") ?? "",
    phone: formData.get("phone") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const data = parsed.data;
  const config = await prisma.companyConfig.findFirst();

  const payload = {
    companyName: data.companyName?.trim() || null,
    supportEmail: data.supportEmail?.trim() || null,
    defaultCurrency: data.defaultCurrency?.trim() || "ZAR",
    defaultVatRate: String(data.defaultVatRate),
    invoicePrefix: data.invoicePrefix?.trim() || null,
    billingAddress: data.billingAddress?.trim() || null,
    phone: data.phone?.trim() || null,
  };

  if (config) {
    await prisma.companyConfig.update({
      where: { id: config.id },
      data: payload,
    });
  } else {
    await prisma.companyConfig.create({
      data: payload,
    });
  }

  revalidatePath("/hub/settings");
  return { success: true };
}

// --- Staff assignment ---

export async function updateStaffAssignments(
  staffId: string,
  clientIds: string[]
): Promise<{ error?: string }> {
  const { scope } = await requireHubAuth();
  if (!canAccessSettings(scope)) {
    return { error: "Access denied." };
  }

  const staff = await prisma.user.findUnique({
    where: { id: staffId },
    select: { role: true },
  });
  if (!staff || staff.role !== "STAFF") {
    return { error: "Invalid staff user." };
  }

  await prisma.$transaction([
    prisma.staffClientAssignment.deleteMany({ where: { staffId } }),
    ...(clientIds.length > 0
      ? [
          prisma.staffClientAssignment.createMany({
            data: clientIds.map((clientId) => ({ staffId, clientId })),
          }),
        ]
      : []),
  ]);

  revalidatePath("/hub/settings");
  revalidatePath("/hub");
  return {};
}

// --- 2FA ---

export async function enableTwoFactor(
  _prev: { error?: string; secret?: string; qrUri?: string },
  formData: FormData
): Promise<{ error?: string; secret?: string; qrUri?: string }> {
  const { user } = await requireHubAuth();
  const { generateTotpSecret, generateTotpUri } = await import("@/lib/two-factor");
  const secret = generateTotpSecret();
  const qrUri = generateTotpUri(secret, user.email);
  return { secret, qrUri };
}

export async function confirmTwoFactor(
  secret: string,
  token: string
): Promise<{ error?: string }> {
  const { user } = await requireHubAuth();
  const { verifyTotpToken, generateRecoveryCodes } = await import("@/lib/two-factor");
  if (!(await verifyTotpToken(secret, token))) return { error: "Invalid code." };
  const codes = generateRecoveryCodes();
  await prisma.user.update({
    where: { id: user.id },
    data: {
      twoFactorEnabled: true,
      twoFactorSecretEncrypted: secret,
      twoFactorRecoveryCodesEncrypted: JSON.stringify(codes),
    },
  });
  revalidatePath("/hub/settings");
  return {};
}

export async function disableTwoFactor(): Promise<{ error?: string }> {
  const { user } = await requireHubAuth();
  await prisma.user.update({
    where: { id: user.id },
    data: {
      twoFactorEnabled: false,
      twoFactorSecretEncrypted: null,
      twoFactorRecoveryCodesEncrypted: null,
    },
  });
  revalidatePath("/hub/settings");
  return {};
}
