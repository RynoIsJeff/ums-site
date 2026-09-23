import Link from "next/link";
import { getSession, toAuthScope } from "@/lib/auth";
import { clientIdWhere, clientWhere } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { createStore } from "../../actions";
import { StoreForm } from "../_components/StoreForm";

export const metadata = { title: "Add Store | UMS Hub" };

export default async function NewStorePage() {
  const { user } = await getSession();
  if (!user) return null;

  const scope = toAuthScope(user);
  const clients = await prisma.client.findMany({
    where: clientWhere(scope),
    orderBy: { companyName: "asc" },
    select: { id: true, companyName: true },
  });
  const socialPages = await prisma.socialPage.findMany({
    where: { socialAccount: clientIdWhere(scope) },
    select: { id: true, pageName: true },
    orderBy: { pageName: "asc" },
  });

  return (
    <section className="py-10 max-w-md">
      <h1 className="text-2xl font-semibold tracking-tight text-(--hub-text)">Add store</h1>
      <p className="mt-1 text-sm text-(--hub-muted)">Add a store location for promo card footers.</p>

      <div className="mt-4">
        <Link href="/hub/promos/stores" className="text-sm text-(--hub-muted) hover:underline">
          ← Back to stores
        </Link>
      </div>

      {clients.length === 0 ? (
        <p className="mt-6 text-sm text-(--hub-muted)">No clients found. Add a client first.</p>
      ) : (
        <StoreForm
          action={createStore}
          submitLabel="Save store"
          clients={clients}
          clientId={clients.length === 1 ? clients[0].id : undefined}
          socialPages={socialPages}
        />
      )}
    </section>
  );
}
