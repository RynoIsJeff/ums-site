import Link from "next/link";
import { getSession } from "@/lib/auth";
import { toAuthScope } from "@/lib/auth";
import { clientIdWhere } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Invoices | UMS Hub",
};

function toNum(d: unknown): number {
  if (d == null) return 0;
  if (typeof d === "number" && !Number.isNaN(d)) return d;
  return Number(d) || 0;
}

export default async function HubInvoicesPage() {
  const { user } = await getSession();
  if (!user) return null;

  const scope = toAuthScope(user);
  const where = clientIdWhere(scope);

  const invoices = await prisma.invoice.findMany({
    where,
    orderBy: [{ status: "asc" }, { dueDate: "desc" }],
    include: { client: { select: { id: true, companyName: true } } },
  });

  return (
    <section className="py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Invoices</h1>
          <p className="mt-2 text-sm text-black/70">
            Create and manage invoices. Drafts can be edited; mark as Sent when ready.
          </p>
        </div>
        <Link
          href="/hub/invoices/new"
          className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black/90"
        >
          New invoice
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[600px] border-collapse rounded-xl border border-black/10 bg-white text-sm">
          <thead>
            <tr className="border-b border-black/10 text-left">
              <th className="p-3 font-medium">Number</th>
              <th className="p-3 font-medium">Client</th>
              <th className="p-3 font-medium">Due date</th>
              <th className="p-3 font-medium">Amount</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium" aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-black/50">
                  No invoices yet. Create one to get started.
                </td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-black/5 hover:bg-black/[0.02]">
                  <td className="p-3">
                    <Link
                      href={`/hub/invoices/${inv.id}`}
                      className="font-medium hover:underline"
                    >
                      {inv.invoiceNumber}
                    </Link>
                  </td>
                  <td className="p-3">
                    <Link
                      href={`/hub/clients/${inv.client.id}`}
                      className="text-black/70 hover:underline"
                    >
                      {inv.client.companyName}
                    </Link>
                  </td>
                  <td className="p-3">
                    {inv.dueDate.toLocaleDateString("en-ZA", { dateStyle: "medium" })}
                  </td>
                  <td className="p-3">R {toNum(inv.totalAmount).toLocaleString("en-ZA")}</td>
                  <td className="p-3">
                    <span
                      className={
                        inv.status === "PAID"
                          ? "text-green-600"
                          : inv.status === "OVERDUE"
                            ? "text-red-600"
                            : inv.status === "SENT"
                              ? "text-amber-600"
                              : "text-black/60"
                      }
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <Link
                      href={`/hub/invoices/${inv.id}/print`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-black/60 hover:underline"
                    >
                      Print
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
