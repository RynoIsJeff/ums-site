import { cookies } from "next/headers";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { HubShell } from "./_components/HubShell";

export default async function HubLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { session, user } = await getSession();

  if (!session?.user) {
    redirect("/login?callbackUrl=%2Fhub");
  }

  if (!user) {
    redirect(
      "/login?error=unauthorized&message=No+app+access.+Contact+admin."
    );
  }

  if (user.twoFactorEnabled) {
    const cookieStore = await cookies();
    const verified = cookieStore.get("2fa_verified")?.value;
    if (verified !== user.id) {
      redirect("/login/verify-2fa?callbackUrl=%2Fhub");
    }
  }

  return <HubShell user={user}>{children}</HubShell>;
}
