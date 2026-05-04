import { notFound } from "next/navigation";
import { getSession, toAuthScope } from "@/lib/auth";
import { canAccessClient } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { Breadcrumbs } from "@/app/hub/_components/Breadcrumbs";
import { EditPaymentForm } from "../../_components/EditPaymentForm";
import { toNum } from "@/lib/utils";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const payment = await prisma.payment.findUnique({
    where: { id },
    select: { client: { select: { companyName: true } } },
  });
  if (!payment) return { title: "Edit Payment | UMS Hub" };
  return { title: `Edit Payment — ${payment.client.companyName} | UMS Hub` };
}

export default async function EditPaymentPage({ params }: PageProps) {
  const { id } = await params;
  const { user } = await getSession();
  if (!user) return null;

  const scope = toAuthScope(user);

  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, companyName: true } },
      allocations: {
        include: { invoice: { select: { id: true, invoiceNumber: true, totalAmount: true } } },
      },
    },
  });

  if (!payment || !canAccessClient(scope, payment.clientId)) notFound();

  // Build the set of invoice IDs currently allocated to this payment
  const allocatedInvoiceIds = new Set(payment.allocations.map((a) => a.invoiceId));

  // Load invoices that are either currently allocated (any status) or still unpaid/partial
  const [allocatedInvoices, unpaidInvoices] = await Promise.all([
    // Already-allocated invoices (may be PAID because of this payment)
    prisma.invoice.findMany({
      where: { id: { in: Array.from(allocatedInvoiceIds) }, clientId: payment.clientId },
      select: {
        id: true,
        invoiceNumber: true,
        totalAmount: true,
        allocations: { where: { paymentId: { not: id } }, select: { allocatedAmount: true } },
      },
    }),
    // SENT/OVERDUE invoices not already allocated to this payment
    prisma.invoice.findMany({
      where: {
        clientId: payment.clientId,
        status: { in: ["SENT", "OVERDUE"] },
        id: { notIn: Array.from(allocatedInvoiceIds) },
      },
      select: {
        id: true,
        invoiceNumber: true,
        totalAmount: true,
        allocations: { where: { paymentId: { not: id } }, select: { allocatedAmount: true } },
      },
    }),
  ]);

  // Combine and compute remaining balance excluding this payment's allocation
  const allInvoices = [...allocatedInvoices, ...unpaidInvoices].map((inv) => {
    const otherAllocated = inv.allocations.reduce((s, a) => s + toNum(a.allocatedAmount), 0);
    const remaining = Math.max(0, toNum(inv.totalAmount) - otherAllocated);
    return { id: inv.id, invoiceNumber: inv.invoiceNumber, remainingAmount: remaining.toFixed(2) };
  });

  const currentAllocations = payment.allocations.map((a) => ({
    invoiceId: a.invoiceId,
    invoiceNumber: a.invoice.invoiceNumber,
    allocatedAmount: toNum(a.allocatedAmount).toFixed(2),
  }));

  const paidAtStr = payment.paidAt.toISOString().slice(0, 10);

  return (
    <section className="py-10">
      <Breadcrumbs
        items={[
          { label: "Hub", href: "/hub" },
          { label: "Payments", href: "/hub/payments" },
          { label: "Edit payment" },
        ]}
      />
      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-(--hub-text)">Edit payment</h1>
      <p className="mt-1 text-sm text-(--hub-muted)">{payment.client.companyName}</p>

      <div className="mt-6 max-w-lg rounded-xl border border-(--hub-border-light) bg-white p-6">
        <EditPaymentForm
          paymentId={id}
          clientName={payment.client.companyName}
          defaultAmount={toNum(payment.amount).toFixed(2)}
          defaultPaidAt={paidAtStr}
          defaultMethod={payment.method}
          defaultReference={payment.reference ?? ""}
          defaultNotes={payment.notes ?? ""}
          currentAllocations={currentAllocations}
          availableInvoices={allInvoices}
        />
      </div>
    </section>
  );
}
