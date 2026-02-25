import Link from "next/link";
import { signOut } from "./actions";

export const metadata = {
  title: "Logout | UMS Hub",
};

export default function LogoutPage() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--hub-content-bg)" }}>
      <div className="w-full max-w-sm px-6 text-center">
        <Link href="/hub" className="inline-flex items-center gap-2.5 mb-6">
          <span
            className="flex items-center justify-center w-10 h-10 rounded-xl font-bold text-base text-white"
            style={{ background: "linear-gradient(135deg, var(--primary), var(--accent))" }}
          >
            H
          </span>
        </Link>
        <h1 className="text-xl font-bold tracking-tight text-black/90">Sign out</h1>
        <p className="mt-1.5 text-sm text-black/50">
          End your UMS Hub session
        </p>
        <form action={signOut} className="mt-6">
          <button
            type="submit"
            className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white"
            style={{ background: "linear-gradient(90deg, var(--primary), var(--accent))" }}
          >
            Sign out
          </button>
        </form>
        <p className="mt-6 text-xs text-black/35">
          <Link href="/hub" className="hover:text-black/55 transition-colors">
            &larr; Back to Hub
          </Link>
        </p>
      </div>
    </div>
  );
}
