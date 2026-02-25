import Link from "next/link";
import { getSession } from "@/lib/auth";
import { toAuthScope } from "@/lib/auth";
import { clientWhere } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { getNextInvoiceNumber } from "../actions";
import { InvoiceForm } from "../_components/InvoiceForm";
import { createInvoice } from "../actions";

export const metadata = {
  title: "New Invoice | UMS Hub",
};

export default async function NewInvoicePage() {
  const { user } = await getSession();
  if (!user) return null;

  const scope = toAuthScope(user);
  const [clients, nextNumber] = await Promise.all([
    prisma.client.findMany({
      where: clientWhere(scope),
      orderBy: { companyName: "asc" },
      select: { id: true, companyName: true },
    }),
    getNextInvoiceNumber(),
  ]);

  const today = new Date().toISOString().slice(0, 10);
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  const dueDefault = nextMonth.toISOString().slice(0, 10);

  return (
    <section className="py-10">
      <div className="mb-6">
        <Link href="/hub/invoices" className="text-sm text-black/60 hover:text-black">
          ← Invoices
        </Link>
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">New invoice</h1>
      <p className="mt-2 text-sm text-black/70">
        Add line items; subtotal and VAT (15%) are calculated automatically.
      </p>
      <div className="mt-6 rounded-xl border border-black/10 bg-white p-6">
        <InvoiceForm
          action={createInvoice}
          clients={clients}
          defaultInvoiceNumber={nextNumber}
          defaultIssueDate={today}
          defaultDueDate={dueDefault}
          defaultIncludeVat={true}
          submitLabel="Create invoice (draft)"
          backHref="/hub/invoices"
        />
      </div>
    </section>
  );
}
