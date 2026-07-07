import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { getSession, toAuthScope } from "@/lib/auth";
import { clientIdWhere } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { toNum } from "@/lib/utils";
import { PromoCardsSection } from "../_components/PromoCardsSection";
import { DeletePromoButton } from "./_components/DeletePromoButton";

export const metadata = { title: "Promo Cards | UMS Hub" };

export default async function PromoViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user } = await getSession();
  if (!user) return null;

  const scope = toAuthScope(user);
  const scopeWhere = clientIdWhere(scope);

  const promo = await prisma.promo.findFirst({
    where: { id, ...scopeWhere },
    include: {
      client: { select: { companyName: true } },
      store: { select: { name: true, number: true, address: true, phone: true } },
      items: {
        orderBy: { sortOrder: "asc" },
        include: { product: true },
      },
    },
  });
  if (!promo) notFound();

  const slugTitle = promo.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  return (
    <section className="py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-(--hub-text)">{promo.title}</h1>
          <p className="mt-1 text-sm text-(--hub-muted)">
            {promo.store && <>{promo.store.name} · </>}
            {" · "}
            {promo.promoDateFrom.toLocaleDateString("en-ZA", { day: "numeric", month: "short" })}
            {" – "}
            {promo.promoDateTo.toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/hub/promos/${id}/edit`}
            className="inline-flex items-center gap-2 rounded-md border border-(--hub-border-light) px-3 py-2 text-sm font-medium text-(--hub-text) hover:bg-black/5"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
          <DeletePromoButton promoId={id} />
        </div>
      </div>

      <div className="mt-4">
        <Link href="/hub/promos" className="text-sm text-(--hub-muted) hover:underline">
          ← Back to promos
        </Link>
      </div>

      {promo.items.length === 0 ? (
        <div className="mt-8 rounded-xl border border-(--hub-border-light) bg-white p-8 text-center text-sm text-(--hub-muted)">
          No products in this promo yet.{" "}
          <Link href={`/hub/promos/${id}/edit`} className="underline">Edit to add products</Link>
        </div>
      ) : (
        <PromoCardsSection
          items={promo.items.map((item) => ({
            id: item.id,
            filename: `${slugTitle}-${item.product.name.toLowerCase().replace(/\s+/g, "-")}.png`,
            headerImageData: promo.headerImageData,
            promoDateFrom: promo.promoDateFrom,
            promoDateTo: promo.promoDateTo,
            storeName: promo.store?.name,
            storeNumber: promo.store?.number,
            storeAddress: promo.store?.address,
            storePhone: promo.store?.phone,
            productName: item.product.name,
            productUnit: item.product.unit,
            productVariant: item.product.variant,
            productVariants:
              Array.isArray(item.variants) && item.variants.length >= 2
                ? (item.variants as { label: string; promoPrice: number; originalPrice?: number | null }[])
                : null,
            productPrice: toNum(item.product.price),
            productImageData: item.product.imageData,
            priceOverride: item.priceOverride != null ? toNum(item.priceOverride) : null,
            originalPrice: item.originalPrice != null ? toNum(item.originalPrice) : null,
          }))}
        />
      )}
    </section>
  );
}
