import Link from "next/link";
import { Layers, Plus, Package, MapPin } from "lucide-react";
import { getSession, toAuthScope } from "@/lib/auth";
import { clientIdWhere } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { EmptyState } from "@/app/hub/_components/EmptyState";

export const metadata = { title: "Promos | UMS Hub" };

export default async function PromosPage() {
  const { user } = await getSession();
  if (!user) return null;

  const scope = toAuthScope(user);
  const scopeWhere = clientIdWhere(scope);

  const promos = await prisma.promo.findMany({
    where: scopeWhere,
    orderBy: { createdAt: "desc" },
    include: {
      client: { select: { id: true, companyName: true } },
      store: { select: { name: true } },
      _count: { select: { items: true } },
    },
  });

  return (
    <section className="py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-(--hub-text)">Promos</h1>
          <p className="mt-2 text-sm text-(--hub-muted)">
            Build product promotion cards for your stores.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/hub/promos/stores"
            className="inline-flex items-center gap-2 rounded-md border border-(--hub-border-light) px-3 py-2 text-sm font-medium text-(--hub-text) hover:bg-black/5"
          >
            <MapPin className="h-4 w-4" />
            Stores
          </Link>
          <Link
            href="/hub/promos/products"
            className="inline-flex items-center gap-2 rounded-md border border-(--hub-border-light) px-3 py-2 text-sm font-medium text-(--hub-text) hover:bg-black/5"
          >
            <Package className="h-4 w-4" />
            Products
          </Link>
          <Link
            href="/hub/promos/new"
            className="inline-flex items-center gap-2 rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black/80"
          >
            <Plus className="h-4 w-4" />
            New promo
          </Link>
        </div>
      </div>

      <div className="mt-8">
        {promos.length === 0 ? (
          <EmptyState
            icon={Layers}
            title="No promos yet"
            description="Create your first promotion to start generating product cards."
            primaryAction={{ href: "/hub/promos/new", label: "New promo", icon: Plus }}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {promos.map((p) => (
              <Link
                key={p.id}
                href={`/hub/promos/${p.id}`}
                className="group rounded-xl border border-(--hub-border-light) bg-white p-5 hover:border-black/20 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-(--hub-text) truncate group-hover:underline">
                      {p.title}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                      p.status === "READY"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-(--hub-muted)">
                  <span>
                    {p.promoDateFrom.toLocaleDateString("en-ZA", { day: "numeric", month: "short" })}
                    {" – "}
                    {p.promoDateTo.toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                  {p.store && <span>{p.store.name}</span>}
                  <span>{p._count.items} product{p._count.items !== 1 ? "s" : ""}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
