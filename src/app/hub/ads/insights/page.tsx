import Link from "next/link";
import { getSession } from "@/lib/auth";
import { toAuthScope } from "@/lib/auth";
import { clientWhere } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { fetchAdAccountInsights } from "@/lib/meta-ads";
import { BarChart3 } from "lucide-react";

export const metadata = {
  title: "Insights | UMS Hub",
};

export default async function InsightsPage() {
  const { user } = await getSession();
  if (!user) return null;

  const scope = toAuthScope(user);
  const adAccounts = await prisma.adAccount.findMany({
    where: { client: clientWhere(scope) },
    include: { client: { select: { companyName: true } } },
  });

  const insightsData: {
    accountId: string;
    accountName: string;
    clientName: string;
    last7d: Awaited<ReturnType<typeof fetchAdAccountInsights>>;
    last30d: Awaited<ReturnType<typeof fetchAdAccountInsights>>;
  }[] = [];

  for (const acc of adAccounts) {
    const token = acc.accessTokenEncrypted;
    const last7d = token
      ? await fetchAdAccountInsights(acc.accountId, token, "last_7d")
      : { ok: false as const, error: "No access token" };
    const last30d = token
      ? await fetchAdAccountInsights(acc.accountId, token, "last_30d")
      : { ok: false as const, error: "No access token" };

    insightsData.push({
      accountId: acc.accountId,
      accountName: acc.accountName ?? acc.accountId,
      clientName: acc.client.companyName,
      last7d,
      last30d,
    });
  }

  const totalSpend7d = insightsData.reduce((s, d) => {
    if (d.last7d.ok) return s + d.last7d.data.spend;
    return s;
  }, 0);
  const totalSpend30d = insightsData.reduce((s, d) => {
    if (d.last30d.ok) return s + d.last30d.data.spend;
    return s;
  }, 0);
  const totalImpressions30d = insightsData.reduce((s, d) => {
    if (d.last30d.ok) return s + d.last30d.data.impressions;
    return s;
  }, 0);

  return (
    <section className="py-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-(--hub-text)">
          Insights
        </h1>
        <p className="mt-1 text-sm text-(--hub-muted)">
          Ad performance from Meta Marketing API.
        </p>
      </div>

      {adAccounts.length === 0 ? (
        <div className="mt-12 rounded-xl border border-(--hub-border-light) bg-white p-12 text-center">
          <BarChart3 className="mx-auto h-12 w-12 text-(--hub-muted)" />
          <p className="mt-3 font-medium text-(--hub-text)">No ad accounts connected</p>
          <Link href="/hub/ads/accounts" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-(--meta-blue) px-4 py-2 text-sm font-medium text-white hover:bg-(--meta-blue-hover)">
            Connect ad account
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-(--hub-border-light) bg-white p-5 shadow-sm">
              <p className="text-2xl font-bold text-(--hub-text)">{formatCurrency(totalSpend7d)}</p>
              <p className="text-sm text-(--hub-muted)">Spend (7d)</p>
            </div>
            <div className="rounded-xl border border-(--hub-border-light) bg-white p-5 shadow-sm">
              <p className="text-2xl font-bold text-(--hub-text)">{formatCurrency(totalSpend30d)}</p>
              <p className="text-sm text-(--hub-muted)">Spend (30d)</p>
            </div>
            <div className="rounded-xl border border-(--hub-border-light) bg-white p-5 shadow-sm">
              <p className="text-2xl font-bold text-(--hub-text)">{totalImpressions30d.toLocaleString()}</p>
              <p className="text-sm text-(--hub-muted)">Impressions (30d)</p>
            </div>
          </div>
          <div className="mt-8 space-y-6">
            {insightsData.map((d) => (
              <div key={d.accountId} className="rounded-xl border border-(--hub-border-light) bg-white p-6 shadow-sm">
                <h2 className="font-semibold text-(--hub-text)">{d.accountName}</h2>
                <p className="text-sm text-(--hub-muted)">{d.clientName}</p>
                {(d.last7d.ok || d.last30d.ok) ? (
                  <div className="mt-4 grid gap-4 sm:grid-cols-4">
                    {d.last7d.ok && (
                      <>
                        <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-(--hub-muted)">Spend (7d)</p><p className="font-semibold">{formatCurrency(d.last7d.data.spend)}</p></div>
                        <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-(--hub-muted)">Impressions (7d)</p><p className="font-semibold">{d.last7d.data.impressions.toLocaleString()}</p></div>
                        <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-(--hub-muted)">Clicks (7d)</p><p className="font-semibold">{d.last7d.data.clicks.toLocaleString()}</p></div>
                      </>
                    )}
                    {d.last30d.ok && (
                      <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-(--hub-muted)">Spend (30d)</p><p className="font-semibold">{formatCurrency(d.last30d.data.spend)}</p></div>
                    )}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-amber-600">Add an access token to fetch insights.</p>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", minimumFractionDigits: 2 }).format(n);
}
