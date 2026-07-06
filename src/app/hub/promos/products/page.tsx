import Link from "next/link";
import { Package, Plus, Pencil } from "lucide-react";
import { Suspense } from "react";
import { getSession, toAuthScope } from "@/lib/auth";
import { clientIdWhere } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { toNum } from "@/lib/utils";
import { DeleteProductButton } from "./_components/DeleteProductButton";
import { ProductSearchBar } from "./_components/ProductSearchBar";

export const metadata = { title: "Product Library | UMS Hub" };

export default async function PromoProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { user } = await getSession();
  if (!user) return null;

  const { q } = await searchParams;
  const search = q?.trim() ?? "";

  const scope = toAuthScope(user);
  const scopeWhere = clientIdWhere(scope);

  const products = await prisma.promoProduct.findMany({
    where: {
      ...scopeWhere,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { code: { contains: search, mode: "insensitive" } },
              { variant: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: [{ clientId: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
    include: {
      _count: { select: { promoItems: true } },
    },
  });

  return (
    <section className="py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-(--hub-text)">Product library</h1>
          <p className="mt-2 text-sm text-(--hub-muted)">
            Manage products available for promotion cards.
          </p>
        </div>
        <Link
          href="/hub/promos/products/new"
          className="inline-flex items-center gap-2 rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black/80"
        >
          <Plus className="h-4 w-4" />
          Add product
        </Link>
      </div>

      <div className="mt-6">
        <Link href="/hub/promos" className="text-sm text-(--hub-muted) hover:underline">
          ← Back to promos
        </Link>
      </div>

      <div className="mt-4 max-w-sm">
        <Suspense>
          <ProductSearchBar defaultValue={search} />
        </Suspense>
      </div>

      <div className="mt-4">
        {products.length === 0 ? (
          <div className="rounded-xl border border-(--hub-border-light) bg-white p-8 text-center text-sm text-(--hub-muted)">
            {search ? (
              <>No products match &ldquo;{search}&rdquo;.</>
            ) : (
              <>No products yet.{" "}<Link href="/hub/promos/products/new" className="underline">Add your first product</Link></>
            )}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <div
                key={p.id}
                className="flex gap-3 rounded-xl border border-(--hub-border-light) bg-white p-4"
              >
                <div className="h-16 w-16 shrink-0 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center">
                  {p.imageData ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.imageData} alt={p.name} className="h-full w-full object-contain" />
                  ) : (
                    <Package className="h-6 w-6 text-gray-300" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  {p.code && (
                    <p className="text-[11px] font-mono text-(--hub-muted) leading-none mb-0.5">{p.code}</p>
                  )}
                  <p className="font-medium text-(--hub-text) truncate">{p.name}</p>
                  {p.variant && <p className="text-xs text-(--hub-muted) truncate">{p.variant}</p>}
                  <p className="text-sm font-semibold text-red-700 mt-1">
                    R {toNum(p.price).toFixed(2)}
                  </p>
                  <div className="mt-2 flex items-center gap-3">
                    <Link
                      href={`/hub/promos/products/${p.id}/edit`}
                      className="inline-flex items-center gap-1 text-xs text-(--hub-muted) hover:underline"
                    >
                      <Pencil className="h-3 w-3" /> Edit
                    </Link>
                    <DeleteProductButton productId={p.id} promoCount={p._count.promoItems} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
