import { connectFacebookPageForm } from "../actions";

type Props = {
  clients: { id: string; companyName: string }[];
};

export function ConnectFacebookForm({ clients }: Props) {

  const hasMetaApp = !!process.env.META_APP_ID && !!process.env.META_APP_SECRET;

  return (
    <div className="space-y-4 rounded-xl border border-(--hub-border-light) bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-(--meta-blue)/10">
          <svg className="h-5 w-5 text-(--meta-blue)" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-(--hub-text)">Connect Facebook Pages</h2>
          <p className="text-sm text-(--hub-muted)">
            Sign in with your Facebook account, then map the Pages you manage to clients in UMS Hub.
          </p>
        </div>
      </div>

      {hasMetaApp ? (
        <a
          href="/hub/social/facebook/connect"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-(--meta-blue) px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-(--meta-blue-hover)"
        >
          Continue with Facebook
        </a>
      ) : (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
          To enable Facebook Login, set{" "}
          <code className="rounded bg-white px-1.5 py-0.5 text-[10px]">META_APP_ID</code> and{" "}
          <code className="rounded bg-white px-1.5 py-0.5 text-[10px]">META_APP_SECRET</code> in
          your environment, and configure the OAuth redirect URL in the Meta Developer dashboard.
        </p>
      )}

      <details className="mt-2 text-xs text-(--hub-muted)">
        <summary className="cursor-pointer font-semibold text-(--hub-text)">Advanced: Connect with manual Page token</summary>
        <p className="mt-2 mb-2">
          If Facebook Login is not available, you can still connect a Page using a Page access
          token from Meta Business Suite or Graph API Explorer.
        </p>
        <ul className="list-disc pl-5 space-y-0.5 mb-3">
          <li>Generate a long-lived Page access token.</li>
          <li>Paste it together with the Page ID and client below.</li>
        </ul>
        <p className="text-[11px] italic mb-3">
          Use this when a Page is owned by a business portfolio that doesn&apos;t expose it via Facebook Login.
        </p>

        <form
          action={connectFacebookPageForm}
          className="space-y-3 rounded-lg border border-(--hub-border-light) bg-black/2 p-4 text-xs"
        >
          <div>
            <label htmlFor="manual-clientId" className="block font-medium text-(--hub-text)">
              Client
            </label>
            <select
              id="manual-clientId"
              name="clientId"
              required
              className="mt-1 w-full rounded-md border border-(--hub-border-light) px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-(--meta-blue)"
            >
              <option value="">Select client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.companyName}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="manual-pageId" className="block font-medium text-(--hub-text)">
                Page ID
              </label>
              <input
                id="manual-pageId"
                name="pageId"
                required
                className="mt-1 w-full rounded-md border border-(--hub-border-light) px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-(--meta-blue)"
                placeholder="e.g. 1234567890"
              />
            </div>
            <div>
              <label htmlFor="manual-pageName" className="block font-medium text-(--hub-text)">
                Page name
              </label>
              <input
                id="manual-pageName"
                name="pageName"
                required
                className="mt-1 w-full rounded-md border border-(--hub-border-light) px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-(--meta-blue)"
                placeholder="e.g. Build it Ulundi"
              />
            </div>
          </div>

          <div>
            <label htmlFor="manual-pageAccessToken" className="block font-medium text-(--hub-text)">
              Long-lived Page access token
            </label>
            <textarea
              id="manual-pageAccessToken"
              name="pageAccessToken"
              required
              rows={3}
              className="mt-1 w-full rounded-md border border-(--hub-border-light) px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-(--meta-blue)"
              placeholder="EAAB..."
            />
            <p className="mt-1 text-[10px] text-(--hub-muted)">
              Paste the Page access token from Meta Business Suite or Graph API Explorer. Keep this secret.
            </p>
          </div>

          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-md bg-(--meta-blue) px-3 py-1.5 text-xs font-semibold text-white hover:bg-(--meta-blue-hover)"
          >
            Connect page with token
          </button>
        </form>
      </details>
    </div>
  );
}
