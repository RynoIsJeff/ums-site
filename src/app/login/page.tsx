import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
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
      <h1 className="text-2xl font-semibold tracking-tight">UMS Hub Login</h1>
      <p className="mt-2 text-sm text-black/70">
        Internal access only. Authorized UMS staff may sign in below.
      </p>
      <div className="mt-6">
        <LoginForm callbackUrl={nextUrl} />
      </div>
    </section>
  );
}
