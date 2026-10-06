import type { AuthScope } from "@/lib/auth";
import { clientIdWhere, clientWhere } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

/**
 * The client promos are run for. Promos are a single-client service, so the
 * forms do not ask — but they must not guess alphabetically either: that is how
 * the product library ended up filed under the wrong client. Resolve it from
 * the promo data that already exists (library, then branches, then promos), and
 * only fall back to the first client when there is nothing to go on.
 */
export async function resolvePromoClientId(
  scope: AuthScope,
): Promise<string | null> {
  const scopeWhere = clientIdWhere(scope);

  const [product, store, promo] = await Promise.all([
    prisma.promoProduct.findFirst({
      where: { ...scopeWhere, isActive: true },
      orderBy: { createdAt: "asc" },
      select: { clientId: true },
    }),
    prisma.promoStore.findFirst({
      where: scopeWhere,
      orderBy: { createdAt: "asc" },
      select: { clientId: true },
    }),
    prisma.promo.findFirst({
      where: scopeWhere,
      orderBy: { createdAt: "desc" },
      select: { clientId: true },
    }),
  ]);

  const fromData = product?.clientId ?? store?.clientId ?? promo?.clientId;
  if (fromData) return fromData;

  const firstClient = await prisma.client.findFirst({
    where: clientWhere(scope),
    orderBy: { companyName: "asc" },
    select: { id: true },
  });
  return firstClient?.id ?? null;
}
