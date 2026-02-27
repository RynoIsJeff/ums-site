/**
 * Instagram Content Publishing via Meta Graph API.
 * Requires Page with connected Instagram Business account.
 * Permissions: instagram_business_manage, pages_read_engagement
 */

const GRAPH_VERSION = "v22.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

export type PublishInstagramResult =
  | { ok: true; mediaId: string; permalink?: string }
  | { ok: false; error: string };

/**
 * Get Instagram Business account ID linked to a Facebook Page.
 */
export async function getInstagramBusinessAccountId(
  pageId: string,
  pageAccessToken: string
): Promise<{ ok: true; igUserId: string } | { ok: false; error: string }> {
  const url = `${GRAPH_BASE}/${pageId}?fields=instagram_business_account&access_token=${encodeURIComponent(pageAccessToken)}`;

  try {
    const res = await fetch(url);
    const data = (await res.json()) as {
      instagram_business_account?: { id: string };
      error?: { message: string };
    };

    if (!res.ok) {
      return { ok: false, error: data?.error?.message ?? `HTTP ${res.status}` };
    }

    const igUserId = data.instagram_business_account?.id;
    if (!igUserId) {
      return { ok: false, error: "No Instagram Business account linked" };
    }
    return { ok: true, igUserId };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Network error",
    };
  }
}

/**
 * Publish a caption-only post to Instagram (text post).
 * Note: Instagram requires media. For text-only, we create a simple image container.
 * If imageUrl is provided, use it; otherwise text-only posts need a workaround.
 */
export async function publishInstagramPost(
  igUserId: string,
  pageAccessToken: string,
  caption: string,
  imageUrl?: string
): Promise<PublishInstagramResult> {
  if (!imageUrl) {
    return { ok: false, error: "Instagram requires an image. Add media to publish." };
  }

  const createUrl = `${GRAPH_BASE}/${igUserId}/media`;
  const createBody: Record<string, string> = {
    image_url: imageUrl,
    caption,
    access_token: pageAccessToken,
  };

  try {
    const createRes = await fetch(createUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(createBody),
    });

    const createData = (await createRes.json()) as {
      id?: string;
      error?: { message: string };
    };

    if (!createRes.ok) {
      return { ok: false, error: createData?.error?.message ?? `HTTP ${createRes.status}` };
    }

    const containerId = createData.id;
    if (!containerId) {
      return { ok: false, error: "No container ID returned" };
    }

    const publishUrl = `${GRAPH_BASE}/${igUserId}/media_publish`;
    const publishRes = await fetch(publishUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creation_id: containerId,
        access_token: pageAccessToken,
      }),
    });

    const publishData = (await publishRes.json()) as {
      id?: string;
      error?: { message: string };
    };

    if (!publishRes.ok) {
      return { ok: false, error: publishData?.error?.message ?? `Publish failed` };
    }

    return {
      ok: true,
      mediaId: publishData.id ?? containerId,
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Network error",
    };
  }
}
