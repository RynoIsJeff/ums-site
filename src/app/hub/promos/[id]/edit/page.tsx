import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession, toAuthScope } from "@/lib/auth";
import { clientIdWhere } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { toNum } from "@/lib/utils";
import { PendingSubmitButton } from "@/app/hub/_components/PendingSubmitButton";
import { ImageUploadInput } from "../../_components/ImageUploadInput";
import { ProductSelector } from "../../_components/ProductSelector";
import { updatePromo } from "../../actions";

export const metadata = { title: "Edit Promo | UMS Hub" };

export default async function EditPromoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user } = await getSession();
  if (!user) return null;

  const scope = toAuthScope(user);
  const scopeWhere = clientIdWhere(scope);

  const promo = await prisma.promo.findFirst({
    where: { id, ...scopeWhere },
    include: {
      items: { select: { productId: true } },
    },
  });
  if (!promo) notFound();

  const [stores, products] = await Promise.all([
    prisma.promoStore.findMany({
      where: { clientId: promo.clientId },
      orderBy: { name: "asc" },
      select: { id: true, name: true, number: true, address: true },
    }),
    prisma.promoProduct.findMany({
      where: { clientId: promo.clientId, isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true, variant: true, price: true, imageData: true },
    }),
  ]);

  const selectedProductIds = promo.items.map((i) => i.productId);
  const defaultPriceOverrides: Record<string, string> = {};
  const defaultOriginalPrices: Record<string, string> = {};
  for (const item of promo.items) {
    if (item.priceOverride != null) defaultPriceOverrides[item.productId] = String(item.priceOverride);
    if (item.originalPrice != null) defaultOriginalPrices[item.productId] = String(item.originalPrice);
  }

  const productsForForm = products.map((p) => ({
    id: p.id,
    name: p.name,
    variant: p.variant,
    price: toNum(p.price).toFixed(2),
    imageData: p.imageData,
  }));

  const boundAction = updatePromo.bind(null, id);

  const toDateInput = (d: Date) => d.toISOString().split("T")[0];

  return (
    <section className="py-10 max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight text-(--hub-text)">Edit promo</h1>

      <div className="mt-4">
        <Link href={`/hub/promos/${id}`} className="text-sm text-(--hub-muted) hover:underline">
          ← Back to promo
        </Link>
      </div>

      <form action={boundAction} className="mt-6 space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="title" className="block text-sm font-medium">Promo title *</label>
            <input
              id="title"
              name="title"
              type="text"
              required
              defaultValue={promo.title}
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
              defaultValue={toDateInput(promo.promoDateFrom)}
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
              defaultValue={toDateInput(promo.promoDateTo)}
              className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="storeId" className="block text-sm font-medium">Store location (optional)</label>
            <select
              id="storeId"
              name="storeId"
              defaultValue={promo.storeId ?? ""}
              className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm"
            >
              <option value="">No specific store</option>
              {stores.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        <ImageUploadInput
          name="headerImageData"
          label="Promo header image"
          currentImageData={promo.headerImageData}
          clearInputName="clearHeader"
          acceptPdf
        />

        <div className="border-t border-black/10 pt-6">
          <ProductSelector
            products={productsForForm}
            defaultSelected={selectedProductIds}
            defaultPriceOverrides={defaultPriceOverrides}
            defaultOriginalPrices={defaultOriginalPrices}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <PendingSubmitButton className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black/90">
            Save changes
          </PendingSubmitButton>
          <Link href={`/hub/promos/${id}`} className="rounded-md border border-black/15 px-4 py-2 text-sm hover:bg-black/5">
            Cancel
          </Link>
        </div>
      </form>
    </section>
  );
}
