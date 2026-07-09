import { notFound } from "next/navigation";
import { getSession, toAuthScope } from "@/lib/auth";
import { clientIdWhere } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { toNum } from "@/lib/utils";
import { updatePromo } from "../../actions";
import { PromoForm } from "../../_components/PromoForm";

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
      items: { select: { productId: true, priceOverride: true, originalPrice: true, variants: true } },
    },
  });
  if (!promo) notFound();

  const [stores, products] = await Promise.all([
    prisma.promoStore.findMany({
      where: { clientId: promo.clientId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.promoProduct.findMany({
      where: { clientId: promo.clientId, isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, code: true, name: true, variant: true, price: true, imageData: true },
    }),
  ]);

  const selectedProductIds = promo.items.map((i) => i.productId);
  const defaultPriceOverrides: Record<string, string> = {};
  const defaultOriginalPrices: Record<string, string> = {};
  const defaultVariants: Record<string, { label: string; description?: string; promoPrice: string; originalPrice: string }[]> = {};
  for (const item of promo.items) {
    if (item.priceOverride != null) defaultPriceOverrides[item.productId] = String(item.priceOverride);
    if (item.originalPrice != null) defaultOriginalPrices[item.productId] = String(item.originalPrice);
    if (Array.isArray(item.variants) && item.variants.length >= 2) {
      defaultVariants[item.productId] = (item.variants as { label: string; description?: string | null; promoPrice: number; originalPrice?: number | null }[]).map((v) => ({
        label: v.label,
        description: v.description ?? "",
        promoPrice: String(v.promoPrice),
        originalPrice: v.originalPrice != null ? String(v.originalPrice) : "",
      }));
    }
  }

  const productsForForm = products.map((p) => ({
    id: p.id,
    code: p.code,
    name: p.name,
    variant: p.variant,
    price: toNum(p.price).toFixed(2),
    imageData: p.imageData,
  }));

  const toDateInput = (d: Date) => d.toISOString().split("T")[0];
  const boundAction = updatePromo.bind(null, id);

  return (
    <section className="py-10 max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight text-(--hub-text)">Edit promo</h1>

      <PromoForm
        action={boundAction}
        backHref={`/hub/promos/${id}`}
        submitLabel="Save changes"
        cancelHref={`/hub/promos/${id}`}
        clientId={promo.clientId}
        stores={stores}
        products={productsForForm}
        defaults={{
          title: promo.title,
          promoDateFrom: toDateInput(promo.promoDateFrom),
          promoDateTo: toDateInput(promo.promoDateTo),
          storeId: promo.storeId,
          headerImageData: promo.headerImageData,
          selectedProductIds,
          priceOverrides: defaultPriceOverrides,
          originalPrices: defaultOriginalPrices,
          variants: defaultVariants,
        }}
      />
    </section>
  );
}
