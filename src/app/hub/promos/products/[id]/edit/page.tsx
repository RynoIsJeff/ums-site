import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession, toAuthScope } from "@/lib/auth";
import { clientIdWhere } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { toNum } from "@/lib/utils";
import { EditProductForm } from "./EditProductForm";

export const metadata = { title: "Edit Product | UMS Hub" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user } = await getSession();
  if (!user) return null;

  const scope = toAuthScope(user);
  const scopeWhere = clientIdWhere(scope);
  const product = await prisma.promoProduct.findFirst({ where: { id, ...scopeWhere } });
  if (!product) notFound();

  return (
    <section className="py-10 max-w-lg">
      <h1 className="text-2xl font-semibold tracking-tight text-(--hub-text)">Edit product</h1>

      <div className="mt-4">
        <Link href="/hub/promos/products" className="text-sm text-(--hub-muted) hover:underline">
          ← Back to products
        </Link>
      </div>

      <EditProductForm
        productId={id}
        defaultCode={product.code ?? ""}
        defaultName={product.name}
        defaultUnit={product.unit}
        defaultVariant={product.variant ?? ""}
        defaultPrice={toNum(product.price).toFixed(2)}
        defaultImageData={product.imageData}
      />
    </section>
  );
}
