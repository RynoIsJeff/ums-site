import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession, toAuthScope } from "@/lib/auth";
import { canAccessClient } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { Breadcrumbs } from "@/app/hub/_components/Breadcrumbs";
import { StatusBadge } from "@/app/hub/_components/StatusBadge";
import { toNum } from "@/lib/utils";
import { SetQuoteStatusButton } from "../_components/SetQuoteStatusButton";
import { DeleteQuoteButton } from "../_components/DeleteQuoteButton";
import { DuplicateQuoteButton } from "../_components/DuplicateQuoteButton";
import { ConvertQuoteButton } from "../_components/ConvertQuoteButton";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const quote = await prisma.quote.findUnique({
    where: { id },
    select: { quoteNumber: true },
  });
  if (!quote) return { title: "Quote | UMS Hub" };
  return { title: `Quote ${quote.quoteNumber} | UMS Hub` };
}

export default async function QuoteDetailPage({ params }: PageProps) {
  const { id } = await params;
  const { user } = await getSession();
  if (!user) return null;

  const scope = toAuthScope(user);
  const quote = await prisma.quote.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, companyName: true, email: true } },
      lineItems: { orderBy: { createdAt: "asc" } },
      store: { select: { id: true, name: true } },
      convertedInvoice: { select: { id: true, invoiceNumber: true, status: true } },
    },
  });

  if (!quote || !canAccessClient(scope, quote.clientId)) notFound();

  const totalAmount = toNum(quote.totalAmount);
  const lapsed = quote.status === "SENT" && quote.validUntil < new Date();
  const canDelete = ["DRAFT", "DECLINED", "EXPIRED"].includes(quote.status);

  return (
    <section className="py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Breadcrumbs
          items={[
            { label: "Hub", href: "/hub" },
            { label: "Invoices", href: "/hub/invoices" },
            { label: "Quotes", href: "/hub/invoices/quotes" },
            { label: quote.quoteNumber },
          ]}
        />
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/api/hub/quotes/${id}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-black/15 px-3 py-1.5 text-sm hover:bg-black/5"
          >
            View
          </Link>
          <a
            href={`/api/hub/quotes/${id}/pdf?download=1`}
            download
            className="rounded-md border border-black/15 px-3 py-1.5 text-sm hover:bg-black/5"
          >
            Download
          </a>
          {quote.lineItems.length > 0 && <DuplicateQuoteButton quoteId={id} />}
          {quote.status === "DRAFT" && (
            <Link
              href={`/hub/invoices/quotes/${id}/edit`}
              className="rounded-md border border-black/15 px-3 py-1.5 text-sm font-medium hover:bg-black/5"
            >
              Edit
            </Link>
          )}
          {canDelete && (
            <DeleteQuoteButton
              quoteId={id}
              quoteNumber={quote.quoteNumber}
              afterDelete="quotes"
            />
          )}
          <SetQuoteStatusButton quoteId={id} currentStatus={quote.status} />
        </div>
      </div>

      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{quote.quoteNumber}</h1>
          <p className="mt-1 text-sm text-black/70">
            <Link href={`/hub/clients/${quote.client.id}`} className="hover:underline">
              {quote.client.companyName}
            </Link>
            {quote.store && <> · <span>{quote.store.name}</span></>}
            {" · "}
            Valid until {quote.validUntil.toLocaleDateString("en-ZA", { dateStyle: "medium" })}
            {lapsed && <span className="ml-1 text-amber-700">(lapsed)</span>}
          </p>
        </div>
        <StatusBadge status={quote.status} size="md" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-black/10 bg-white p-6 lg:col-span-2">
          <h2 className="text-sm font-medium text-black/60">Line items</h2>
          <table className="mt-3 w-full text-sm">
            <thead>
              <tr className="border-b border-black/10 text-left">
                <th className="pb-2 font-medium">Description</th>
                <th className="pb-2 text-right">Qty</th>
                <th className="pb-2 text-right">Unit price</th>
                <th className="pb-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {quote.lineItems.map((line) => (
                <tr key={line.id} className="border-b border-black/5">
                  <td className="py-2">{line.description}</td>
                  <td className="py-2 text-right">{toNum(line.quantity)}</td>
                  <td className="py-2 text-right">
                    R {toNum(line.unitPrice).toLocaleString("en-ZA")}
                  </td>
                  <td className="py-2 text-right">
                    R {toNum(line.lineTotal).toLocaleString("en-ZA")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 flex justify-end gap-6 border-t border-black/10 pt-4 text-sm">
            <span>Subtotal: R {toNum(quote.subtotalAmount).toLocaleString("en-ZA")}</span>
            {quote.includeVat && toNum(quote.vatAmount) > 0 && (
              <span>
                VAT ({toNum(quote.vatRate)}%): R{" "}
                {toNum(quote.vatAmount).toLocaleString("en-ZA")}
              </span>
            )}
            <span className="font-semibold">
              Total: R {totalAmount.toLocaleString("en-ZA")}
            </span>
          </div>
          {quote.notes && (
            <p className="mt-4 border-t border-black/5 pt-4 text-sm text-black/60">
              {quote.notes}
            </p>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-black/10 bg-white p-5">
            <h2 className="text-sm font-medium text-black/60">Invoice</h2>
            {quote.convertedInvoice ? (
              <div className="mt-2 space-y-2 text-sm">
                <p className="text-black/70">
                  Converted{" "}
                  {quote.convertedAt?.toLocaleDateString("en-ZA", { dateStyle: "medium" })}.
                </p>
                <Link
                  href={`/hub/invoices/${quote.convertedInvoice.id}`}
                  className="inline-flex items-center gap-2 font-medium text-(--primary) hover:underline"
                >
                  Invoice {quote.convertedInvoice.invoiceNumber}
                </Link>
                <StatusBadge status={quote.convertedInvoice.status} />
              </div>
            ) : quote.status === "ACCEPTED" ? (
              <div className="mt-3">
                <ConvertQuoteButton quoteId={id} />
                <p className="mt-2 text-xs text-black/50">
                  Copies the client, store, line items, and notes into a new draft
                  invoice.
                </p>
              </div>
            ) : (
              <p className="mt-2 text-sm text-black/50">
                Mark this quote as Accepted to create an invoice from it.
              </p>
            )}
          </div>

          <div className="rounded-xl border border-black/10 bg-white p-5">
            <h2 className="text-sm font-medium text-black/60">Timeline</h2>
            <ul className="mt-2 space-y-1 text-sm text-black/70">
              <li>
                Quoted {quote.issueDate.toLocaleDateString("en-ZA", { dateStyle: "medium" })}
              </li>
              {quote.sentAt && (
                <li>
                  Sent {quote.sentAt.toLocaleDateString("en-ZA", { dateStyle: "medium" })}
                  {quote.client.email ? ` to ${quote.client.email}` : ""}
                </li>
              )}
              {quote.acceptedAt && (
                <li>
                  Accepted{" "}
                  {quote.acceptedAt.toLocaleDateString("en-ZA", { dateStyle: "medium" })}
                </li>
              )}
              {quote.declinedAt && (
                <li>
                  Declined{" "}
                  {quote.declinedAt.toLocaleDateString("en-ZA", { dateStyle: "medium" })}
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
