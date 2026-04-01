import { getSession } from "@/lib/auth";
import { clientWhere } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { exchangeCodeForUserToken, listManagedPages } from "@/lib/facebook";
import { connectFacebookPageForm } from "../../actions";

type CallbackPageProps = {
  searchParams: Promise<{ code?: string; error?: string }>;
};

export default async function FacebookCallbackPage({
  searchParams,
}: CallbackPageProps) {
  const { user } = await getSession();
  if (!user) return null;

  const { code, error } = await searchParams;

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  const redirectUri = `${appUrl}/hub/social/facebook/callback`;

  if (error) {
    return (
      <section className="py-10">
        <div className="max-w-xl mx-auto rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
          <p className="font-semibold mb-2">Facebook login failed</p>
          <p>{error}</p>
        </div>
      </section>
    );
  }

  if (!code) {
    return (
      <section className="py-10">
        <div className="max-w-xl mx-auto rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
          <p className="font-semibold mb-2">Missing code from Facebook</p>
          <p>Try starting the connection again from the Social page.</p>
        </div>
      </section>
    );
  }

  const tokenResult = await exchangeCodeForUserToken(code, redirectUri);
  if (!tokenResult.ok) {
    return (
      <section className="py-10">
        <div className="max-w-xl mx-auto rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
          <p className="font-semibold mb-2">Facebook login failed</p>
          <p>{tokenResult.error}</p>
        </div>
      </section>
    );
  }

  const pagesResult = await listManagedPages(tokenResult.accessToken);
  if (!pagesResult.ok) {
    return (
      <section className="py-10">
        <div className="max-w-xl mx-auto rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
          <p className="font-semibold mb-2">Could not load Facebook pages</p>
          <p>{pagesResult.error}</p>
        </div>
      </section>
    );
  }

  const clients = await prisma.client.findMany({
    where: clientWhere({ userId: user.id, role: user.role, assignedClientIds: user.assignedClientIds }),
    orderBy: { companyName: "asc" },
    select: { id: true, companyName: true },
  });

  if (pagesResult.pages.length === 0) {
    return (
      <section className="py-10">
        <div className="max-w-xl mx-auto rounded-xl border border-(--hub-border-light) bg-white p-6 text-sm text-(--hub-text)">
          <p className="font-semibold mb-2">No manageable Facebook Pages</p>
          <p>
            Facebook logged you in successfully, but that account does not have access to any Pages
            with the required permissions.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-(--hub-text)">
            Connect Facebook Pages
          </h1>
          <p className="mt-1 text-sm text-(--hub-muted)">
            Select a page and map it to a client in UMS Hub. You can repeat this for multiple pages.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {pagesResult.pages.map((page) => (
            <form
              key={page.id}
              action={connectFacebookPageForm}
              className="space-y-3 rounded-xl border border-(--hub-border-light) bg-white p-4 shadow-sm"
            >
              <div>
                <p className="text-sm font-semibold text-(--hub-text)">{page.name}</p>
                <p className="mt-0.5 text-xs text-(--hub-muted)">Page ID: {page.id}</p>
              </div>

              <div>
                <label
                  htmlFor={`client-${page.id}`}
                  className="block text-xs font-medium text-(--hub-text)"
                >
                  Map to client
                </label>
                <select
                  id={`client-${page.id}`}
                  name="clientId"
                  required
                  className="mt-1 w-full rounded-lg border border-(--hub-border-light) px-2.5 py-1.5 text-xs focus:border-(--meta-blue) focus:outline-none focus:ring-1 focus:ring-(--meta-blue)"
                >
                  <option value="">Select client</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.companyName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Hidden fields to reuse existing connectFacebookPage action */}
              <input type="hidden" name="pageId" value={page.id} />
              <input type="hidden" name="pageName" value={page.name} />
              <input type="hidden" name="pageAccessToken" value={page.accessToken} />

              <button
                type="submit"
                className="mt-1 inline-flex w-full items-center justify-center rounded-lg bg-(--meta-blue) px-3 py-1.5 text-xs font-semibold text-white hover:bg-(--meta-blue-hover)"
              >
                Connect this page
              </button>
            </form>
          ))}
        </div>
      </div>
    </section>
  );
}

