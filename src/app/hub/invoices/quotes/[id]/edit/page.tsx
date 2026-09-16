import { notFound } from "next/navigation";
import { getSession, toAuthScope } from "@/lib/auth";
import { canAccessClient, clientWhere } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { Breadcrumbs } from "@/app/hub/_components/Breadcrumbs";
import { toNum } from "@/lib/utils";
import { QuoteForm } from "../../_components/QuoteForm";
import { updateQuote } from "../../actions";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const quote = await prisma.quote.findUnique({
    where: { id },
    select: { quoteNumber: true },
  });
  if (!quote) return { title: "Edit Quote | UMS Hub" };
  return { title: `Edit Quote ${quote.quoteNumber} | UMS Hub` };
}

export default async function EditQuotePage({ params }: PageProps) {
  const { id } = await params;
  const { user } = await getSession();
  if (!user) return null;

  const scope = toAuthScope(user);
  const [quote, clients, stores] = await Promise.all([
    prisma.quote.findUnique({
      where: { id },
      include: { lineItems: { orderBy: { createdAt: "asc" } } },
    }),
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
  ]);

  if (!quote || !canAccessClient(scope, quote.clientId)) notFound();
  if (quote.status !== "DRAFT") notFound();

  const defaultLineItems = quote.lineItems.map((line) => ({
    description: line.description,
    quantity: toNum(line.quantity),
    unitPrice: toNum(line.unitPrice),
  }));

  const updateAction = updateQuote.bind(null, id);

  return (
    <section className="py-10">
      <div className="mb-6">
        <Breadcrumbs
          items={[
            { label: "Hub", href: "/hub" },
            { label: "Invoices", href: "/hub/invoices" },
            { label: "Quotes", href: "/hub/invoices/quotes" },
            { label: quote.quoteNumber, href: `/hub/invoices/quotes/${id}` },
            { label: "Edit" },
          ]}
        />
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">Edit quote</h1>
      <p className="mt-2 text-sm text-black/70">
        Client and quote number cannot be changed. Update line items and dates as
        needed.
      </p>
      <div className="mt-6 rounded-xl border border-black/10 bg-white p-6">
        <QuoteForm
          action={updateAction}
          clients={clients}
          stores={stores}
          defaultQuoteNumber={quote.quoteNumber}
          defaultIssueDate={quote.issueDate.toISOString().slice(0, 10)}
          defaultValidUntil={quote.validUntil.toISOString().slice(0, 10)}
          defaultLineItems={defaultLineItems}
          defaultNotes={quote.notes ?? ""}
          defaultClientId={quote.clientId}
          defaultStoreId={quote.storeId ?? undefined}
          lockIdentity
          submitLabel="Save changes"
          backHref={`/hub/invoices/quotes/${id}`}
        />
      </div>
    </section>
  );
}
