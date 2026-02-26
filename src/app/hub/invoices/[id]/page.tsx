import Link from "next/link";
import { getSession } from "@/lib/auth";
import { toAuthScope } from "@/lib/auth";
import { canAccessClient } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { SetInvoiceStatusButton } from "../_components/SetInvoiceStatusButton";
import { RecordPaymentForm } from "@/app/hub/payments/_components/RecordPaymentForm";
import { Breadcrumbs } from "@/app/hub/_components/Breadcrumbs";
import { StatusBadge } from "@/app/hub/_components/StatusBadge";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    select: { invoiceNumber: true },
  });
  if (!invoice) return { title: "Invoice | UMS Hub" };
  return { title: `Invoice ${invoice.invoiceNumber} | UMS Hub` };
}

function toNum(d: unknown): number {
  if (d == null) return 0;
  if (typeof d === "number" && !Number.isNaN(d)) return d;
  return Number(d) || 0;
}

export default async function InvoiceDetailPage({ params }: PageProps) {
  const { id } = await params;
  const { user } = await getSession();
  if (!user) return null;

  const scope = toAuthScope(user);
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, companyName: true } },
      lineItems: { orderBy: { createdAt: "asc" } },
      payments: { orderBy: { paidAt: "desc" } },
    },
  });

  if (!invoice || !canAccessClient(scope, invoice.clientId)) notFound();

  const totalPaid = invoice.payments.reduce((s, p) => s + toNum(p.amount), 0);
  const totalAmount = toNum(invoice.totalAmount);
  const isFullyPaid = totalPaid >= totalAmount;

  return (
    <section className="py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Breadcrumbs
          items={[
            { label: "Hub", href: "/hub" },
            { label: "Invoices", href: "/hub/invoices" },
            { label: invoice.invoiceNumber },
          ]}
        />
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/hub/invoices/${id}/print`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-black/15 px-3 py-1.5 text-sm hover:bg-black/5"
          >
            Print / PDF
          </Link>
          {invoice.status === "DRAFT" && (
            <Link
              href={`/hub/invoices/${id}/edit`}
              className="rounded-md border border-black/15 px-3 py-1.5 text-sm font-medium hover:bg-black/5"
            >
              Edit
            </Link>
          )}
          <SetInvoiceStatusButton invoiceId={id} currentStatus={invoice.status} />
        </div>
      </div>

      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{invoice.invoiceNumber}</h1>
          <p className="mt-1 text-sm text-black/70">
            <Link href={`/hub/clients/${invoice.client.id}`} className="hover:underline">
              {invoice.client.companyName}
            </Link>
            {" · "}
            Due {invoice.dueDate.toLocaleDateString("en-ZA", { dateStyle: "medium" })}
          </p>
        </div>
        <StatusBadge status={invoice.status} size="md" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-black/10 bg-white p-6">
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
              {invoice.lineItems.map((line) => (
                <tr key={line.id} className="border-b border-black/5">
                  <td className="py-2">{line.description}</td>
                  <td className="py-2 text-right">{Number(line.quantity)}</td>
                  <td className="py-2 text-right">R {toNum(line.unitPrice).toLocaleString("en-ZA")}</td>
                  <td className="py-2 text-right">R {toNum(line.lineTotal).toLocaleString("en-ZA")}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 flex justify-end gap-6 border-t border-black/10 pt-4 text-sm">
            <span>Subtotal: R {toNum(invoice.subtotalAmount).toLocaleString("en-ZA")}</span>
            {invoice.includeVat && toNum(invoice.vatAmount) > 0 && (
              <span>VAT ({Number(invoice.vatRate)}%): R {toNum(invoice.vatAmount).toLocaleString("en-ZA")}</span>
            )}
            <span className="font-semibold">Total: R {totalAmount.toLocaleString("en-ZA")}</span>
          </div>
          {invoice.notes && (
            <p className="mt-4 border-t border-black/5 pt-4 text-sm text-black/60">{invoice.notes}</p>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-black/10 bg-white p-5">
            <h2 className="text-sm font-medium text-black/60">Payments</h2>
            {invoice.payments.length === 0 ? (
              <p className="mt-2 text-sm text-black/50">No payments recorded.</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {invoice.payments.map((p) => (
                  <li key={p.id} className="flex justify-between text-sm">
                    <span>
                      {p.paidAt.toLocaleDateString("en-ZA")} · {p.method}
                      {p.reference ? ` (${p.reference})` : ""}
                    </span>
                    <span>R {toNum(p.amount).toLocaleString("en-ZA")}</span>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 border-t border-black/5 pt-3 text-sm font-medium">
              Total paid: R {totalPaid.toLocaleString("en-ZA")}
              {totalAmount > 0 && (
                <span className="ml-2 text-black/60">
                  ({Math.round((totalPaid / totalAmount) * 100)}%)
                </span>
              )}
            </p>
            {(invoice.status === "SENT" || invoice.status === "OVERDUE") && !isFullyPaid && (
              <RecordPaymentForm
                clientId={invoice.clientId}
                invoiceId={invoice.id}
                invoiceNumber={invoice.invoiceNumber}
                remaining={totalAmount - totalPaid}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
