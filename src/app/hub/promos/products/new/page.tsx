import Link from "next/link";
import { getSession, toAuthScope } from "@/lib/auth";
import { NewProductForm } from "./NewProductForm";
import { resolvePromoClientId } from "../../_lib/promoClient";

export const metadata = { title: "Add Product | UMS Hub" };

export default async function NewProductPage() {
  const { user } = await getSession();
  if (!user) return null;

  const scope = toAuthScope(user);
  const clientId = await resolvePromoClientId(scope);

  return (
    <section className="py-10 max-w-lg">
      <h1 className="text-2xl font-semibold tracking-tight text-(--hub-text)">Add product</h1>
      <p className="mt-1 text-sm text-(--hub-muted)">Add a product to the promotion library.</p>

      <div className="mt-4">
        <Link href="/hub/promos/products" className="text-sm text-(--hub-muted) hover:underline">
          ← Back to products
        </Link>
      </div>

      {!clientId ? (
        <p className="mt-6 text-sm text-(--hub-muted)">No clients found. Add a client first.</p>
      ) : (
        <NewProductForm clientId={clientId} />
      )}
    </section>
  );
}
