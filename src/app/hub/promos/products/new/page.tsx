import Link from "next/link";
import { getSession, toAuthScope } from "@/lib/auth";
import { clientWhere } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { PendingSubmitButton } from "@/app/hub/_components/PendingSubmitButton";
import { ImageUploadInput } from "../../_components/ImageUploadInput";
import { createProduct } from "../../actions";

export const metadata = { title: "Add Product | UMS Hub" };

export default async function NewProductPage() {
  const { user } = await getSession();
  if (!user) return null;

  const scope = toAuthScope(user);
  const clients = await prisma.client.findMany({
    where: clientWhere(scope),
    orderBy: { companyName: "asc" },
    select: { id: true, companyName: true },
  });

  return (
    <section className="py-10 max-w-lg">
      <h1 className="text-2xl font-semibold tracking-tight text-(--hub-text)">Add product</h1>
      <p className="mt-1 text-sm text-(--hub-muted)">Add a product to the promotion library.</p>

      <div className="mt-4">
        <Link href="/hub/promos/products" className="text-sm text-(--hub-muted) hover:underline">
          ← Back to products
        </Link>
      </div>

      <form action={createProduct} className="mt-6 space-y-4">
        <div>
          <label htmlFor="clientId" className="block text-sm font-medium">Client *</label>
          <select
            id="clientId"
            name="clientId"
            required
            className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm"
          >
            <option value="">Select client</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.companyName}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium">Product name *</label>
          <input
            id="name"
            name="name"
            type="text"
            required
            placeholder="e.g. Cemcrete Cretestone"
            className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label htmlFor="variant" className="block text-sm font-medium">Variant / description</label>
          <input
            id="variant"
            name="variant"
            type="text"
            placeholder="e.g. 25kg bag · Grey"
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
            placeholder="e.g. 109.99"
            className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm"
          />
        </div>

        <ImageUploadInput name="imageData" label="Product image" />

        <div className="flex gap-3 pt-2">
          <PendingSubmitButton className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black/90">
            Save product
          </PendingSubmitButton>
          <Link href="/hub/promos/products" className="rounded-md border border-black/15 px-4 py-2 text-sm hover:bg-black/5">
            Cancel
          </Link>
        </div>
      </form>
    </section>
  );
}
