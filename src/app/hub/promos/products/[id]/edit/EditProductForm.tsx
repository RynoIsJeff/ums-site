"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PendingSubmitButton } from "@/app/hub/_components/PendingSubmitButton";
import { SaveProgress } from "@/app/hub/_components/SaveProgress";
import { ImageUploadInput } from "../../../_components/ImageUploadInput";
import { updateProduct, type UpdateProductResult } from "../../../actions";

type Props = {
  productId: string;
  defaultCode: string;
  defaultName: string;
  defaultUnit: string;
  defaultVariant: string;
  defaultPrice: string;
  defaultImageData: string | null;
};

export function EditProductForm({
  productId,
  defaultCode,
  defaultName,
  defaultUnit,
  defaultVariant,
  defaultPrice,
  defaultImageData,
}: Props) {
  const router = useRouter();
  const boundAction = updateProduct.bind(null, productId);
  const [state, formAction] = useActionState(boundAction, null);

  useEffect(() => {
    if (state?.ok) {
      router.push("/hub/promos/products");
    }
  }, [state, router]);

  return (
    <>
      {state && !state.ok && (
        <div className="mt-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}
      <form action={formAction} className="mt-6 space-y-4">
        <div>
          <label htmlFor="code" className="block text-sm font-medium">Product code</label>
          <input
            id="code"
            name="code"
            type="text"
            defaultValue={defaultCode}
            placeholder="e.g. CEM-001"
            className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm font-mono"
          />
          <p className="mt-1 text-xs text-(--hub-muted)">Optional. Used to quickly find this product later.</p>
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium">Product name *</label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={defaultName}
            className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label htmlFor="unit" className="block text-sm font-medium">Price unit</label>
          <input
            id="unit"
            name="unit"
            type="text"
            defaultValue={defaultUnit}
            placeholder="each"
            className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-(--hub-muted)">Shown below the price, e.g. each, per roll, per m.</p>
        </div>

        <div>
          <label htmlFor="variant" className="block text-sm font-medium">Variant / description</label>
          <textarea
            id="variant"
            name="variant"
            rows={3}
            defaultValue={defaultVariant}
            className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm resize-y"
          />
          <p className="mt-1 text-xs text-(--hub-muted)">Each line prints separately on the card.</p>
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium">Price (R) *</label>
          <input
            id="price"
            name="price"
            type="text"
            inputMode="decimal"
            required
            defaultValue={defaultPrice}
            className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm"
          />
        </div>

        <ImageUploadInput
          name="imageData"
          label="Product image"
          currentImageData={defaultImageData}
          clearInputName="clearImage"
          maxPx={480}
          quality={0.75}
        />

        <div className="flex gap-3 pt-2">
          <PendingSubmitButton className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black/90">
            Save changes
          </PendingSubmitButton>
          <Link href="/hub/promos/products" className="rounded-md border border-black/15 px-4 py-2 text-sm hover:bg-black/5">
            Cancel
          </Link>
        </div>
        <SaveProgress />
      </form>
    </>
  );
}
