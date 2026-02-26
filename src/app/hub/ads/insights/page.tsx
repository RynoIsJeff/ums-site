import { getSession } from "@/lib/auth";
import { toAuthScope } from "@/lib/auth";
import { clientWhere } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { BarChart3, ExternalLink } from "lucide-react";

export const metadata = {
  title: "Insights | UMS Hub",
};

export default async function InsightsPage() {
  const { user } = await getSession();
  if (!user) return null;

  const scope = toAuthScope(user);
  const adAccounts = await prisma.adAccount.findMany({
    where: { client: clientWhere(scope) },
  });

  return (
    <section className="py-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#050505]">
          Insights
        </h1>
        <p className="mt-1 text-sm text-[#65676b]">
          Ad performance, spend, reach, and conversions. Coming soon.
        </p>
      </div>

      <div className="mt-12 rounded-xl border border-[#e4e6eb] bg-white p-12 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
          <BarChart3 className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="mt-6 text-lg font-semibold text-[#050505]">
          Ad insights coming soon
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-[#65676b]">
          View spend, impressions, clicks, and conversions from the Marketing API Insights.
          {adAccounts.length === 0
            ? " Connect an ad account first."
            : ` You have ${adAccounts.length} ad account(s) connected.`}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <a
            href="https://business.facebook.com/adsmanager"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-[#1877F2] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#166fe5]"
          >
            <ExternalLink className="h-4 w-4" />
            View in Ads Manager
          </a>
          <a
            href="https://developers.facebook.com/docs/marketing-api/insights"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-[#e4e6eb] bg-white px-4 py-2.5 text-sm font-medium hover:bg-[#f0f2f5]"
          >
            Insights API docs
          </a>
        </div>
      </div>
    </section>
  );
}
