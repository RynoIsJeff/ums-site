/**
 * Facebook (Meta) Graph API helpers for posting to a Page feed.
 * Requires a Page access token with pages_manage_posts (and related) permissions.
 */

const GRAPH_API_VERSION = "v22.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

export type PublishResult =
  | { ok: true; postId: string; permalink?: string }
  | { ok: false; error: string; code?: number };

/**
 * Publish a text post to a Facebook Page.
 * @param pageId - Facebook Page ID (numeric or string)
 * @param pageAccessToken - Page access token (long-lived)
 * @param message - Post caption/text
 */
export async function publishPageFeedPost(
  pageId: string,
  pageAccessToken: string,
  message: string
): Promise<PublishResult> {
  const url = `${GRAPH_BASE}/${pageId}/feed`;
  const body = new URLSearchParams({
    message,
    access_token: pageAccessToken,
  });

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    const data = (await res.json()) as {
      id?: string;
      post_id?: string;
      error?: { message: string; code: number; type?: string };
    };

    if (!res.ok) {
      const err = data?.error;
      return {
        ok: false,
        error: err?.message ?? `HTTP ${res.status}`,
        code: err?.code,
      };
    }

    const postId = data.post_id ?? data.id ?? "";
    return {
      ok: true,
      postId: String(postId),
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Network error";
    return { ok: false, error: message };
  }
}
