import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { HubNav } from "./_components/HubNav";
import Link from "next/link";

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

  return (
    <div className="min-h-screen bg-black/2">
      <header className="sticky top-0 z-10 border-b border-black/10 bg-white/95 backdrop-blur print:hidden">
        <div className="container max-w-6xl flex h-14 items-center justify-between gap-4 px-4">
          <HubNav user={user} />
          <div className="flex items-center gap-3">
            <span className="text-xs text-black/60">
              {user.email} ({user.role}
              {user.role === "STAFF" && user.assignedClientIds?.length !== undefined && (
                <>, {user.assignedClientIds.length} client(s)</>
              )}
              )
            </span>
            <Link
              href="/logout"
              className="rounded-md border border-black/15 px-3 py-1.5 text-sm hover:bg-black/5"
            >
              Logout
            </Link>
          </div>
        </div>
      </header>
      <div className="container max-w-6xl px-4">{children}</div>
    </div>
  );
}
