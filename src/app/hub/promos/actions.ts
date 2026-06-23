"use server";

import { prisma } from "@/lib/prisma";
import { getSession, toAuthScope } from "@/lib/auth";
import { clientIdWhere } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// ─── Stores ──────────────────────────────────────────────────────────────────

export async function createStore(formData: FormData) {
  const { user } = await getSession();
  if (!user) redirect("/hub");

  const clientId = formData.get("clientId") as string;
  const name = (formData.get("name") as string)?.trim();
  const number = (formData.get("number") as string)?.trim() || null;
  const address = (formData.get("address") as string)?.trim() || null;
  if (!clientId || !name) redirect("/hub/promos/stores/new");

  const scope = toAuthScope(user);
  const where = clientIdWhere(scope);
  if (where.clientId && where.clientId !== clientId) redirect("/hub");

  await prisma.promoStore.create({ data: { clientId, name, number, address } });
  revalidatePath("/hub/promos/stores");
  redirect("/hub/promos/stores");
}

export async function updateStore(id: string, formData: FormData) {
  const { user } = await getSession();
  if (!user) redirect("/hub");

  const name = (formData.get("name") as string)?.trim();
  const number = (formData.get("number") as string)?.trim() || null;
  const address = (formData.get("address") as string)?.trim() || null;
  if (!name) redirect(`/hub/promos/stores/${id}/edit`);

  const scope = toAuthScope(user);
  const scopeWhere = clientIdWhere(scope);
  const store = await prisma.promoStore.findFirst({ where: { id, ...scopeWhere } });
  if (!store) redirect("/hub/promos/stores");

  await prisma.promoStore.update({ where: { id }, data: { name, number, address } });
  revalidatePath("/hub/promos/stores");
  redirect("/hub/promos/stores");
}

export async function deleteStore(id: string): Promise<{ error?: string }> {
  const { user } = await getSession();
  if (!user) return { error: "Unauthorized" };

  const scope = toAuthScope(user);
  const scopeWhere = clientIdWhere(scope);
  const store = await prisma.promoStore.findFirst({ where: { id, ...scopeWhere } });
  if (!store) return { error: "Not found." };

  await prisma.promoStore.delete({ where: { id } });
  revalidatePath("/hub/promos/stores");
  return {};
}

// ─── Products ─────────────────────────────────────────────────────────────────

export async function createProduct(formData: FormData) {
  const { user } = await getSession();
  if (!user) redirect("/hub");

  const clientId = formData.get("clientId") as string;
  const name = (formData.get("name") as string)?.trim();
  const variant = (formData.get("variant") as string)?.trim() || null;
  const priceStr = formData.get("price") as string;
  const imageData = (formData.get("imageData") as string) || null;

  if (!clientId || !name || !priceStr) redirect("/hub/promos/products/new");
  const price = parseFloat(priceStr);
  if (isNaN(price) || price < 0) redirect("/hub/promos/products/new");

  const scope = toAuthScope(user);
  const where = clientIdWhere(scope);
  if (where.clientId && where.clientId !== clientId) redirect("/hub");

  await prisma.promoProduct.create({ data: { clientId, name, variant, price, imageData } });
  revalidatePath("/hub/promos/products");
  redirect("/hub/promos/products");
}

export async function updateProduct(id: string, formData: FormData) {
  const { user } = await getSession();
  if (!user) redirect("/hub");

  const name = (formData.get("name") as string)?.trim();
  const variant = (formData.get("variant") as string)?.trim() || null;
  const priceStr = formData.get("price") as string;
  const imageData = (formData.get("imageData") as string) || null;
  const clearImage = formData.get("clearImage") === "1";

  if (!name || !priceStr) redirect(`/hub/promos/products/${id}/edit`);
  const price = parseFloat(priceStr);
  if (isNaN(price) || price < 0) redirect(`/hub/promos/products/${id}/edit`);

  const scope = toAuthScope(user);
  const scopeWhere = clientIdWhere(scope);
  const product = await prisma.promoProduct.findFirst({ where: { id, ...scopeWhere } });
  if (!product) redirect("/hub/promos/products");

  await prisma.promoProduct.update({
    where: { id },
    data: {
      name,
      variant,
      price,
      imageData: clearImage ? null : (imageData || product.imageData),
    },
  });
  revalidatePath("/hub/promos/products");
  redirect("/hub/promos/products");
}

export async function deleteProduct(id: string): Promise<{ error?: string }> {
  const { user } = await getSession();
  if (!user) return { error: "Unauthorized" };

  const scope = toAuthScope(user);
  const scopeWhere = clientIdWhere(scope);
  const product = await prisma.promoProduct.findFirst({
    where: { id, ...scopeWhere },
    include: { _count: { select: { promoItems: true } } },
  });
  if (!product) return { error: "Not found." };
  if (product._count.promoItems > 0) return { error: "Cannot delete a product used in a promo." };

  await prisma.promoProduct.delete({ where: { id } });
  revalidatePath("/hub/promos/products");
  return {};
}

// ─── Promos ───────────────────────────────────────────────────────────────────

export async function createPromo(formData: FormData) {
  const { user } = await getSession();
  if (!user) redirect("/hub");

  const clientId = formData.get("clientId") as string;
  const title = (formData.get("title") as string)?.trim();
  const promoDateFromStr = formData.get("promoDateFrom") as string;
  const promoDateToStr = formData.get("promoDateTo") as string;
  const storeId = (formData.get("storeId") as string) || null;
  const headerImageData = (formData.get("headerImageData") as string) || null;
  const productIds = formData.getAll("productIds[]") as string[];

  if (!clientId || !title || !promoDateFromStr || !promoDateToStr) redirect("/hub/promos/new");

  const scope = toAuthScope(user);
  const where = clientIdWhere(scope);
  if (where.clientId && where.clientId !== clientId) redirect("/hub");

  const promo = await prisma.promo.create({
    data: {
      clientId,
      createdById: user.id,
      title,
      headerImageData,
      promoDateFrom: new Date(promoDateFromStr),
      promoDateTo: new Date(promoDateToStr),
      storeId: storeId || null,
      items: {
        create: productIds.map((pid, i) => ({ productId: pid, sortOrder: i })),
      },
    },
  });

  redirect(`/hub/promos/${promo.id}`);
}

export async function updatePromo(id: string, formData: FormData) {
  const { user } = await getSession();
  if (!user) redirect("/hub");

  const title = (formData.get("title") as string)?.trim();
  const promoDateFromStr = formData.get("promoDateFrom") as string;
  const promoDateToStr = formData.get("promoDateTo") as string;
  const storeId = (formData.get("storeId") as string) || null;
  const headerImageData = (formData.get("headerImageData") as string) || null;
  const clearHeader = formData.get("clearHeader") === "1";
  const productIds = formData.getAll("productIds[]") as string[];

  if (!title || !promoDateFromStr || !promoDateToStr) redirect(`/hub/promos/${id}/edit`);

  const scope = toAuthScope(user);
  const scopeWhere = clientIdWhere(scope);
  const existing = await prisma.promo.findFirst({ where: { id, ...scopeWhere } });
  if (!existing) redirect("/hub/promos");

  await prisma.$transaction([
    prisma.promoItem.deleteMany({ where: { promoId: id } }),
    prisma.promo.update({
      where: { id },
      data: {
        title,
        headerImageData: clearHeader ? null : (headerImageData || existing.headerImageData),
        promoDateFrom: new Date(promoDateFromStr),
        promoDateTo: new Date(promoDateToStr),
        storeId: storeId || null,
        items: {
          create: productIds.map((pid, i) => ({ productId: pid, sortOrder: i })),
        },
      },
    }),
  ]);

  revalidatePath(`/hub/promos/${id}`);
  redirect(`/hub/promos/${id}`);
}

export async function deletePromo(id: string): Promise<{ error?: string }> {
  const { user } = await getSession();
  if (!user) return { error: "Unauthorized" };

  const scope = toAuthScope(user);
  const scopeWhere = clientIdWhere(scope);
  const promo = await prisma.promo.findFirst({ where: { id, ...scopeWhere } });
  if (!promo) return { error: "Not found." };

  await prisma.promo.delete({ where: { id } });
  revalidatePath("/hub/promos");
  return {};
}
