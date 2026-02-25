"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { z } from "zod";

const LoginSchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(8).max(128),
});

export async function signIn(formData: FormData, callbackUrl: string) {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email") ?? "",
    password: formData.get("password") ?? "",
  });

  if (!parsed.success) {
    return { error: "Invalid email or password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email.trim().toLowerCase(),
    password: parsed.data.password,
  });

  if (error) {
    return { error: "Login failed. Check your credentials and try again." };
  }

  const nextUrl =
    callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/hub";
  redirect(nextUrl);
}
