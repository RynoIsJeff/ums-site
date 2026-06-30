import crypto from "crypto";

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

function buildAppSecretProof(accessToken: string): string | null {
  const appSecret = process.env.META_APP_SECRET;
  if (!appSecret) return null;
  return crypto.createHmac("sha256", appSecret).update(accessToken).digest("hex");
}

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
 * Upload a single photo to a Facebook Page as an unpublished staging photo.
 * Returns the Facebook photo ID, which can be attached to a multi-photo feed post.
 */
async function stageUnpublishedPhoto(
  pageId: string,
  pageAccessToken: string,
  imageUrl: string
): Promise<{ ok: true; photoId: string } | { ok: false; error: string }> {
  const body = new URLSearchParams({
    url: imageUrl,
    published: "false",
    access_token: pageAccessToken,
  });
  try {
    const res = await fetch(`${GRAPH_BASE}/${pageId}/photos`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });
    const data = (await res.json()) as { id?: string; error?: { message: string; code: number } };
    if (!res.ok || !data.id) {
      return { ok: false, error: data.error?.message ?? `HTTP ${res.status}` };
    }
    return { ok: true, photoId: data.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Network error" };
  }
}

/**
 * Publish a multi-photo post to a Facebook Page.
 * Stages each image as unpublished then creates one feed post with all photos attached.
 * Requires pages_manage_posts + pages_read_engagement.
 */
export async function publishPageMultiPhotoPost(
  pageId: string,
  pageAccessToken: string,
  imageUrls: string[],
  caption: string
): Promise<PublishResult> {
  if (imageUrls.length === 1) {
    return publishPagePhotoPost(pageId, pageAccessToken, imageUrls[0], caption);
  }

  const staged = await Promise.all(
    imageUrls.map((url) => stageUnpublishedPhoto(pageId, pageAccessToken, url))
  );

  const failed = staged.find((r) => !r.ok);
  if (failed) return { ok: false, error: (failed as { ok: false; error: string }).error };

  const attachedMedia = JSON.stringify(
    (staged as { ok: true; photoId: string }[]).map((r) => ({ media_fbid: r.photoId }))
  );

  const body = new URLSearchParams({
    message: caption,
    attached_media: attachedMedia,
    access_token: pageAccessToken,
  });

  try {
    const res = await fetch(`${GRAPH_BASE}/${pageId}/feed`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });
    const data = (await res.json()) as {
      id?: string;
      post_id?: string;
      error?: { message: string; code: number };
    };
    if (!res.ok) {
      return { ok: false, error: data.error?.message ?? `HTTP ${res.status}`, code: data.error?.code };
    }
    return { ok: true, postId: String(data.post_id ?? data.id ?? "") };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Network error" };
  }
}

/**
 * Publish a photo post to a Facebook Page using a public image URL.
 * Uses /{page-id}/photos with `url` + `caption`.
 */
export async function publishPagePhotoPost(
  pageId: string,
  pageAccessToken: string,
  imageUrl: string,
  caption: string
): Promise<PublishResult> {
  const url = `${GRAPH_BASE}/${pageId}/photos`;
  const body = new URLSearchParams({
    url: imageUrl,
    caption,
    access_token: pageAccessToken,
    published: "true",
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

    // photos endpoint may return both a photo id and post_id
    const postId = data.post_id ?? data.id ?? "";
    return { ok: true, postId: String(postId) };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Network error";
    return { ok: false, error: message };
  }
}

/**
 * Publish a video post to a Facebook Page using a public video URL.
 * Uses /{page-id}/videos with `file_url` + `description`.
 * @deprecated Prefer publishPageReelPost for better algorithmic distribution.
 */
export async function publishPageVideoPost(
  pageId: string,
  pageAccessToken: string,
  videoUrl: string,
  caption: string
): Promise<PublishResult> {
  const url = `${GRAPH_BASE}/${pageId}/videos`;
  const body = new URLSearchParams({
    file_url: videoUrl,
    description: caption,
    access_token: pageAccessToken,
    published: "true",
  });

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    const data = (await res.json()) as {
      id?: string;
      error?: { message: string; code: number; type: string };
    };

    if (!res.ok) {
      const err = data?.error;
      return {
        ok: false,
        error: err?.message ?? `HTTP ${res.status}`,
        code: err?.code,
      };
    }

    const postId = data.id ?? "";
    return { ok: true, postId: String(postId) };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Network error";
    return { ok: false, error: message };
  }
}

/**
 * Publish a video as a Facebook Reel on a Page.
 *
 * Uses the Reels Publishing API (/{page-id}/video_reels) which gives better
 * algorithmic distribution than the plain /videos endpoint.
 *
 * Flow:
 *   1. POST start phase with file_url — Facebook fetches the video itself.
 *   2. If Facebook returns an upload_url instead (file_url not accepted),
 *      fall back to fetching the video server-side and doing a binary upload.
 *   3. POST finish phase with video_state=PUBLISHED.
 */
export async function publishPageReelPost(
  pageId: string,
  pageAccessToken: string,
  videoUrl: string,
  caption: string,
): Promise<PublishResult> {
  try {
    // ── Step 1: start upload session ────────────────────────────────────────
    const startBody = new URLSearchParams({
      upload_phase: "start",
      file_url: videoUrl,
      access_token: pageAccessToken,
    });

    const startRes = await fetch(`${GRAPH_BASE}/${pageId}/video_reels`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: startBody.toString(),
    });
    const startData = (await startRes.json()) as {
      video_id?: string;
      upload_url?: string;
      error?: { message: string; code: number };
    };

    if (!startRes.ok || !startData.video_id) {
      return {
        ok: false,
        error: startData?.error?.message ?? `Failed to start Reel upload (${startRes.status})`,
        code: startData?.error?.code,
      };
    }

    const videoId = startData.video_id;

    // ── Step 2: binary upload (fallback when file_url wasn't accepted) ───────
    if (startData.upload_url) {
      const videoRes = await fetch(videoUrl);
      if (!videoRes.ok) {
        return { ok: false, error: `Could not fetch video from storage (${videoRes.status})` };
      }
      const videoBuffer = await videoRes.arrayBuffer();

      const uploadRes = await fetch(startData.upload_url, {
        method: "POST",
        headers: {
          Authorization: `OAuth ${pageAccessToken}`,
          offset: "0",
          file_size: String(videoBuffer.byteLength),
          "Content-Type": "application/octet-stream",
        },
        body: videoBuffer,
      });

      if (!uploadRes.ok) {
        const errData = (await uploadRes.json().catch(() => ({}))) as { error?: { message: string } };
        return { ok: false, error: errData?.error?.message ?? `Reel binary upload failed (${uploadRes.status})` };
      }
    }

    // ── Step 3: publish ──────────────────────────────────────────────────────
    const finishBody = new URLSearchParams({
      upload_phase: "finish",
      video_id: videoId,
      video_state: "PUBLISHED",
      description: caption,
      access_token: pageAccessToken,
    });

    const finishRes = await fetch(`${GRAPH_BASE}/${pageId}/video_reels`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: finishBody.toString(),
    });
    const finishData = (await finishRes.json()) as {
      video_id?: string;
      success?: boolean;
      error?: { message: string; code: number };
    };

    if (!finishRes.ok) {
      return {
        ok: false,
        error: finishData?.error?.message ?? `Failed to publish Reel (${finishRes.status})`,
        code: finishData?.error?.code,
      };
    }

    return { ok: true, postId: String(finishData.video_id ?? videoId) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Network error" };
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

// --- OAuth helpers for connecting via Facebook Login ---

export type FacebookPageSummary = {
  id: string;
  name: string;
  accessToken: string;
  pictureUrl?: string;
};

/**
 * Exchange an OAuth code for a short-lived user access token.
 * See: https://developers.facebook.com/docs/facebook-login/manually-build-a-login-flow/#exchangecode
 */
export async function exchangeCodeForUserToken(code: string, redirectUri: string) {
  const clientId = process.env.META_APP_ID;
  const clientSecret = process.env.META_APP_SECRET;
  if (!clientId || !clientSecret) {
    return { ok: false, error: "META_APP_ID or META_APP_SECRET is not configured." } as const;
  }

  const url = `${GRAPH_BASE}/oauth/access_token?` +
    `client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&client_secret=${encodeURIComponent(clientSecret)}` +
    `&code=${encodeURIComponent(code)}`;

  try {
    const res = await fetch(url, { method: "GET" });
    const data = (await res.json()) as {
      access_token?: string;
      token_type?: string;
      expires_in?: number;
      error?: { message: string };
    };

    if (!res.ok || !data.access_token) {
      return {
        ok: false,
        error: data?.error?.message ?? `Facebook OAuth error (HTTP ${res.status})`,
      } as const;
    }

    return {
      ok: true,
      accessToken: data.access_token,
      expiresIn: data.expires_in ?? null,
    } as const;
  } catch (e) {
    const message = e instanceof Error ? e.message : "Network error";
    return { ok: false, error: message } as const;
  }
}

/**
 * Exchange a short-lived or expiring user access token for a long-lived one (~60 days).
 * Must be called with META_APP_ID and META_APP_SECRET configured.
 */
export async function extendUserToken(token: string): Promise<
  | { ok: true; accessToken: string; expiresIn: number }
  | { ok: false; error: string }
> {
  const clientId = process.env.META_APP_ID;
  const clientSecret = process.env.META_APP_SECRET;
  if (!clientId || !clientSecret) {
    return { ok: false, error: "META_APP_ID or META_APP_SECRET not configured." };
  }

  const url =
    `${GRAPH_BASE}/oauth/access_token?` +
    `grant_type=fb_exchange_token` +
    `&client_id=${encodeURIComponent(clientId)}` +
    `&client_secret=${encodeURIComponent(clientSecret)}` +
    `&fb_exchange_token=${encodeURIComponent(token)}`;

  try {
    const res = await fetch(url);
    const data = (await res.json()) as {
      access_token?: string;
      expires_in?: number;
      error?: { message: string };
    };
    if (!res.ok || !data.access_token) {
      return { ok: false, error: data?.error?.message ?? `HTTP ${res.status}` };
    }
    return {
      ok: true,
      accessToken: data.access_token,
      expiresIn: data.expires_in ?? 5184000, // default 60 days
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Network error" };
  }
}

/**
 * List Facebook Pages the user can manage, including page access tokens.
 * Uses /me/accounts. Requires: pages_show_list, pages_read_engagement.
 */
export async function listManagedPages(
  userAccessToken: string
): Promise<{ ok: true; pages: FacebookPageSummary[] } | { ok: false; error: string }> {
  const fields = ["id", "name", "access_token", "picture{url}"];
  const appSecretProof = buildAppSecretProof(userAccessToken);

  if (!appSecretProof) {
    return {
      ok: false,
      error: "META_APP_SECRET is not configured; cannot generate appsecret_proof.",
    };
  }

  const params = new URLSearchParams({
    fields: fields.join(","),
    access_token: userAccessToken,
    appsecret_proof: appSecretProof,
  });

  const url = `${GRAPH_BASE}/me/accounts?${params.toString()}`;

  try {
    const res = await fetch(url);
    const data = (await res.json()) as {
      data?: {
        id: string;
        name: string;
        access_token?: string;
        picture?: { data?: { url?: string } };
      }[];
      error?: { message: string };
    };

    if (!res.ok || !data.data) {
      return {
        ok: false,
        error: data?.error?.message ?? `HTTP ${res.status}`,
      };
    }

    const pages: FacebookPageSummary[] = data.data
      .filter((p) => !!p.access_token)
      .map((p) => ({
        id: p.id,
        name: p.name,
        accessToken: p.access_token!,
        pictureUrl: p.picture?.data?.url,
      }));

    return { ok: true, pages };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Network error";
    return { ok: false, error: message };
  }
}

export type FacebookFeedPost = {
  id: string;
  message?: string;
  picture?: string;
  createdTime: string;
  permalink?: string;
};

export async function getPageFeedPosts(
  pageId: string,
  pageAccessToken: string,
  since: Date,
  until: Date,
): Promise<{ ok: true; posts: FacebookFeedPost[] } | { ok: false; error: string }> {
  const params = new URLSearchParams({
    fields: "id,message,created_time,permalink_url,full_picture",
    since: Math.floor(since.getTime() / 1000).toString(),
    until: Math.floor(until.getTime() / 1000).toString(),
    limit: "100",
    access_token: pageAccessToken,
  });

  try {
    const res = await fetch(`${GRAPH_BASE}/${pageId}/posts?${params}`, {
      next: { revalidate: 3600 },
    } as RequestInit);
    const data = (await res.json()) as {
      data?: Array<{ id: string; message?: string; created_time: string; permalink_url?: string; full_picture?: string }>;
      error?: { message: string };
    };
    if (!res.ok) return { ok: false, error: data?.error?.message ?? `HTTP ${res.status}` };
    return {
      ok: true,
      posts: (data.data ?? []).map((p) => ({
        id: p.id,
        message: p.message,
        picture: p.full_picture,
        createdTime: new Date(p.created_time).toISOString(),
        permalink: p.permalink_url,
      })),
    };
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

export async function deleteFacebookPost(
  externalPostId: string,
  pageAccessToken: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const url = `${GRAPH_BASE}/${externalPostId}`;
    const res = await fetch(url, {
      method: "DELETE",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ access_token: pageAccessToken }).toString(),
    });
    const data = (await res.json()) as { success?: boolean; error?: { message: string } };
    if (!res.ok || data.error) {
      return { ok: false, error: data.error?.message ?? `HTTP ${res.status}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Network error" };
  }
}
