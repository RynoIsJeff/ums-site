import { signOut } from "./actions";

export const metadata = {
  title: "Logout | UMS Hub",
};

export default function LogoutPage() {
  return (
    <section className="container max-w-md py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Sign out</h1>
      <p className="mt-2 text-sm text-black/70">
        Confirm below to end your UMS Hub session.
      </p>
      <form action={signOut} className="mt-6">
        <button
          type="submit"
          className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white"
        >
          Sign out
        </button>
      </form>
    </section>
  );
}
