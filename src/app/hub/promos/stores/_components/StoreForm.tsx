"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PendingSubmitButton } from "@/app/hub/_components/PendingSubmitButton";
import type { StoreActionResult } from "../../actions";

type Props = {
  action: (prev: StoreActionResult | null, formData: FormData) => Promise<StoreActionResult>;
  submitLabel: string;
  clientId?: string;
  defaults?: { name?: string; number?: string; address?: string; phone?: string };
};

export function StoreForm({ action, submitLabel, clientId, defaults = {} }: Props) {
  const router = useRouter();
  const [state, formAction] = useActionState(action, null);

  useEffect(() => {
    if (state?.ok) {
      router.push("/hub/promos/stores");
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
        {clientId && <input type="hidden" name="clientId" value={clientId} />}

        <div>
          <label htmlFor="name" className="block text-sm font-medium">Store name *</label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={defaults.name}
            placeholder="e.g. Pongola"
            className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-(--hub-muted)">The location name shown under the Build It logo on cards.</p>
        </div>

        <div>
          <label htmlFor="number" className="block text-sm font-medium">Store number</label>
          <input
            id="number"
            name="number"
            type="text"
            defaultValue={defaults.number}
            placeholder="e.g. RU 05 05"
            className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium">Store address</label>
          <input
            id="address"
            name="address"
            type="text"
            defaultValue={defaults.address}
            placeholder="e.g. 12 Main Street, Pongola, 3170"
            className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium">Phone number</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={defaults.phone}
            placeholder="e.g. 034 413 1234"
            className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <PendingSubmitButton className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black/90">
            {submitLabel}
          </PendingSubmitButton>
          <Link href="/hub/promos/stores" className="rounded-md border border-black/15 px-4 py-2 text-sm hover:bg-black/5">
            Cancel
          </Link>
        </div>
      </form>
    </>
  );
}
