import { getSession, toAuthScope } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ResetForm } from "./_components/ResetForm";

const MIN_NUM = 124; // delete invoices 0124 and above

function parseInvoiceNum(invoiceNumber: string, prefix: string): number {
  const s = prefix ? invoiceNumber.replace(prefix, "") : invoiceNumber;
  const m = s.match(/^0*(\d{1,6})$/);
  return m ? parseInt(m[1], 10) : -1;
}

export default async function RetainerResetPage() {
  const { user } = await getSession();
  if (!user) return null;
  const scope = toAuthScope(user);
  if (scope.role !== "ADMIN") notFound();

  const config = await prisma.companyConfig.findFirst();
  const prefix = config?.invoicePrefix?.trim() ?? "";

  const allInvoices = await prisma.invoice.findMany({
    select: {
      invoiceNumber: true,
      totalAmount: true,
      client: { select: { companyName: true } },
    },
    orderBy: { invoiceNumber: "asc" },
  });

  const toDelete = allInvoices
    .filter((inv) => parseInvoiceNum(inv.invoiceNumber, prefix) >= MIN_NUM)
    .map((inv) => ({
      invoiceNumber: inv.invoiceNumber,
      client: inv.client?.companyName ?? "—",
      total: Number(inv.totalAmount).toLocaleString("en-ZA"),
    }));

  return (
    <section className="py-10 max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">Reset retainer invoices</h1>
      <p className="mt-1 text-sm text-black/60">
        Deletes invoices {String(MIN_NUM).padStart(4, "0")} and above, then re-generates this
        month&apos;s retainer invoices for all active clients from their current line items.
      </p>
      <div className="mt-6">
        <ResetForm minNum={MIN_NUM} toDeletePreview={toDelete} />
      </div>
    </section>
  );
}
