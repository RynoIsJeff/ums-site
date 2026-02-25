"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireHubAuth } from "@/lib/auth";
import { canAccessClient } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import type { ClientStatus, BillingFrequency } from "@prisma/client";

const clientStatusValues = ["LEAD", "ACTIVE", "PAUSED", "CHURNED"] as const;
const billingFrequencyValues = ["MONTHLY", "QUARTERLY", "ANNUAL", "CUSTOM"] as const;

const ClientSchema = z.object({
  companyName: z.string().min(1, "Company name is required").max(200),
  contactPerson: z.string().min(1, "Contact person is required").max(200),
  email: z.string().email().max(200).optional().or(z.literal("")),
  phone: z.string().max(50).optional(),
  vatNumber: z.string().max(50).optional(),
  billingAddress: z.string().max(500).optional(),
  planLabel: z.string().max(100).optional(),
  startDate: z.string().optional(),
  renewalDate: z.string().optional(),
  billingFrequency: z.enum(billingFrequencyValues).optional(),
  retainerAmount: z.string().optional(),
  notes: z.string().max(5000).optional(),
  status: z.enum(clientStatusValues).optional(),
});

function parseOptionalDate(s: string | undefined): Date | undefined {
  if (!s?.trim()) return undefined;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function parseOptionalDecimal(s: string | undefined): string | undefined {
  if (s === undefined || s === null || String(s).trim() === "") return undefined;
  const n = Number(String(s).replace(/,/g, ""));
  return Number.isNaN(n) ? undefined : String(n);
}

export type ClientFormState = { error?: string };

export async function createClient(
  _prev: ClientFormState,
  formData: FormData
): Promise<ClientFormState> {
  const { scope } = await requireHubAuth();

  const raw = Object.fromEntries(formData.entries());
  const parsed = ClientSchema.safeParse({
    ...raw,
    email: raw.email || undefined,
    startDate: raw.startDate || undefined,
    renewalDate: raw.renewalDate || undefined,
    retainerAmount: raw.retainerAmount || undefined,
  });

  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Invalid input";
    return { error: msg };
  }

  const data = parsed.data;
  const startDate = parseOptionalDate(data.startDate);
  const renewalDate = parseOptionalDate(data.renewalDate);
  const retainerAmount = parseOptionalDecimal(data.retainerAmount);

  await prisma.client.create({
    data: {
      companyName: data.companyName.trim(),
      contactPerson: data.contactPerson.trim(),
      email: data.email?.trim() || null,
      phone: data.phone?.trim() || null,
      vatNumber: data.vatNumber?.trim() || null,
      billingAddress: data.billingAddress?.trim() || null,
      planLabel: data.planLabel?.trim() || null,
      startDate: startDate ?? null,
      renewalDate: renewalDate ?? null,
      billingFrequency: (data.billingFrequency as BillingFrequency) ?? null,
      retainerAmount: retainerAmount != null ? retainerAmount : null,
      notes: data.notes?.trim() || null,
      status: (data.status as ClientStatus) ?? "LEAD",
    },
  });

  revalidatePath("/hub/clients");
  revalidatePath("/hub");
  redirect("/hub/clients");
}

export async function updateClient(
  clientId: string,
  _prev: ClientFormState,
  formData: FormData
): Promise<ClientFormState> {
  const { scope } = await requireHubAuth();
  if (!canAccessClient(scope, clientId)) {
    return { error: "You do not have access to this client." };
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = ClientSchema.safeParse({
    ...raw,
    email: raw.email || undefined,
    startDate: raw.startDate || undefined,
    renewalDate: raw.renewalDate || undefined,
    retainerAmount: raw.retainerAmount || undefined,
  });

  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Invalid input";
    return { error: msg };
  }

  const data = parsed.data;
  const startDate = parseOptionalDate(data.startDate);
  const renewalDate = parseOptionalDate(data.renewalDate);
  const retainerAmount = parseOptionalDecimal(data.retainerAmount);

  await prisma.client.update({
    where: { id: clientId },
    data: {
      companyName: data.companyName.trim(),
      contactPerson: data.contactPerson.trim(),
      email: data.email?.trim() || null,
      phone: data.phone?.trim() || null,
      vatNumber: data.vatNumber?.trim() || null,
      billingAddress: data.billingAddress?.trim() || null,
      planLabel: data.planLabel?.trim() || null,
      startDate: startDate ?? null,
      renewalDate: renewalDate ?? null,
      billingFrequency: (data.billingFrequency as BillingFrequency) ?? null,
      retainerAmount: retainerAmount != null ? retainerAmount : null,
      notes: data.notes?.trim() || null,
      status: (data.status as ClientStatus) ?? "LEAD",
    },
  });

  revalidatePath("/hub/clients");
  revalidatePath(`/hub/clients/${clientId}`);
  revalidatePath("/hub");
  redirect(`/hub/clients/${clientId}`);
}

export async function deleteClient(clientId: string): Promise<{ error?: string }> {
  const { scope } = await requireHubAuth();
  if (!canAccessClient(scope, clientId)) {
    return { error: "You do not have access to this client." };
  }

  await prisma.client.delete({ where: { id: clientId } });

  revalidatePath("/hub/clients");
  revalidatePath("/hub");
  redirect("/hub/clients");
}
