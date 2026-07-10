import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession, toAuthScope } from "@/lib/auth";
import { clientIdWhere } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { updateStore } from "../../../actions";
import { StoreForm } from "../../_components/StoreForm";

export const metadata = { title: "Edit Store | UMS Hub" };

export default async function EditStorePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user } = await getSession();
  if (!user) return null;

  const scope = toAuthScope(user);
  const scopeWhere = clientIdWhere(scope);
  const store = await prisma.promoStore.findFirst({ where: { id, ...scopeWhere } });
  if (!store) notFound();

  const socialPages = await prisma.socialPage.findMany({
    where: { socialAccount: clientIdWhere(scope) },
    select: { id: true, pageName: true },
    orderBy: { pageName: "asc" },
  });

  const boundAction = updateStore.bind(null, id);

  return (
    <section className="py-10 max-w-md">
      <h1 className="text-2xl font-semibold tracking-tight text-(--hub-text)">Edit store</h1>

      <div className="mt-4">
        <Link href="/hub/promos/stores" className="text-sm text-(--hub-muted) hover:underline">
          ← Back to stores
        </Link>
      </div>

      <StoreForm
        action={boundAction}
        submitLabel="Save changes"
        socialPages={socialPages}
        defaults={{
          name: store.name,
          address: store.address ?? "",
          phone: store.phone ?? "",
          socialPageId: store.socialPageId ?? "",
        }}
      />
    </section>
  );
}
