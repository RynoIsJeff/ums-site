"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PendingSubmitButton } from "@/app/hub/_components/PendingSubmitButton";
import { SaveProgress } from "@/app/hub/_components/SaveProgress";
import { ImageUploadInput } from "./ImageUploadInput";
import { ProductSelector } from "./ProductSelector";
import type { PromoActionResult } from "../actions";

type Store = { id: string; name: string };
type Product = {
  id: string;
  code: string | null;
  name: string;
  variant: string | null;
  price: string;
  imageData: string | null;
};
type VariantRow = { label: string; promoPrice: string; originalPrice: string };

type PromoFormProps = {
  action: (prev: PromoActionResult | null, formData: FormData) => Promise<PromoActionResult>;
  backHref: string;
  submitLabel: string;
  cancelHref: string;
  clientId: string;
  stores: Store[];
  products: Product[];
  defaults?: {
    title?: string;
    promoDateFrom?: string;
    promoDateTo?: string;
    storeId?: string | null;
    headerImageData?: string | null;
    selectedProductIds?: string[];
    priceOverrides?: Record<string, string>;
    originalPrices?: Record<string, string>;
    variants?: Record<string, VariantRow[]>;
  };
};

export function PromoForm({
  action,
  backHref,
  submitLabel,
  cancelHref,
  clientId,
  stores,
  products,
  defaults = {},
}: PromoFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(action, null);

  useEffect(() => {
    if (state?.ok) {
      router.push(state.redirectTo);
    }
  }, [state, router]);

  return (
    <>
      <div className="mt-4">
        <Link href={backHref} className="text-sm text-(--hub-muted) hover:underline">
          ← Back
        </Link>
      </div>

      {state && !state.ok && (
        <div className="mt-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <form action={formAction} className="mt-6 space-y-6">
        <input type="hidden" name="clientId" value={clientId} />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="title" className="block text-sm font-medium">Promo title *</label>
            <input
              id="title"
              name="title"
              type="text"
              required
              defaultValue={defaults.title}
              placeholder="e.g. June 2025 Promo"
              className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label htmlFor="promoDateFrom" className="block text-sm font-medium">From date *</label>
            <input
              id="promoDateFrom"
              name="promoDateFrom"
              type="date"
              required
              defaultValue={defaults.promoDateFrom}
              className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label htmlFor="promoDateTo" className="block text-sm font-medium">To date *</label>
            <input
              id="promoDateTo"
              name="promoDateTo"
              type="date"
              required
              defaultValue={defaults.promoDateTo}
              className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="storeId" className="block text-sm font-medium">Store location (optional)</label>
            <select
              id="storeId"
              name="storeId"
              defaultValue={defaults.storeId ?? ""}
              className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm"
            >
              <option value="">No specific store</option>
              {stores.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            {stores.length === 0 && (
              <p className="mt-1 text-xs text-(--hub-muted)">
                No stores yet.{" "}
                <Link href="/hub/promos/stores/new" className="underline">Add a store</Link>
              </p>
            )}
          </div>
        </div>

        <ImageUploadInput
          name="headerImageData"
          label="Promo header image"
          currentImageData={defaults.headerImageData}
          clearInputName="clearHeader"
          acceptPdf
        />

        <div className="border-t border-black/10 pt-6">
          <ProductSelector
            products={products}
            defaultSelected={defaults.selectedProductIds}
            defaultPriceOverrides={defaults.priceOverrides}
            defaultOriginalPrices={defaults.originalPrices}
            defaultVariants={defaults.variants}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <PendingSubmitButton className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black/90">
            {submitLabel}
          </PendingSubmitButton>
          <Link href={cancelHref} className="rounded-md border border-black/15 px-4 py-2 text-sm hover:bg-black/5">
            Cancel
          </Link>
        </div>

        <SaveProgress label={isPending ? `Saving ${products.length > 10 ? `${products.length} products` : "changes"}, please wait…` : "Saving, please wait…"} />
      </form>
    </>
  );
}
