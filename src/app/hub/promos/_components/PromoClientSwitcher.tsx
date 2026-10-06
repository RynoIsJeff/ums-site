"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

type Props = {
  clients: { id: string; companyName: string }[];
  selectedClientId: string;
};

/**
 * Picks whose promo this is. Stores and products are per client, so the choice
 * reloads the page to show that client's branches and library rather than
 * guessing from whichever store happens to come first.
 */
export function PromoClientSwitcher({ clients, selectedClientId }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (clients.length <= 1) return null;

  return (
    <div className="mt-6">
      <label htmlFor="promoClient" className="block text-sm font-medium">
        Client *
      </label>
      <select
        id="promoClient"
        value={selectedClientId}
        disabled={pending}
        onChange={(e) =>
          startTransition(() => {
            router.replace(`/hub/promos/new?clientId=${e.target.value}`);
          })
        }
        className="mt-1 w-full max-w-sm rounded-md border border-black/15 px-3 py-2 text-sm disabled:opacity-60"
      >
        {clients.map((c) => (
          <option key={c.id} value={c.id}>
            {c.companyName}
          </option>
        ))}
      </select>
      <p className="mt-1 text-xs text-(--hub-muted)">
        {pending ? "Loading that client's stores and products…" : "Sets which stores and products you can choose below."}
      </p>
    </div>
  );
}
