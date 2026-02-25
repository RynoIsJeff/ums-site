import Link from "next/link";
import { getSession } from "@/lib/auth";
import { toAuthScope } from "@/lib/auth";
import { canAccessClient } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ClientForm } from "../../_components/ClientForm";
import { updateClient } from "../../actions";
import type { ClientFormState } from "../../actions";

export const metadata = {
  title: "Edit Client | UMS Hub",
};

type PageProps = { params: Promise<{ id: string }> };

function formatDate(d: Date | null): string {
  if (!d) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default async function EditClientPage({ params }: PageProps) {
  const { id: clientId } = await params;
  const { user } = await getSession();
  if (!user) return null;

  const scope = toAuthScope(user);
  if (!canAccessClient(scope, clientId)) notFound();

  const client = await prisma.client.findFirst({
    where: { id: clientId },
  });
  if (!client) notFound();

  const boundUpdateClient = (prev: ClientFormState, formData: FormData) =>
    updateClient(clientId, prev, formData);

  const defaultValues = {
    companyName: client.companyName,
    contactPerson: client.contactPerson,
    email: client.email ?? "",
    phone: client.phone ?? "",
    vatNumber: client.vatNumber ?? "",
    billingAddress: client.billingAddress ?? "",
    planLabel: client.planLabel ?? "",
    startDate: client.startDate ? formatDate(client.startDate) : "",
    renewalDate: client.renewalDate ? formatDate(client.renewalDate) : "",
    billingFrequency: client.billingFrequency ?? "",
    retainerAmount: client.retainerAmount != null ? String(client.retainerAmount) : "",
    notes: client.notes ?? "",
    status: client.status,
  };

  return (
    <section className="py-10">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href={`/hub/clients/${client.id}`}
          className="text-sm text-black/60 hover:text-black"
        >
          ← {client.companyName}
        </Link>
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">Edit client</h1>
      <p className="mt-1 text-sm text-black/70">
        Update client details. Required fields are marked with *.
      </p>
      <div className="mt-6 rounded-xl border border-black/10 bg-white p-6">
        <ClientForm
          action={boundUpdateClient}
          defaultValues={defaultValues}
          submitLabel="Save changes"
          backHref={`/hub/clients/${client.id}`}
        />
      </div>
    </section>
  );
}
