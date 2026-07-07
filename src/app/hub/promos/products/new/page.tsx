import Link from "next/link";
import { getSession, toAuthScope } from "@/lib/auth";
import { clientWhere } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { NewProductForm } from "./NewProductForm";

export const metadata = { title: "Add Product | UMS Hub" };

export default async function NewProductPage() {
  const { user } = await getSession();
  if (!user) return null;

  const scope = toAuthScope(user);
  const clients = await prisma.client.findMany({
    where: clientWhere(scope),
    orderBy: { companyName: "asc" },
    select: { id: true, companyName: true },
  });
  const defaultClient = clients[0];

  return (
    <section className="py-10 max-w-lg">
      <h1 className="text-2xl font-semibold tracking-tight text-(--hub-text)">Add product</h1>
      <p className="mt-1 text-sm text-(--hub-muted)">Add a product to the promotion library.</p>

      <div className="mt-4">
        <Link href="/hub/promos/products" className="text-sm text-(--hub-muted) hover:underline">
          ← Back to products
        </Link>
      </div>

      {!defaultClient ? (
        <p className="mt-6 text-sm text-(--hub-muted)">No clients found. Add a client first.</p>
      ) : (
        <NewProductForm defaultClientId={defaultClient.id} />
      )}
    </section>
  );
}
