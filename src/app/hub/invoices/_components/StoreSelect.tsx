"use client";

import Link from "next/link";

export type StoreOption = { id: string; name: string; clientId: string };

type Props = {
  stores: StoreOption[];
  clients: { id: string; companyName: string }[];
  /** Client currently chosen on the form. */
  selectedClientId: string;
  defaultStoreId?: string;
  /** "invoice" | "quote" — only used for the helper wording. */
  documentLabel: string;
};

/**
 * Store picker for invoices and quotes. The selected client's own stores come
 * first; any others are still selectable in a second group, since stores added
 * before they could be assigned to a client all sit under one client.
 */
export function StoreSelect({
  stores,
  clients,
  selectedClientId,
  defaultStoreId,
  documentLabel,
}: Props) {
  const clientName = (id: string) =>
    clients.find((c) => c.id === id)?.companyName ?? "Unassigned client";

  const ownStores = stores.filter((s) => s.clientId === selectedClientId);
  const otherStores = stores.filter((s) => s.clientId !== selectedClientId);

  return (
    <div className="sm:col-span-2">
      <label htmlFor="storeId" className="mb-1 block text-sm font-medium">
        Store{" "}
        <span className="font-normal text-black/50">
          (optional — {documentLabel} a specific branch)
        </span>
      </label>

      {stores.length === 0 ? (
        <p className="py-2 text-sm text-black/50">
          No stores set up yet.{" "}
          <Link href="/hub/promos/stores/new" className="underline hover:text-black">
            Add a store
          </Link>{" "}
          first.
        </p>
      ) : (
        <>
          <select
            id="storeId"
            name="storeId"
            defaultValue={defaultStoreId ?? ""}
            className="w-full rounded-md border border-black/15 px-3 py-2 text-sm"
          >
            <option value="">No specific store</option>
            {ownStores.length > 0 && (
              <optgroup label="This client's stores">
                {ownStores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </optgroup>
            )}
            {otherStores.length > 0 && (
              <optgroup label="Stores on other clients">
                {otherStores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — {clientName(s.clientId)}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
          {ownStores.length === 0 && (
            <p className="mt-1 text-xs text-black/50">
              No stores belong to this client yet — reassign one under{" "}
              <Link href="/hub/promos/stores" className="underline hover:text-black">
                Promos → Stores
              </Link>
              .
            </p>
          )}
        </>
      )}
    </div>
  );
}
