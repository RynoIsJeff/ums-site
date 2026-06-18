import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession, toAuthScope } from "@/lib/auth";
import { clientIdWhere } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { PendingSubmitButton } from "@/app/hub/_components/PendingSubmitButton";
import { updateStore } from "../../../actions";

export const metadata = { title: "Edit Store | UMS Hub" };

export default async function EditStorePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user } = await getSession();
  if (!user) return null;

  const scope = toAuthScope(user);
  const scopeWhere = clientIdWhere(scope);
  const store = await prisma.promoStore.findFirst({ where: { id, ...scopeWhere } });
  if (!store) notFound();

  const boundAction = updateStore.bind(null, id);

  return (
    <section className="py-10 max-w-md">
      <h1 className="text-2xl font-semibold tracking-tight text-(--hub-text)">Edit store</h1>

      <div className="mt-4">
        <Link href="/hub/promos/stores" className="text-sm text-(--hub-muted) hover:underline">
          ← Back to stores
        </Link>
      </div>

      <form action={boundAction} className="mt-6 space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium">Store name *</label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={store.name}
            className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-(--hub-muted)">Shown under the Build It logo on cards.</p>
        </div>

        <div>
          <label htmlFor="number" className="block text-sm font-medium">Store number</label>
          <input
            id="number"
            name="number"
            type="text"
            defaultValue={store.number ?? ""}
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
            defaultValue={store.address ?? ""}
            placeholder="e.g. 12 Main Street, Pongola, 3170"
            className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <PendingSubmitButton className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black/90">
            Save changes
          </PendingSubmitButton>
          <Link href="/hub/promos/stores" className="rounded-md border border-black/15 px-4 py-2 text-sm hover:bg-black/5">
            Cancel
          </Link>
        </div>
      </form>
    </section>
  );
}
