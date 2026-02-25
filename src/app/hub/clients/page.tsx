import Link from "next/link";
import { getSession } from "@/lib/auth";
import { toAuthScope } from "@/lib/auth";
import { clientWhere } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Clients | UMS Hub",
};

export default async function HubClientsPage() {
  const { user } = await getSession();
  if (!user) return null;

  const scope = toAuthScope(user);
  const where = clientWhere(scope);

  const clients = await prisma.client.findMany({
    where,
    orderBy: { companyName: "asc" },
    select: {
      id: true,
      companyName: true,
      contactPerson: true,
      email: true,
      status: true,
    },
  });

  return (
    <section className="py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Clients</h1>
          <p className="mt-2 text-sm text-black/70">
            {user.role === "ADMIN"
              ? "All clients (admin view)."
              : `You have access to ${clients.length} client(s).`}
          </p>
        </div>
        <Link
          href="/hub/clients/new"
          className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black/90"
        >
          New client
        </Link>
      </div>
      <ul className="mt-6 space-y-3">
        {clients.length === 0 ? (
          <li className="rounded-lg border border-black/10 bg-white p-4 text-sm text-black/60">
            No clients in your scope.
          </li>
        ) : (
          clients.map((client) => (
            <li key={client.id}>
              <Link
                href={`/hub/clients/${client.id}`}
                className="block rounded-lg border border-black/10 bg-white p-4 transition hover:border-black/25 hover:bg-black/2"
              >
                <div className="font-medium">{client.companyName}</div>
                <div className="mt-1 text-sm text-black/70">
                  {client.contactPerson}
                  {client.email ? ` · ${client.email}` : ""}
                </div>
                <div className="mt-1 text-xs text-black/50">{client.status}</div>
              </Link>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
