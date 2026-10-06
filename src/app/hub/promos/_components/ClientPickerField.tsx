"use client";

type Props = {
  clients: { id: string; companyName: string }[];
  defaultClientId?: string;
  /** One line explaining what the choice affects. */
  hint?: string;
};

/**
 * Client field for promo products and stores. A single client needs no choice,
 * so it submits a hidden field instead — but it is never implicit: whatever is
 * submitted is what the record is assigned to.
 */
export function ClientPickerField({ clients, defaultClientId, hint }: Props) {
  if (clients.length === 1) {
    return <input type="hidden" name="clientId" value={clients[0].id} />;
  }

  return (
    <div>
      <label htmlFor="clientId" className="block text-sm font-medium">
        Client *
      </label>
      <select
        id="clientId"
        name="clientId"
        required
        defaultValue={defaultClientId ?? ""}
        className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm"
      >
        <option value="">Select client</option>
        {clients.map((c) => (
          <option key={c.id} value={c.id}>
            {c.companyName}
          </option>
        ))}
      </select>
      {hint && <p className="mt-1 text-xs text-(--hub-muted)">{hint}</p>}
    </div>
  );
}
