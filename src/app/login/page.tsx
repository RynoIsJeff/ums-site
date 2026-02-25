import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import LoginForm from "./LoginForm";

export const metadata = {
  title: "Login | UMS Hub",
};

type LoginPageProps = {
  searchParams: Promise<{
    callbackUrl?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { callbackUrl } = await searchParams;
  const { session } = await getSession();
  const nextUrl =
    callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/hub";

  if (session?.user) {
    redirect("/hub");
  }

  return (
    <section className="container max-w-md py-16">
      <div className="mb-6">
        <Link href="/hub" className="flex items-center gap-2.5 mb-6">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm text-white" style={{ background: "linear-gradient(135deg, var(--primary), var(--accent))" }}>
            H
          </span>
          <span className="text-sm font-bold tracking-wide">
            UMS <span style={{ color: "var(--accent)" }}>Hub</span>
          </span>
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Sign in to Hub</h1>
        <p className="mt-2 text-sm text-black/60">
          Internal workspace for UMS staff. Authorized personnel only.
        </p>
      </div>
      <LoginForm callbackUrl={nextUrl} />
      <p className="mt-6 text-center text-xs text-black/40">
        <Link href="/" className="hover:text-black/60 transition-colors">
          &larr; Back to marketing site
        </Link>
      </p>
    </section>
  );
}
