import { getSession, toAuthScope } from "@/lib/auth";
import { clientWhere, clientIdWhere } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { toNum } from "@/lib/utils";
import { createPromo } from "../actions";
import { PromoForm } from "../_components/PromoForm";
import { PromoClientSwitcher } from "../_components/PromoClientSwitcher";

export const metadata = { title: "New Promo | UMS Hub" };

export default async function NewPromoPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { user } = await getSession();
  if (!user) return null;

  const { clientId: requestedClientId } = await searchParams;

  const scope = toAuthScope(user);

  const clients = await prisma.client.findMany({
    where: clientWhere(scope),
    orderBy: { companyName: "asc" },
    select: { id: true, companyName: true },
  });

  // Pick the client explicitly where asked; otherwise fall back to the one
  // whose library actually has products, then to a store's client.
  const requested =
    typeof requestedClientId === "string"
      ? clients.find((c) => c.id === requestedClientId)
      : undefined;
  const [firstProduct, firstStore] = await Promise.all([
    prisma.promoProduct.findFirst({
      where: { ...clientIdWhere(scope), isActive: true },
      select: { clientId: true },
    }),
    prisma.promoStore.findFirst({
      where: clientIdWhere(scope),
      select: { clientId: true },
    }),
  ]);
  const defaultClient =
    requested ??
    (firstProduct ? clients.find((c) => c.id === firstProduct.clientId) : null) ??
    (firstStore ? clients.find((c) => c.id === firstStore.clientId) : null) ??
    clients[0];

  const [products, stores] = defaultClient
    ? await Promise.all([
        prisma.promoProduct.findMany({
          where: { clientId: defaultClient.id, isActive: true },
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
          select: { id: true, code: true, name: true, variant: true, price: true, imageData: true },
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
    code: p.code,
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

      {!defaultClient ? (
        <p className="mt-6 text-sm text-(--hub-muted)">No clients found. Add a client first.</p>
      ) : (
        <>
        <PromoClientSwitcher clients={clients} selectedClientId={defaultClient.id} />
        <PromoForm
          action={createPromo}
          backHref="/hub/promos"
          submitLabel="Create promo"
          cancelHref="/hub/promos"
          clientId={defaultClient.id}
          clientName={defaultClient.companyName}
          stores={stores}
          products={productsForForm}
        />
        </>
      )}
    </section>
  );
}
