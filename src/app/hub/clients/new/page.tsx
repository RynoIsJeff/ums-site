import Link from "next/link";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ClientForm } from "../_components/ClientForm";
import { createClient } from "../actions";

export const metadata = {
  title: "New Client | UMS Hub",
};

export default async function NewClientPage() {
  const { user } = await getSession();
  if (!user) redirect("/login");

  return (
    <section className="py-10">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/hub/clients"
          className="text-sm text-black/60 hover:text-black"
        >
          ← Clients
        </Link>
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">New client</h1>
      <p className="mt-1 text-sm text-black/70">
        Add a new client. Required fields are marked with *.
      </p>
      <div className="mt-6 rounded-xl border border-black/10 bg-white p-6">
        <ClientForm
          action={createClient}
          submitLabel="Create client"
          backHref="/hub/clients"
        />
      </div>
    </section>
  );
}
