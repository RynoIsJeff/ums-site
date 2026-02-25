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

  return <HubShell user={user}>{children}</HubShell>;
}
