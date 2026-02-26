import Link from "next/link";
import { getSession } from "@/lib/auth";
import { toAuthScope } from "@/lib/auth";
import { clientWhere } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { PostForm } from "../../_components/PostForm";
import { createPost } from "../../actions";

export const metadata = {
  title: "New Post | UMS Hub",
};

export default async function NewPostPage() {
  const { user } = await getSession();
  if (!user) return null;

  const scope = toAuthScope(user);
  const clientScope = scope.role === "ADMIN" ? {} : { clientId: { in: scope.assignedClientIds ?? [] } };

  const [clients, pages] = await Promise.all([
    prisma.client.findMany({
      where: clientWhere(scope),
      orderBy: { companyName: "asc" },
      select: { id: true, companyName: true },
    }),
    prisma.socialPage.findMany({
      where: { socialAccount: clientScope },
      include: { socialAccount: { select: { clientId: true } } },
    }),
  ]);

  const pageOptions = pages.map((p) => ({
    id: p.id,
    pageName: p.pageName,
    clientId: p.socialAccount.clientId,
  }));

  return (
    <section className="py-10">
      <div className="mb-6">
        <Link href="/hub/social" className="text-sm text-black/60 hover:text-black">
          ← Social
        </Link>
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">New post</h1>
      <p className="mt-2 text-sm text-black/70">
        Choose a connected Facebook page and add caption. Set a date/time to schedule, or leave empty for draft.
      </p>
      <div className="mt-6 rounded-xl border border-black/10 bg-white p-6">
        <PostForm
          action={createPost}
          clients={clients}
          pages={pageOptions}
          submitLabel="Create post"
          backHref="/hub/social"
          multiPage
        />
      </div>
    </section>
  );
}
