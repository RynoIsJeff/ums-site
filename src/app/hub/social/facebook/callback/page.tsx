import { getSession } from "@/lib/auth";
import { clientWhere } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { exchangeCodeForUserToken, extendUserToken, listManagedPages } from "@/lib/facebook";
import { ConnectAllPagesForm } from "../../_components/ConnectAllPagesForm";

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

  // Step 1: Exchange code for short-lived user token
  const shortTokenResult = await exchangeCodeForUserToken(code, redirectUri);
  if (!shortTokenResult.ok) {
    return (
      <section className="py-10">
        <div className="max-w-xl mx-auto rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
          <p className="font-semibold mb-2">Facebook login failed</p>
          <p>{shortTokenResult.error}</p>
        </div>
      </section>
    );
  }

  // Step 2: Extend to long-lived token (~60 days) — page tokens from a long-lived user token don't expire
  const extendResult = await extendUserToken(shortTokenResult.accessToken);
  const userToken = extendResult.ok ? extendResult.accessToken : shortTokenResult.accessToken;
  const userTokenExpiresIn = extendResult.ok ? extendResult.expiresIn : (shortTokenResult.expiresIn ?? 3600);
  const userTokenExpiresAt = new Date(Date.now() + userTokenExpiresIn * 1000).toISOString();

  // Step 3: Fetch pages using the long-lived token (page tokens will also be long-lived)
  const pagesResult = await listManagedPages(userToken);
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
            Map each page to a client, then connect them all at once.
          </p>
        </div>

        <ConnectAllPagesForm
          pages={pagesResult.pages.map((p) => ({
            id: p.id,
            name: p.name,
            accessToken: p.accessToken,
          }))}
          clients={clients}
          userToken={userToken}
          userTokenExpiresAt={userTokenExpiresAt}
        />
      </div>
    </section>
  );
}
