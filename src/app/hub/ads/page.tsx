import Link from "next/link";
import { getSession } from "@/lib/auth";
import { toAuthScope } from "@/lib/auth";
import { clientWhere } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { Megaphone, Building2, Target, BarChart3, ExternalLink } from "lucide-react";

export const metadata = {
  title: "Ads | UMS Hub",
};

export default async function AdsOverviewPage() {
  const { user } = await getSession();
  if (!user) return null;

  const scope = toAuthScope(user);
  const adAccounts = await prisma.adAccount.findMany({
    where: { client: clientWhere(scope) },
    include: { client: { select: { companyName: true } } },
  });

  return (
    <section className="py-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-(--hub-text)">
          Meta Ads
        </h1>
        <p className="mt-1 text-sm text-(--hub-muted)">
          Manage Facebook & Instagram ad campaigns and insights.
        </p>
      </div>

      {/* Quick stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-(--hub-border-light) bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-(--meta-blue)/10">
              <Building2 className="h-5 w-5 text-(--meta-blue)" />
            </div>
            <div>
              <p className="text-2xl font-bold text-(--hub-text)">{adAccounts.length}</p>
              <p className="text-sm text-(--hub-muted)">Ad accounts</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-(--hub-border-light) bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
              <Target className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-(--hub-text)">0</p>
              <p className="text-sm text-(--hub-muted)">Active campaigns</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-(--hub-border-light) bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
              <BarChart3 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-(--hub-text)">N/A</p>
              <p className="text-sm text-(--hub-muted)">Spend (MTD)</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-(--hub-border-light) bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50">
              <Megaphone className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-(--hub-text)">N/A</p>
              <p className="text-sm text-(--hub-muted)">Reach (MTD)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Connected accounts */}
      <div className="mt-8 rounded-xl border border-(--hub-border-light) bg-white shadow-sm overflow-hidden">
        <div className="border-b border-(--hub-border-light) bg-black/2 px-5 py-4">
          <h2 className="text-base font-semibold text-(--hub-text)">Connected ad accounts</h2>
          <p className="text-sm text-(--hub-muted)">Link Meta ad accounts to clients for campaign management</p>
        </div>
        <div className="divide-y divide-(--hub-border-light)">
          {adAccounts.length === 0 ? (
            <div className="p-8 text-center">
              <Building2 className="mx-auto h-12 w-12 text-(--hub-muted)" />
              <p className="mt-3 text-sm font-medium text-(--hub-text)">No ad accounts connected</p>
              <p className="mt-1 text-sm text-(--hub-muted)">
                Connect your first ad account to view campaigns and insights.
              </p>
              <Link
                href="/hub/ads/accounts"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-(--meta-blue) px-4 py-2 text-sm font-medium text-white hover:bg-(--meta-blue-hover)"
              >
                Connect ad account
              </Link>
            </div>
          ) : (
            adAccounts.map((acc) => (
              <div
                key={acc.id}
                className="flex items-center justify-between px-5 py-4"
              >
                <div>
                  <p className="font-medium text-(--hub-text)">
                    {acc.accountName || acc.accountId}
                  </p>
                  <p className="text-sm text-(--hub-muted)">
                    {acc.client.companyName} · {acc.accountId}
                  </p>
                </div>
                <a
                  href="https://business.facebook.com/adsmanager"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-medium text-(--meta-blue) hover:underline"
                >
                  Ads Manager
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Setup guide */}
      <div className="mt-8 rounded-xl border border-(--hub-border-light) bg-black/2 p-6">
        <h3 className="font-semibold text-(--hub-text)">Getting started with Marketing API</h3>
        <p className="mt-2 text-sm text-(--hub-muted)">
          {process.env.META_APP_ID && process.env.META_BUSINESS_ID ? (
            <>
              Your app (App ID: {process.env.META_APP_ID}) and business (ID: {process.env.META_BUSINESS_ID}) are set up.
            </>
          ) : (
            <>
              Set <code className="rounded bg-white px-1.5 py-0.5 text-xs">META_APP_ID</code> and{" "}
              <code className="rounded bg-white px-1.5 py-0.5 text-xs">META_BUSINESS_ID</code> in your environment to display your app and business IDs here.
            </>
          )}{" "}
          Connect ad accounts and ensure your access token has{" "}
          <code className="rounded bg-white px-1.5 py-0.5 text-xs">ads_management</code> and{" "}
          <code className="rounded bg-white px-1.5 py-0.5 text-xs">business_management</code> permissions.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href="https://developers.facebook.com/docs/marketing-api/get-started"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-(--meta-blue) px-4 py-2 text-sm font-medium text-white hover:bg-(--meta-blue-hover)"
          >
            <ExternalLink className="h-4 w-4" />
            Marketing API guide
          </a>
          <a
            href="https://business.facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-(--hub-border-light) bg-white px-4 py-2 text-sm font-medium hover:bg-black/5"
          >
            Meta Business Suite
          </a>
        </div>
      </div>
    </section>
  );
}
