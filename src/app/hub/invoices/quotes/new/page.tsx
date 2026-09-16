import { getSession, toAuthScope } from "@/lib/auth";
import { clientWhere } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { Breadcrumbs } from "@/app/hub/_components/Breadcrumbs";
import { QuoteForm } from "../_components/QuoteForm";
import { createQuote, getNextQuoteNumber } from "../actions";

export const metadata = {
  title: "New Quote | UMS Hub",
};

export default async function NewQuotePage() {
  const { user } = await getSession();
  if (!user) return null;

  const scope = toAuthScope(user);
  const [clients, stores, nextNumber] = await Promise.all([
    prisma.client.findMany({
      where: clientWhere(scope),
      orderBy: { companyName: "asc" },
      select: { id: true, companyName: true },
    }),
    prisma.promoStore.findMany({
      where: { client: clientWhere(scope) },
      orderBy: { name: "asc" },
      select: { id: true, name: true, clientId: true },
    }),
    getNextQuoteNumber(),
  ]);

  const today = new Date();
  const validUntil = new Date(today);
  validUntil.setDate(validUntil.getDate() + 30);

  return (
    <section className="py-10">
      <div className="mb-6">
        <Breadcrumbs
          items={[
            { label: "Hub", href: "/hub" },
            { label: "Invoices", href: "/hub/invoices" },
            { label: "Quotes", href: "/hub/invoices/quotes" },
            { label: "New" },
          ]}
        />
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">New quote</h1>
      <p className="mt-2 text-sm text-black/70">
        Add line items; total is calculated automatically. The quote is saved as a
        draft — send it when you are ready.
      </p>
      <div className="mt-6 rounded-xl border border-black/10 bg-white p-6">
        <QuoteForm
          action={createQuote}
          clients={clients}
          stores={stores}
          defaultQuoteNumber={nextNumber}
          defaultIssueDate={today.toISOString().slice(0, 10)}
          defaultValidUntil={validUntil.toISOString().slice(0, 10)}
          submitLabel="Create quote (draft)"
          backHref="/hub/invoices/quotes"
        />
      </div>
    </section>
  );
}
