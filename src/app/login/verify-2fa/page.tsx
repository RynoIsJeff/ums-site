import Image from "next/image";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Verify2FAForm } from "./Verify2FAForm";

type PageProps = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

export default async function Verify2FAPage({ searchParams }: PageProps) {
  const { callbackUrl = "/hub" } = await searchParams;
  const { session, user } = await getSession();

  if (!session?.user) {
    redirect("/login?callbackUrl=" + encodeURIComponent(callbackUrl));
  }

  if (!user) {
    redirect("/login?error=unauthorized");
  }

  if (!user.twoFactorEnabled) {
    redirect(callbackUrl);
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--hub-content-bg)" }}>
      <div className="w-full max-w-sm px-6">
        <div className="mb-8 text-center">
          <Link href="/hub" className="inline-flex gap-2.5 mb-5">
            <Image src="/ums-logo.svg" alt="UMS" width={28} height={28} className="h-7 w-7" />
          </Link>
          <h1 className="text-xl font-bold tracking-tight">Two-factor authentication</h1>
          <p className="mt-1.5 text-sm text-black/50">Enter the code from your authenticator app</p>
        </div>
        <Verify2FAForm callbackUrl={callbackUrl} />
      </div>
    </div>
  );
}
