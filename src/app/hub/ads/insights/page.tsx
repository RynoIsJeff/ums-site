import { getSession } from "@/lib/auth";
import { toAuthScope } from "@/lib/auth";
import { clientWhere } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { BarChart3, ExternalLink } from "lucide-react";
import { ComingSoonPlaceholder } from "@/app/hub/_components/ComingSoonPlaceholder";

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
        <h1 className="text-2xl font-bold tracking-tight text-[var(--hub-text)]">
          Insights
        </h1>
        <p className="mt-1 text-sm text-[var(--hub-muted)]">
          Ad performance, spend, reach, and conversions. Coming soon.
        </p>
      </div>

      <div className="mt-12">
        <ComingSoonPlaceholder
          feature="Ad insights"
          description="View spend, impressions, clicks, and conversions from the Marketing API Insights."
          icon={BarChart3}
          iconClassName="text-green-600"
          supplemental={
            adAccounts.length === 0
              ? "Connect an ad account first."
              : `You have ${adAccounts.length} ad account(s) connected.`
          }
          primaryAction={{
            href: "https://business.facebook.com/adsmanager",
            label: "View in Ads Manager",
            external: true,
            meta: true,
            icon: ExternalLink,
          }}
          secondaryActions={[
            {
              href: "https://developers.facebook.com/docs/marketing-api/insights",
              label: "Insights API docs",
              external: true,
            },
          ]}
        />
      </div>
    </section>
  );
}
