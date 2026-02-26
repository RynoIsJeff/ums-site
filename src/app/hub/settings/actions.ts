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
