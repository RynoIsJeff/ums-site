import { getSession } from "@/lib/auth";
import { toAuthScope } from "@/lib/auth";
import { canAccessClient } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

type PageProps = { params: Promise<{ id: string }> };

function toNum(d: unknown): number {
  if (d == null) return 0;
  if (typeof d === "number" && !Number.isNaN(d)) return d;
  return Number(d) || 0;
}

export default async function InvoicePrintPage({ params }: PageProps) {
  const { id } = await params;
  const { user } = await getSession();
  if (!user) return null;

  const scope = toAuthScope(user);
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      client: true,
      lineItems: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!invoice || !canAccessClient(scope, invoice.clientId)) notFound();

  return (
    <div className="min-h-screen bg-white p-8 print:p-6" style={{ fontFamily: "system-ui, sans-serif" }}>
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex justify-between border-b border-black/20 pb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">INVOICE</h1>
            <p className="mt-1 text-lg font-semibold">{invoice.invoiceNumber}</p>
          </div>
          <div className="text-right text-sm text-black/70">
            <p>Ultimate Marketing Smash</p>
            <p>ultimatemarketingsmash.com</p>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-6 text-sm">
          <div>
            <p className="font-medium text-black/60">Bill to</p>
            <p className="mt-1 font-medium">{invoice.client.companyName}</p>
            {invoice.client.contactPerson && (
              <p>{invoice.client.contactPerson}</p>
            )}
            {invoice.client.billingAddress && (
              <pre className="mt-1 whitespace-pre-wrap font-sans text-black/80">
                {invoice.client.billingAddress}
              </pre>
            )}
            {invoice.client.email && <p>{invoice.client.email}</p>}
          </div>
          <div className="text-right">
            <p><span className="text-black/60">Issue date:</span> {invoice.issueDate.toLocaleDateString("en-ZA", { dateStyle: "medium" })}</p>
            <p><span className="text-black/60">Due date:</span> {invoice.dueDate.toLocaleDateString("en-ZA", { dateStyle: "medium" })}</p>
            <p><span className="text-black/60">Status:</span> {invoice.status}</p>
          </div>
        </div>

        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-black/20">
              <th className="pb-2 text-left font-medium">Description</th>
              <th className="pb-2 text-right font-medium">Qty</th>
              <th className="pb-2 text-right font-medium">Unit price</th>
              <th className="pb-2 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lineItems.map((line) => (
              <tr key={line.id} className="border-b border-black/10">
                <td className="py-3">{line.description}</td>
                <td className="py-3 text-right">{Number(line.quantity)}</td>
                <td className="py-3 text-right">R {toNum(line.unitPrice).toLocaleString("en-ZA")}</td>
                <td className="py-3 text-right">R {toNum(line.lineTotal).toLocaleString("en-ZA")}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 flex justify-end">
          <div className="w-56 space-y-1 text-right text-sm">
            <div className="flex justify-between">
              <span className="text-black/60">Subtotal</span>
              <span>R {toNum(invoice.subtotalAmount).toLocaleString("en-ZA")}</span>
            </div>
            {invoice.includeVat && (
              <div className="flex justify-between">
                <span className="text-black/60">VAT ({Number(invoice.vatRate)}%)</span>
                <span>R {toNum(invoice.vatAmount).toLocaleString("en-ZA")}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-black/20 pt-2 font-semibold">
              <span>Total</span>
              <span>R {toNum(invoice.totalAmount).toLocaleString("en-ZA")}</span>
            </div>
          </div>
        </div>

        {invoice.notes && (
          <div className="mt-8 border-t border-black/10 pt-6 text-sm text-black/70">
            <p className="font-medium text-black/60">Notes</p>
            <p className="mt-1 whitespace-pre-wrap">{invoice.notes}</p>
          </div>
        )}

        <p className="mt-1 text-center text-xs text-black/50 print:mt-8">
          Thank you for your business.
        </p>
      </div>
    </div>
  );
}
