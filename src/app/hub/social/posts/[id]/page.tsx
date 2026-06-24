import Link from "next/link";
import { getSession } from "@/lib/auth";
import { toAuthScope } from "@/lib/auth";
import { canAccessClient } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CancelPostButton } from "../../_components/CancelPostButton";
import { PublishNowButton } from "../../_components/PublishNowButton";
import { PostForm } from "../../_components/PostForm";
import { updatePost } from "../../actions";

export const metadata = {
  title: "Post | UMS Hub",
};

type PageProps = { params: Promise<{ id: string }> };

export default async function PostDetailPage({ params }: PageProps) {
  const { id } = await params;
  const { user } = await getSession();
  if (!user) return null;

  const scope = toAuthScope(user);
  const post = await prisma.socialPost.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, companyName: true } },
      socialPage: { select: { id: true, pageName: true } },
      media: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!post || !canAccessClient(scope, post.clientId)) notFound();

  const canEdit = post.status === "DRAFT" || post.status === "SCHEDULED";

  const [clients, pages] = canEdit
    ? await Promise.all([
        prisma.client.findMany({
          where: { id: post.clientId },
          select: { id: true, companyName: true },
        }),
        prisma.socialPage.findMany({
          where: { socialAccount: { clientId: post.clientId } },
          include: { socialAccount: { select: { clientId: true } } },
        }),
      ])
    : [[post.client], [] as { id: string; pageName: string; socialAccount: { clientId: string } }[]];

  const pageOptions = pages.map((p) => ({
    id: p.id,
    pageName: p.pageName,
    clientId: p.socialAccount.clientId,
  }));

  const updateAction = updatePost.bind(null, id);

  return (
    <section className="py-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Link href="/hub/social" className="text-sm text-(--hub-muted) hover:text-(--hub-text)">
          ← Content Planner
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          {canEdit && post.socialPageId && <PublishNowButton postId={id} />}
          {canEdit && <CancelPostButton postId={id} />}
        </div>
      </div>

      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-(--hub-text)">Post</h1>
        <span
          className={
            post.status === "PUBLISHED"
              ? "text-green-600"
              : post.status === "FAILED"
                ? "text-red-600"
                : post.status === "SCHEDULED"
                  ? "text-amber-600"
                  : "text-black/60"
          }
        >
          {post.status}
        </span>
      </div>

      <p className="mt-2 text-sm text-(--hub-muted)">
        <Link href={`/hub/clients/${post.client.id}`} className="hover:underline">
          {post.client.companyName}
        </Link>
        {post.socialPage && ` · ${post.socialPage.pageName}`}
      </p>

      {canEdit ? (
        <div className="mt-6 rounded-xl border border-(--hub-border-light) bg-white p-6 shadow-sm">
          <PostForm
            action={updateAction}
            clients={clients}
            pages={pageOptions}
            defaultClientId={post.clientId}
            defaultPageId={post.socialPageId ?? ""}
            defaultCaption={post.caption}
            defaultScheduledFor={
              post.scheduledFor
                ? new Date(post.scheduledFor.getTime() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16)
                : ""
            }
            defaultMediaUrls={post.media.map((m) => m.mediaUrl)}
            defaultMediaType={(post.media[0]?.mediaType as "IMAGE" | "VIDEO" | undefined) ?? ""}
            submitLabel="Save changes"
            backHref="/hub/social"
          />
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-(--hub-border-light) bg-white p-6 shadow-sm">
          <div className="whitespace-pre-wrap text-sm">{post.caption}</div>
          {post.scheduledFor && (
            <p className="mt-4 text-sm text-black/60">
              Scheduled: {post.scheduledFor.toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Johannesburg" })}
            </p>
          )}
          {post.publishedAt && (
            <p className="mt-2 text-sm text-black/60">
              Published: {post.publishedAt.toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Johannesburg" })}
            </p>
          )}
          {post.publishedUrl && (
            <a href={post.publishedUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm text-(--meta-blue) hover:underline">
              View on Facebook →
            </a>
          )}
          {post.lastError && (
            <p className="mt-2 text-sm text-red-600">Error: {post.lastError}</p>
          )}
        </div>
      )}
    </section>
  );
}
