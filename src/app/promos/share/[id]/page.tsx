import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { toNum } from "@/lib/utils";
import { PromoPublicCards } from "./_components/PromoPublicCards";
import type { CardVariant } from "@/app/hub/promos/_components/BuildItCard";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const promo = await prisma.promo.findUnique({
    where: { id },
    select: { title: true, store: { select: { name: true } } },
  });
  if (!promo) return { title: "Promo Cards" };
  const store = promo.store?.name ? `${promo.store.name} — ` : "";
  return {
    title: promo.title,
    description: `${store}View all promotional product cards.`,
  };
}

export default async function PromoSharePage({ params }: Props) {
  const { id } = await params;

  const promo = await prisma.promo.findUnique({
    where: { id },
    include: {
      store: { select: { name: true, number: true, address: true, phone: true } },
      items: {
        orderBy: { sortOrder: "asc" },
        include: { product: true },
      },
    },
  });

  if (!promo) notFound();

  const slugTitle = promo.title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  const cardItems = promo.items.map((item) => ({
    id: item.id,
    filename: `${slugTitle}-${item.product.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/\//g, ".")
      .replace(/[^a-z0-9.-]/g, "")}.png`,
    headerImageData: promo.headerImageData,
    promoDateFrom: promo.promoDateFrom,
    promoDateTo: promo.promoDateTo,
    storeName: promo.store?.name ?? null,
    storeNumber: promo.store?.number ?? null,
    storeAddress: promo.store?.address ?? null,
    storePhone: promo.store?.phone ?? null,
    productName: item.product.name,
    productUnit: item.product.unit ?? null,
    productVariant: item.product.variant ?? null,
    productVariants:
      Array.isArray(item.variants) && item.variants.length >= 2
        ? (item.variants as CardVariant[])
        : null,
    productPrice: toNum(item.product.price),
    productImageData: item.product.imageData ?? null,
    priceOverride: item.priceOverride != null ? toNum(item.priceOverride) : null,
    originalPrice: item.originalPrice != null ? toNum(item.originalPrice) : null,
  }));

  const dateFrom = promo.promoDateFrom.toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
  });
  const dateTo = promo.promoDateTo.toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">{promo.title}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {promo.store?.name && <>{promo.store.name} · </>}
            {dateFrom} – {dateTo}
          </p>
          <p className="mt-3 text-sm text-gray-400">
            Tap <strong>Save image</strong> under any card to download it.
          </p>
        </div>

        {cardItems.length === 0 ? (
          <p className="text-sm text-gray-500">No products in this promo.</p>
        ) : (
          <PromoPublicCards items={cardItems} />
        )}
      </div>
    </main>
  );
}
