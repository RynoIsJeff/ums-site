import Link from "next/link";
import { getSession } from "@/lib/auth";
import { toAuthScope } from "@/lib/auth";
import { clientIdWhere, clientWhere } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { PageCard } from "../_components/PageCard";
import { ConnectFacebookForm } from "../_components/ConnectFacebookForm";

export const metadata = {
  title: "Pages | UMS Hub",
};

export default async function SocialPagesPage() {
  const { user } = await getSession();
  if (!user) return null;

  const scope = toAuthScope(user);

  const [pages, clients] = await Promise.all([
    prisma.socialPage.findMany({
      where: { socialAccount: clientIdWhere(scope), provider: "META" },
      include: {
        socialAccount: {
          select: { clientId: true, client: { select: { companyName: true } } },
        },
      },
    }),
    prisma.client.findMany({
      where: clientWhere(scope),
      orderBy: { companyName: "asc" },
      select: { id: true, companyName: true },
    }),
  ]);

  return (
    <section className="py-6">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--hub-text)]">
            Facebook pages
          </h1>
          <p className="mt-1 text-sm text-[var(--hub-muted)]">
            Manage profile and cover photos for your connected pages.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {pages.map((page) => {
          const metadata = (page.metadata ?? {}) as Record<string, string | undefined>;
          return (
            <PageCard
              key={page.id}
              page={{
                id: page.id,
                pageName: page.pageName,
                pageExternalId: page.pageExternalId,
                clientName: page.socialAccount.client.companyName,
                clientId: page.socialAccount.clientId,
                profilePictureUrl: metadata.profilePictureUrl,
                coverPhotoUrl: metadata.coverPhotoUrl,
              }}
            />
          );
        })}
      </div>

      {pages.length === 0 && (
        <div className="mt-12 rounded-xl border-2 border-dashed border-[var(--hub-border-light)] bg-black/[0.02] p-12 text-center">
          <p className="text-base font-medium text-[var(--hub-text)]">No Facebook pages connected</p>
          <p className="mt-2 text-sm text-[var(--hub-muted)]">
            Connect your first page below to manage profile and cover photos.
          </p>
        </div>
      )}

      <div className="mt-12 max-w-xl">
        <h2 className="text-lg font-semibold text-[var(--hub-text)]">Connect new page</h2>
        <p className="mt-1 text-sm text-[var(--hub-muted)] mb-4">
          Add a Facebook page to manage its profile, cover, and schedule posts.
        </p>
        <ConnectFacebookForm clients={clients} />
      </div>
    </section>
  );
}
