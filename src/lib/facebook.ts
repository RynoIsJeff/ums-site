/**
 * Facebook (Meta) Graph API helpers for posting to a Page feed, fetching page info, etc.
 * Requires a Page access token with pages_manage_posts (and related) permissions.
 */

const GRAPH_API_VERSION = "v22.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

export type PageProfile = {
  name: string;
  pictureUrl?: string;
  coverUrl?: string;
};

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

/**
 * Fetch page profile (name, picture, cover) from Facebook Graph API.
 * Requires pages_read_engagement or pages_show_list.
 */
export async function getPageProfile(
  pageId: string,
  pageAccessToken: string
): Promise<{ ok: true; profile: PageProfile } | { ok: false; error: string }> {
  const fields = ["name", "picture.type(large)", "cover"];
  const url = `${GRAPH_BASE}/${pageId}?fields=${fields.join(",")}&access_token=${encodeURIComponent(pageAccessToken)}`;

  try {
    const res = await fetch(url);
    const data = (await res.json()) as {
      name?: string;
      picture?: { data?: { url?: string } };
      cover?: { source?: string };
      error?: { message: string };
    };

    if (!res.ok) {
      return { ok: false, error: data?.error?.message ?? `HTTP ${res.status}` };
    }

    const profile: PageProfile = {
      name: data.name ?? "",
      pictureUrl: data.picture?.data?.url,
      coverUrl: data.cover?.source,
    };
    return { ok: true, profile };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Network error";
    return { ok: false, error: message };
  }
}

/**
 * Update page profile picture. Requires pages_manage_metadata.
 * @param imageUrl - Public URL of the new profile picture
 */
export async function updatePageProfilePicture(
  pageId: string,
  pageAccessToken: string,
  imageUrl: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const url = `${GRAPH_BASE}/${pageId}/picture?url=${encodeURIComponent(imageUrl)}&access_token=${encodeURIComponent(pageAccessToken)}`;

  try {
    const res = await fetch(url, { method: "POST" });
    const data = (await res.json()) as { success?: boolean; error?: { message: string } };

    if (!res.ok) {
      return { ok: false, error: data?.error?.message ?? `HTTP ${res.status}` };
    }
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Network error";
    return { ok: false, error: message };
  }
}

/**
 * Send a Messenger message (reply to user). Requires pages_messaging.
 */
export async function sendMessengerMessage(
  pageAccessToken: string,
  recipientPsid: string,
  message: string
): Promise<{ ok: true; messageId: string } | { ok: false; error: string }> {
  const url = `${GRAPH_BASE}/me/messages`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipient: { id: recipientPsid },
        message: { text: message },
        messaging_type: "RESPONSE",
        access_token: pageAccessToken,
      }),
    });
    const data = (await res.json()) as { message_id?: string; error?: { message: string } };
    if (!res.ok) return { ok: false, error: data?.error?.message ?? `HTTP ${res.status}` };
    return { ok: true, messageId: data.message_id ?? "" };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Network error" };
  }
}

/**
 * Get Instagram Business account ID linked to a Facebook Page.
 */
export async function getPageInstagramAccountId(
  pageId: string,
  pageAccessToken: string
): Promise<{ ok: true; igUserId: string } | { ok: false; error: string }> {
  const url = `${GRAPH_BASE}/${pageId}?fields=instagram_business_account&access_token=${encodeURIComponent(pageAccessToken)}`;
  try {
    const res = await fetch(url);
    const data = (await res.json()) as { instagram_business_account?: { id: string }; error?: { message: string } };
    if (!res.ok) return { ok: false, error: data?.error?.message ?? `HTTP ${res.status}` };
    const igUserId = data.instagram_business_account?.id;
    if (!igUserId) return { ok: false, error: "No Instagram Business account linked" };
    return { ok: true, igUserId };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Network error" };
  }
}

/**
 * Update page cover photo. Requires pages_manage_metadata.
 * @param imageUrl - Public URL of the new cover photo (recommended 820x312)
 */
export async function updatePageCover(
  pageId: string,
  pageAccessToken: string,
  imageUrl: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const url = `${GRAPH_BASE}/${pageId}?cover=${encodeURIComponent(imageUrl)}&access_token=${encodeURIComponent(pageAccessToken)}`;

  try {
    const res = await fetch(url, { method: "POST" });
    const data = (await res.json()) as { success?: boolean; error?: { message: string } };

    if (!res.ok) {
      return { ok: false, error: data?.error?.message ?? `HTTP ${res.status}` };
    }
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Network error";
    return { ok: false, error: message };
  }
}
