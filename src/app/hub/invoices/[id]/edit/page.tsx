import Link from "next/link";
import { getSession } from "@/lib/auth";
import { toAuthScope } from "@/lib/auth";
import { canAccessClient, clientWhere } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { InvoiceForm } from "../../_components/InvoiceForm";
import { updateInvoice } from "../../actions";
import { Breadcrumbs } from "@/app/hub/_components/Breadcrumbs";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    select: { invoiceNumber: true },
  });
  if (!invoice) return { title: "Edit Invoice | UMS Hub" };
  return { title: `Edit Invoice ${invoice.invoiceNumber} | UMS Hub` };
}

function toNum(d: unknown): number {
  if (d == null) return 0;
  if (typeof d === "number" && !Number.isNaN(d)) return d;
  return Number(d) || 0;
}

export default async function EditInvoicePage({ params }: PageProps) {
  const { id } = await params;
  const { user } = await getSession();
  if (!user) return null;

  const scope = toAuthScope(user);
  const [invoice, clients] = await Promise.all([
    prisma.invoice.findUnique({
      where: { id },
      include: { lineItems: { orderBy: { createdAt: "asc" } } },
    }),
    prisma.client.findMany({
      where: clientWhere(scope),
      orderBy: { companyName: "asc" },
      select: { id: true, companyName: true },
    }),
  ]);

  if (!invoice || !canAccessClient(scope, invoice.clientId)) notFound();
  if (invoice.status !== "DRAFT") notFound();

  const defaultLineItems = invoice.lineItems.map((line) => ({
    description: line.description,
    quantity: toNum(line.quantity),
    unitPrice: toNum(line.unitPrice),
  }));

  const updateAction = updateInvoice.bind(null, id);

  return (
    <section className="py-10">
      <div className="mb-6">
        <Breadcrumbs
          items={[
            { label: "Hub", href: "/hub" },
            { label: "Invoices", href: "/hub/invoices" },
            { label: invoice.invoiceNumber, href: `/hub/invoices/${id}` },
            { label: "Edit" },
          ]}
        />
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">Edit invoice</h1>
      <p className="mt-2 text-sm text-black/70">
        Invoice number cannot be changed. Update line items and dates as needed.
      </p>
      <div className="mt-6 rounded-xl border border-black/10 bg-white p-6">
        <InvoiceForm
          action={updateAction}
          clients={clients}
          defaultInvoiceNumber={invoice.invoiceNumber}
          defaultIssueDate={invoice.issueDate.toISOString().slice(0, 10)}
          defaultDueDate={invoice.dueDate.toISOString().slice(0, 10)}
          defaultLineItems={defaultLineItems}
          defaultNotes={invoice.notes ?? ""}
          defaultClientId={invoice.clientId}
          submitLabel="Save changes"
          backHref={`/hub/invoices/${id}`}
        />
      </div>
    </section>
  );
}
