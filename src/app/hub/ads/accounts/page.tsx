import Link from "next/link";
import { getSession } from "@/lib/auth";
import { toAuthScope } from "@/lib/auth";
import { clientWhere } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { ConnectAdAccountForm } from "../_components/ConnectAdAccountForm";

export const metadata = {
  title: "Ad accounts | UMS Hub",
};

export default async function AdAccountsPage() {
  const { user } = await getSession();
  if (!user) return null;

  const scope = toAuthScope(user);

  const [adAccounts, clients] = await Promise.all([
    prisma.adAccount.findMany({
      where: { client: clientWhere(scope) },
      include: { client: { select: { companyName: true } } },
    }),
    prisma.client.findMany({
      where: clientWhere(scope),
      orderBy: { companyName: "asc" },
      select: { id: true, companyName: true },
    }),
  ]);

  return (
    <section className="py-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#050505]">
          Ad accounts
        </h1>
        <p className="mt-1 text-sm text-[#65676b]">
          Link Meta ad accounts to clients for campaign and insights access.
        </p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-[#e4e6eb] bg-white shadow-sm overflow-hidden">
            <div className="border-b border-[#e4e6eb] bg-[#f7f8fa] px-5 py-4">
              <h2 className="text-base font-semibold text-[#050505]">Connected accounts</h2>
            </div>
            {adAccounts.length === 0 ? (
              <div className="p-8 text-center text-sm text-[#65676b]">
                No ad accounts connected. Connect one below.
              </div>
            ) : (
              <ul className="divide-y divide-[#e4e6eb]">
                {adAccounts.map((acc) => (
                  <li key={acc.id} className="flex items-center justify-between px-5 py-4">
                    <div>
                      <p className="font-medium text-[#050505]">
                        {acc.accountName || acc.accountId}
                      </p>
                      <p className="text-sm text-[#65676b]">
                        {acc.client.companyName} · {acc.accountId}
                        {acc.currency && ` · ${acc.currency}`}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div>
          <ConnectAdAccountForm clients={clients} />
        </div>
      </div>
    </section>
  );
}
