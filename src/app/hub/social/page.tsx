import Link from "next/link";
import { getSession } from "@/lib/auth";
import { toAuthScope } from "@/lib/auth";
import { clientIdWhere, clientWhere } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { ConnectFacebookForm } from "./_components/ConnectFacebookForm";

export const metadata = {
  title: "Social | UMS Hub",
};

export default async function HubSocialPage() {
  const { user } = await getSession();
  if (!user) return null;

  const scope = toAuthScope(user);
  const clientScope = scope.role === "ADMIN" ? {} : { clientId: { in: scope.assignedClientIds ?? [] } };

  const [posts, pages, clients] = await Promise.all([
    prisma.socialPost.findMany({
      where: clientIdWhere(scope),
      orderBy: [{ status: "asc" }, { scheduledFor: "desc" }, { createdAt: "desc" }],
      include: {
        client: { select: { id: true, companyName: true } },
        socialPage: { select: { pageName: true } },
      },
    }),
    prisma.socialPage.findMany({
      where: { socialAccount: clientScope },
      include: { socialAccount: { select: { clientId: true } } },
    }),
    prisma.client.findMany({
      where: clientWhere(scope),
      orderBy: { companyName: "asc" },
      select: { id: true, companyName: true },
    }),
  ]);

  const connectedPages = pages;

  return (
    <section className="py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Social</h1>
          <p className="mt-2 text-sm text-black/70">
            Connect Facebook pages and schedule posts. The worker publishes at the scheduled time.
          </p>
        </div>
        <Link
          href="/hub/social/posts/new"
          className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black/90"
        >
          New post
        </Link>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-black/10 bg-white p-5">
            <h2 className="text-lg font-semibold">Scheduled & recent posts</h2>
            <div className="mt-4 overflow-x-auto">
              {posts.length === 0 ? (
                <p className="text-sm text-black/50">No posts yet. Connect a page and create a post.</p>
              ) : (
                <ul className="space-y-2">
                  {posts.map((post) => (
                    <li key={post.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-black/5 pb-2 last:border-0">
                      <Link href={`/hub/social/posts/${post.id}`} className="font-medium hover:underline line-clamp-1">
                        {post.caption.slice(0, 60)}{post.caption.length > 60 ? "…" : ""}
                      </Link>
                      <span className="flex items-center gap-2 text-sm text-black/60">
                        <span className={
                          post.status === "PUBLISHED" ? "text-green-600" :
                          post.status === "FAILED" ? "text-red-600" :
                          post.status === "SCHEDULED" ? "text-amber-600" : "text-black/50"
                        }>
                          {post.status}
                        </span>
                        {post.scheduledFor && (
                          <span>· {post.scheduledFor.toLocaleString("en-ZA", { dateStyle: "short", timeStyle: "short" })}</span>
                        )}
                        {post.client && (
                          <Link href={`/hub/clients/${post.client.id}`} className="hover:underline">
                            {post.client.companyName}
                          </Link>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <ConnectFacebookForm clients={clients} />
        </div>

        <div className="rounded-xl border border-black/10 bg-white p-5">
          <h2 className="text-lg font-semibold">Connected pages</h2>
          {connectedPages.length === 0 ? (
            <p className="mt-2 text-sm text-black/50">No Facebook pages connected. Use the form to connect one.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {connectedPages.map((p) => (
                <li key={p.id} className="text-sm">
                  <Link href={`/hub/clients/${p.socialAccount.clientId}`} className="font-medium hover:underline">
                    {p.pageName}
                  </Link>
                  <span className="text-black/50"> (Facebook)</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
