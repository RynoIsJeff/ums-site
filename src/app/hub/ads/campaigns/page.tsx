import { getSession } from "@/lib/auth";
import { toAuthScope } from "@/lib/auth";
import { clientWhere } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { Target, ExternalLink } from "lucide-react";
import { ComingSoonPlaceholder } from "@/app/hub/_components/ComingSoonPlaceholder";

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

  return (
    <section className="py-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--hub-text)]">
          Campaigns
        </h1>
        <p className="mt-1 text-sm text-[var(--hub-muted)]">
          View and manage your Meta ad campaigns. Coming soon.
        </p>
      </div>

      <div className="mt-12">
        <ComingSoonPlaceholder
          feature="Campaign management"
          description="Create, pause, and manage campaigns from the Hub using the Marketing API."
          icon={Target}
          iconClassName="text-[var(--meta-blue)]"
          supplemental={
            adAccounts.length === 0
              ? "Connect an ad account first."
              : `You have ${adAccounts.length} ad account(s) connected.`
          }
          primaryAction={{
            href: "https://business.facebook.com/adsmanager",
            label: "Open Ads Manager",
            external: true,
            meta: true,
            icon: ExternalLink,
          }}
          secondaryActions={[
            {
              href: "https://developers.facebook.com/docs/marketing-api/reference/ad-campaign-group",
              label: "Campaigns API docs",
              external: true,
            },
          ]}
        />
      </div>
    </section>
  );
}
