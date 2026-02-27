import Link from "next/link";
import { getSession } from "@/lib/auth";
import { toAuthScope } from "@/lib/auth";
import { clientWhere } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { fetchAdAccountCampaigns } from "@/lib/meta-ads";
import { Target, ExternalLink } from "lucide-react";

export const metadata = {
  title: "Campaigns | UMS Hub",
};

export default async function CampaignsPage() {
  const { user } = await getSession();
  if (!user) return null;

  const scope = toAuthScope(user);
  const adAccounts = await prisma.adAccount.findMany({
    where: { client: clientWhere(scope) },
    include: { client: { select: { companyName: true } } },
  });

  const campaignsByAccount: {
    accountId: string;
    accountName: string;
    clientName: string;
    campaigns: { id: string; name: string; status: string; objective?: string }[];
    error?: string;
  }[] = [];

  for (const acc of adAccounts) {
    const token = acc.accessTokenEncrypted;
    if (token) {
      const result = await fetchAdAccountCampaigns(acc.accountId, token);
      campaignsByAccount.push({
        accountId: acc.accountId,
        accountName: acc.accountName ?? acc.accountId,
        clientName: acc.client.companyName,
        campaigns: result.ok ? result.campaigns : [],
        error: result.ok ? undefined : result.error,
      });
    } else {
      campaignsByAccount.push({
        accountId: acc.accountId,
        accountName: acc.accountName ?? acc.accountId,
        clientName: acc.client.companyName,
        campaigns: [],
        error: "No access token — add one to view campaigns",
      });
    }
  }

  const totalCampaigns = campaignsByAccount.reduce(
    (s, a) => s + a.campaigns.length,
    0
  );

  return (
    <section className="py-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-(--hub-text)">
          Campaigns
        </h1>
        <p className="mt-1 text-sm text-(--hub-muted)">
          View Meta ad campaigns from connected accounts.
        </p>
      </div>

      {adAccounts.length === 0 ? (
        <div className="mt-12 rounded-xl border border-(--hub-border-light) bg-white p-12 text-center">
          <Target className="mx-auto h-12 w-12 text-(--hub-muted)" />
          <p className="mt-3 font-medium text-(--hub-text)">
            No ad accounts connected
          </p>
          <p className="mt-1 text-sm text-(--hub-muted)">
            Connect an ad account to view campaigns.
          </p>
          <Link
            href="/hub/ads/accounts"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-(--meta-blue) px-4 py-2 text-sm font-medium text-white hover:bg-(--meta-blue-hover)"
          >
            Connect ad account
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-8 rounded-xl border border-(--hub-border-light) bg-white p-5 shadow-sm">
            <p className="text-2xl font-bold text-(--hub-text)">
              {totalCampaigns}
            </p>
            <p className="text-sm text-(--hub-muted)">Total campaigns</p>
          </div>

          <div className="mt-8 space-y-6">
            {campaignsByAccount.map((acc) => (
              <div
                key={acc.accountId}
                className="rounded-xl border border-(--hub-border-light) bg-white overflow-hidden shadow-sm"
              >
                <div className="flex items-center justify-between border-b border-(--hub-border-light) bg-slate-50 px-6 py-4">
                  <div>
                    <h2 className="font-semibold text-(--hub-text)">
                      {acc.accountName}
                    </h2>
                    <p className="text-sm text-(--hub-muted)">
                      {acc.clientName} · {acc.accountId}
                    </p>
                  </div>
                  <a
                    href="https://business.facebook.com/adsmanager"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-(--meta-blue) hover:underline inline-flex items-center gap-1"
                  >
                    Ads Manager
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <div className="p-6">
                  {acc.error ? (
                    <p className="text-sm text-amber-600">{acc.error}</p>
                  ) : acc.campaigns.length === 0 ? (
                    <p className="text-sm text-(--hub-muted)">
                      No campaigns in this account.
                    </p>
                  ) : (
                    <ul className="divide-y divide-(--hub-border-light)">
                      {acc.campaigns.map((c) => (
                        <li
                          key={c.id}
                          className="flex items-center justify-between py-3 first:pt-0"
                        >
                          <div>
                            <p className="font-medium text-(--hub-text)">
                              {c.name}
                            </p>
                            <p className="text-xs text-(--hub-muted)">
                              {c.objective ?? "—"} · {c.status}
                            </p>
                          </div>
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              c.status === "ACTIVE"
                                ? "bg-green-100 text-green-800"
                                : c.status === "PAUSED"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {c.status}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
