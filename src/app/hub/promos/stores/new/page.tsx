import Link from "next/link";
import { getSession, toAuthScope } from "@/lib/auth";
import { clientWhere } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { PendingSubmitButton } from "@/app/hub/_components/PendingSubmitButton";
import { createStore } from "../../actions";

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
  const defaultClient = clients[0];

  return (
    <section className="py-10 max-w-md">
      <h1 className="text-2xl font-semibold tracking-tight text-(--hub-text)">Add store</h1>
      <p className="mt-1 text-sm text-(--hub-muted)">Add a store location for promo card footers.</p>

      <div className="mt-4">
        <Link href="/hub/promos/stores" className="text-sm text-(--hub-muted) hover:underline">
          ← Back to stores
        </Link>
      </div>

      {!defaultClient ? (
        <p className="mt-6 text-sm text-(--hub-muted)">No clients found. Add a client first.</p>
      ) : (
        <form action={createStore} className="mt-6 space-y-4">
          <input type="hidden" name="clientId" value={defaultClient.id} />

          <div>
            <label htmlFor="name" className="block text-sm font-medium">Store name *</label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="e.g. Pongola"
              className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm"
            />
            <p className="mt-1 text-xs text-(--hub-muted)">The location name shown under the Build It logo on cards.</p>
          </div>

          <div>
            <label htmlFor="number" className="block text-sm font-medium">Store number</label>
            <input
              id="number"
              name="number"
              type="text"
              placeholder="e.g. RU 05 05"
              className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium">Store address</label>
            <input
              id="address"
              name="address"
              type="text"
              placeholder="e.g. 12 Main Street, Pongola, 3170"
              className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium">Phone number</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="e.g. 034 413 1234"
              className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <PendingSubmitButton className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black/90">
              Save store
            </PendingSubmitButton>
            <Link href="/hub/promos/stores" className="rounded-md border border-black/15 px-4 py-2 text-sm hover:bg-black/5">
              Cancel
            </Link>
          </div>
        </form>
      )}
    </section>
  );
}
