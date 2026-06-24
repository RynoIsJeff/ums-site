import { getSession } from "@/lib/auth";
import { clientWhere, canAccessClient } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { PostsTable } from "./_components/PostsTable";

type PostsPageProps = {
  searchParams: Promise<{ page?: string; status?: string }>;
};

export default async function PostsPage({ searchParams }: PostsPageProps) {
  const { user } = await getSession();
  if (!user) return null;

  const { page: selectedPageId = "", status: selectedStatus = "" } = await searchParams;

  const posts = await prisma.socialPost.findMany({
    where: {
      client: {
        ...clientWhere({ userId: user.id, role: user.role, assignedClientIds: user.assignedClientIds }),
      },
    },
    orderBy: { createdAt: "desc" },
    take: 500,
    select: {
      id: true,
      caption: true,
      status: true,
      scheduledFor: true,
      publishedAt: true,
      externalPostId: true,
      publishedUrl: true,
      client: { select: { companyName: true } },
      socialPage: { select: { id: true, pageName: true } },
    },
  });

  const pages = await prisma.socialPage.findMany({
    where: {
      socialAccount: {
        client: {
          ...clientWhere({ userId: user.id, role: user.role, assignedClientIds: user.assignedClientIds }),
        },
      },
    },
    orderBy: { pageName: "asc" },
    select: { id: true, pageName: true },
  });

  const serialisedPosts = posts.map((p) => ({
    id: p.id,
    caption: p.caption,
    status: p.status,
    scheduledFor: p.scheduledFor?.toISOString() ?? null,
    publishedAt: p.publishedAt?.toISOString() ?? null,
    pageName: p.socialPage?.pageName ?? "—",
    pageId: p.socialPage?.id ?? "",
    clientName: p.client.companyName,
    externalPostId: p.externalPostId,
    publishedUrl: p.publishedUrl,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-(--hub-text)">Posts</h1>
        <p className="mt-1 text-sm text-(--hub-muted)">All posts across connected Facebook pages.</p>
      </div>

      <PostsTable
        posts={serialisedPosts}
        pages={pages}
        selectedPageId={selectedPageId}
        selectedStatus={selectedStatus}
      />
    </div>
  );
}
