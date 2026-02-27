"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyTotpToken } from "@/lib/two-factor";

const TWO_FA_COOKIE = "2fa_verified";
const TWO_FA_MAX_AGE = 60 * 60 * 24; // 24 hours

export async function verify2FA(formData: FormData, callbackUrl: string) {
  const { user } = await getSession();
  if (!user) return { error: "Not authenticated" };
  if (!user.twoFactorEnabled) {
    redirect(callbackUrl);
  }

  const token = (formData.get("token") as string)?.trim().replace(/\s/g, "");
  if (!token) return { error: "Code is required" };

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { twoFactorSecretEncrypted: true, twoFactorRecoveryCodesEncrypted: true },
  });
  if (!dbUser?.twoFactorSecretEncrypted) return { error: "2FA not configured" };

  let valid = false;
  if (token.length === 6 && /^\d+$/.test(token)) {
    valid = await verifyTotpToken(dbUser.twoFactorSecretEncrypted, token);
  } else if (dbUser.twoFactorRecoveryCodesEncrypted) {
    const codes = JSON.parse(dbUser.twoFactorRecoveryCodesEncrypted) as string[];
    const idx = codes.indexOf(token);
    if (idx >= 0) {
      valid = true;
      codes.splice(idx, 1);
      await prisma.user.update({
        where: { id: user.id },
        data: { twoFactorRecoveryCodesEncrypted: JSON.stringify(codes) },
      });
    }
  }

  if (!valid) return { error: "Invalid code" };

  const cookieStore = await cookies();
  cookieStore.set(TWO_FA_COOKIE, user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TWO_FA_MAX_AGE,
  });

  redirect(callbackUrl);
}
