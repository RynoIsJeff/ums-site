import Link from "next/link";
import { getSession, toAuthScope } from "@/lib/auth";
import { clientWhere, clientIdWhere } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { toNum } from "@/lib/utils";
import { PendingSubmitButton } from "@/app/hub/_components/PendingSubmitButton";
import { ImageUploadInput } from "../_components/ImageUploadInput";
import { ProductSelector } from "../_components/ProductSelector";
import { createPromo } from "../actions";

export const metadata = { title: "New Promo | UMS Hub" };

export default async function NewPromoPage() {
  const { user } = await getSession();
  if (!user) return null;

  const scope = toAuthScope(user);

  const clients = await prisma.client.findMany({
    where: clientWhere(scope),
    orderBy: { companyName: "asc" },
    select: { id: true, companyName: true },
  });
  const defaultClient = clients[0];

  const [products, stores] = defaultClient
    ? await Promise.all([
        prisma.promoProduct.findMany({
          where: { clientId: defaultClient.id, isActive: true },
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
          select: { id: true, name: true, variant: true, price: true, imageData: true },
        }),
        prisma.promoStore.findMany({
          where: { clientId: defaultClient.id },
          orderBy: { name: "asc" },
          select: { id: true, name: true },
        }),
      ])
    : [[], []];

  const productsForForm = products.map((p) => ({
    id: p.id,
    name: p.name,
    variant: p.variant,
    price: toNum(p.price).toFixed(2),
    imageData: p.imageData,
  }));

  return (
    <section className="py-10 max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight text-(--hub-text)">New promo</h1>
      <p className="mt-1 text-sm text-(--hub-muted)">
        Set up a promotion and select products to generate promo cards.
      </p>

      <div className="mt-4">
        <Link href="/hub/promos" className="text-sm text-(--hub-muted) hover:underline">
          ← Back to promos
        </Link>
      </div>

      {!defaultClient ? (
        <p className="mt-6 text-sm text-(--hub-muted)">No clients found. Add a client first.</p>
      ) : (
        <form action={createPromo} className="mt-6 space-y-6">
          <input type="hidden" name="clientId" value={defaultClient.id} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium">Promo title *</label>
              <input
                id="title"
                name="title"
                type="text"
                required
                placeholder="e.g. June 2025 Promo"
                className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label htmlFor="promoDateFrom" className="block text-sm font-medium">From date *</label>
              <input
                id="promoDateFrom"
                name="promoDateFrom"
                type="date"
                required
                className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label htmlFor="promoDateTo" className="block text-sm font-medium">To date *</label>
              <input
                id="promoDateTo"
                name="promoDateTo"
                type="date"
                required
                className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="storeId" className="block text-sm font-medium">Store location (optional)</label>
              <select
                id="storeId"
                name="storeId"
                className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm"
              >
                <option value="">No specific store</option>
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              {stores.length === 0 && (
                <p className="mt-1 text-xs text-(--hub-muted)">
                  No stores yet.{" "}
                  <Link href="/hub/promos/stores/new" className="underline">Add a store</Link>
                </p>
              )}
            </div>
          </div>

          <ImageUploadInput name="headerImageData" label="Promo header image" />

          <div className="border-t border-black/10 pt-6">
            <ProductSelector products={productsForForm} />
          </div>

          <div className="flex gap-3 pt-2">
            <PendingSubmitButton className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black/90">
              Create promo
            </PendingSubmitButton>
            <Link href="/hub/promos" className="rounded-md border border-black/15 px-4 py-2 text-sm hover:bg-black/5">
              Cancel
            </Link>
          </div>
        </form>
      )}
    </section>
  );
}
