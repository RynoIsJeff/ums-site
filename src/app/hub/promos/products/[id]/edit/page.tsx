import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession, toAuthScope } from "@/lib/auth";
import { clientIdWhere } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { toNum } from "@/lib/utils";
import { PendingSubmitButton } from "@/app/hub/_components/PendingSubmitButton";
import { ImageUploadInput } from "../../../_components/ImageUploadInput";
import { updateProduct } from "../../../actions";

export const metadata = { title: "Edit Product | UMS Hub" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user } = await getSession();
  if (!user) return null;

  const scope = toAuthScope(user);
  const scopeWhere = clientIdWhere(scope);
  const product = await prisma.promoProduct.findFirst({
    where: { id, ...scopeWhere },
    include: { client: { select: { companyName: true } } },
  });
  if (!product) notFound();

  const boundAction = updateProduct.bind(null, id);

  return (
    <section className="py-10 max-w-lg">
      <h1 className="text-2xl font-semibold tracking-tight text-(--hub-text)">Edit product</h1>
      <p className="mt-1 text-sm text-(--hub-muted)">{product.client.companyName}</p>

      <div className="mt-4">
        <Link href="/hub/promos/products" className="text-sm text-(--hub-muted) hover:underline">
          ← Back to products
        </Link>
      </div>

      <form action={boundAction} className="mt-6 space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium">Product name *</label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={product.name}
            className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label htmlFor="variant" className="block text-sm font-medium">Variant / description</label>
          <input
            id="variant"
            name="variant"
            type="text"
            defaultValue={product.variant ?? ""}
            className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium">Price (R) *</label>
          <input
            id="price"
            name="price"
            type="text"
            inputMode="decimal"
            required
            defaultValue={toNum(product.price).toFixed(2)}
            className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm"
          />
        </div>

        <ImageUploadInput
          name="imageData"
          label="Product image"
          currentImageData={product.imageData}
          clearInputName="clearImage"
        />

        <div className="flex gap-3 pt-2">
          <PendingSubmitButton className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black/90">
            Save changes
          </PendingSubmitButton>
          <Link href="/hub/promos/products" className="rounded-md border border-black/15 px-4 py-2 text-sm hover:bg-black/5">
            Cancel
          </Link>
        </div>
      </form>
    </section>
  );
}
