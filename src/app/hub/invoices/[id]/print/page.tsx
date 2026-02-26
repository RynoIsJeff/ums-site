import { getSession } from "@/lib/auth";
import { toAuthScope } from "@/lib/auth";
import { canAccessClient } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { toNum } from "@/lib/utils";

type PageProps = { params: Promise<{ id: string }> };

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

  const total = toNum(invoice.totalAmount);
  const issueDateStr = invoice.issueDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div
      className="min-h-screen bg-white p-8 print:p-6"
      style={{ fontFamily: "system-ui, sans-serif" }}
    >
      <div className="mx-auto max-w-2xl">
        {/* UMS branding - logo + company name */}
        <div className="mb-6 flex items-start gap-4">
          <img
            src="/ums-logo.svg"
            alt="UMS"
            className="h-12 w-12 shrink-0 print:h-12 print:w-12"
          />
          <div>
            <div className="leading-tight">
              <span className="block text-lg font-bold tracking-tight">
                ULTIMATE MARKETING{" "}
                <span style={{ color: "#0586AD" }}>SMASH</span>
              </span>
              <span className="block text-xs font-medium uppercase tracking-widest text-black/60">
                (PTY) LTD.
              </span>
            </div>
            <p className="mt-2 text-sm">+27 79 490 5070</p>
            <p className="text-sm">Manager@ultimatemarketingsmash.com</p>
            <p className="mt-1 text-sm">
              447 Suikerbekkie Ave, Pongola,
              <br />
              3170, KZN, South Africa
            </p>
          </div>
        </div>
        <div
          className="mb-6 h-0.5 w-full"
          style={{
            background: "linear-gradient(90deg, #0586AD, #02D6E4)",
          }}
        />

        {/* Invoice title, date, number - right aligned */}
        <div className="mb-8 flex justify-between border-b border-black/20 pb-4">
          <span className="text-lg font-semibold">Invoice</span>
          <div className="text-right text-sm">
            <p>{issueDateStr}</p>
            <p className="mt-1 font-medium">Invoice Number: {invoice.invoiceNumber}</p>
          </div>
        </div>

        {/* To: Client */}
        <div className="mb-8">
          <p className="text-sm font-medium">
            To: {invoice.client.companyName}
          </p>
        </div>

        {/* Line items table: Description | Qty | Unit price | Price */}
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-black/20">
              <th className="pb-2 text-left font-medium">Description</th>
              <th className="pb-2 text-right font-medium">Qty</th>
              <th className="pb-2 text-right font-medium">Unit price</th>
              <th className="pb-2 text-right font-medium">Price</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lineItems.map((line) => (
              <tr key={line.id} className="border-b border-black/10">
                <td className="py-3">{line.description}</td>
                <td className="py-3 text-right">{Number(line.quantity)}</td>
                <td className="py-3 text-right">
                  R {toNum(line.unitPrice).toLocaleString("en-ZA")}
                </td>
                <td className="py-3 text-right">
                  R {toNum(line.lineTotal).toLocaleString("en-ZA")}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-black/20 font-semibold">
              <td className="py-3" colSpan={3}>TOTAL</td>
              <td className="py-3 text-right">
                R {total.toLocaleString("en-ZA")}
              </td>
            </tr>
          </tfoot>
        </table>

        {/* Bank details */}
        <div className="mt-10 space-y-1 text-sm">
          <p>
            Pay to: First National Bank (FNB)
          </p>
          <p>Account Number: 63067511387</p>
          <p>Branch Code: 250655</p>
          <p className="mt-4 font-medium">PAYMENT METHODS:</p>
        </div>

        {invoice.notes && (
          <div className="mt-8 border-t border-black/10 pt-6 text-sm text-black/70">
            <p className="font-medium text-black/60">Notes</p>
            <p className="mt-1 whitespace-pre-wrap">{invoice.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
