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
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--hub-content-bg)" }}>
      <div className="w-full max-w-sm px-6">
        <div className="mb-8 text-center">
          <Link href="/hub" className="inline-flex items-center gap-2.5 mb-5">
            <span
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-white shadow-sm border border-black/5 overflow-hidden"
            >
              <img src="/ums-logo.svg" alt="UMS" className="h-7 w-7 object-contain" />
            </span>
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-black/90">
            Sign in to UMS Hub
          </h1>
          <p className="mt-1.5 text-sm text-black/50">
            Internal workspace for authorized staff
          </p>
        </div>

        <LoginForm callbackUrl={nextUrl} />

        <p className="mt-8 text-center text-xs text-black/35">
          <Link href="/" className="hover:text-black/55 transition-colors">
            &larr; Back to ultimatemarketingsmash.com
          </Link>
        </p>
      </div>
    </div>
  );
}
