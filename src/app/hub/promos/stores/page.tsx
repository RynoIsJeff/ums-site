import Link from "next/link";
import { MapPin, Plus, Pencil, Trash2 } from "lucide-react";
import { getSession, toAuthScope } from "@/lib/auth";
import { clientIdWhere } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { DeleteStoreButton } from "./_components/DeleteStoreButton";

export const metadata = { title: "Stores | UMS Hub" };

export default async function PromoStoresPage() {
  const { user } = await getSession();
  if (!user) return null;

  const scope = toAuthScope(user);
  const scopeWhere = clientIdWhere(scope);

  const stores = await prisma.promoStore.findMany({
    where: scopeWhere,
    orderBy: [{ clientId: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      number: true,
      address: true,
      client: { select: { companyName: true } },
      _count: { select: { promos: true } },
    },
  });

  return (
    <section className="py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-(--hub-text)">Stores</h1>
          <p className="mt-2 text-sm text-(--hub-muted)">Store locations for promo card footers.</p>
        </div>
        <Link
          href="/hub/promos/stores/new"
          className="inline-flex items-center gap-2 rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black/80"
        >
          <Plus className="h-4 w-4" />
          Add store
        </Link>
      </div>

      <div className="mt-6">
        <Link href="/hub/promos" className="text-sm text-(--hub-muted) hover:underline">
          ← Back to promos
        </Link>
      </div>

      <div className="mt-4">
        {stores.length === 0 ? (
          <div className="rounded-xl border border-(--hub-border-light) bg-white p-8 text-center text-sm text-(--hub-muted)">
            No stores yet.{" "}
            <Link href="/hub/promos/stores/new" className="underline">Add one</Link>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-(--hub-border-light) bg-white">
            <table className="hub-table min-w-[400px]">
              <thead>
                <tr>
                  <th>Store name</th>
                  <th>Number</th>
                  <th>Address</th>
                  <th>Promos</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {stores.map((s) => (
                  <tr key={s.id}>
                    <td className="font-medium text-(--hub-text)">
                      <span className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-(--hub-muted)" />
                        {s.name}
                      </span>
                    </td>
                    <td className="text-(--hub-muted)">{s.number ?? <span className="text-black/25">—</span>}</td>
                    <td className="text-(--hub-muted)">{s.address ?? <span className="text-black/25">—</span>}</td>
                    <td className="text-(--hub-muted)">{s._count.promos}</td>
                    <td>
                      <div className="flex items-center gap-3 justify-end">
                        <Link
                          href={`/hub/promos/stores/${s.id}/edit`}
                          className="inline-flex items-center gap-1 text-xs text-(--hub-muted) hover:underline"
                        >
                          <Pencil className="h-3 w-3" /> Edit
                        </Link>
                        <DeleteStoreButton storeId={s.id} promoCount={s._count.promos} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
