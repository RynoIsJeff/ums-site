/**
 * Meta Marketing API helpers.
 * For paid ads: campaigns, ad sets, creatives, insights.
 * Requires ads_management, ads_read, business_management permissions.
 * @see https://developers.facebook.com/docs/marketing-api/
 */

const GRAPH_API_VERSION = "v22.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

/**
 * Fetch ad account info.
 * @param accountId - Ad account ID (e.g. act_123456789)
 */
export async function getAdAccount(
  accountId: string,
  accessToken: string
): Promise<{ ok: true; account: { name?: string; currency?: string; account_status?: number } } | { ok: false; error: string }> {
  const url = `${GRAPH_BASE}/${accountId}?fields=name,currency,account_status&access_token=${encodeURIComponent(accessToken)}`;

  try {
    const res = await fetch(url);
    const data = (await res.json()) as { name?: string; currency?: string; account_status?: number; error?: { message: string } };

    if (!res.ok) {
      return { ok: false, error: data?.error?.message ?? `HTTP ${res.status}` };
    }
    return { ok: true, account: data };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Network error";
    return { ok: false, error: message };
  }
}

/**
 * Fetch campaigns for an ad account.
 * @param accountId - Ad account ID (e.g. act_123456789)
 */
export async function getCampaigns(
  accountId: string,
  accessToken: string,
  options?: { limit?: number; status?: string[] }
): Promise<{ ok: true; campaigns: Array<{ id: string; name: string; status: string }> } | { ok: false; error: string }> {
  const params = new URLSearchParams({
    access_token: accessToken,
    fields: "id,name,status",
    limit: String(options?.limit ?? 25),
  });
  if (options?.status?.length) {
    params.set("filtering", JSON.stringify([{ field: "effective_status", operator: "IN", value: options.status }]));
  }
  const url = `${GRAPH_BASE}/${accountId}/campaigns?${params.toString()}`;

  try {
    const res = await fetch(url);
    const data = (await res.json()) as { data?: Array<{ id: string; name: string; status: string }>; error?: { message: string } };

    if (!res.ok) {
      return { ok: false, error: data?.error?.message ?? `HTTP ${res.status}` };
    }
    return { ok: true, campaigns: data.data ?? [] };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Network error";
    return { ok: false, error: message };
  }
}

/**
 * Fetch insights for an ad account.
 * @param accountId - Ad account ID (e.g. act_123456789)
 * @param breakdown - Optional breakdown (e.g. day, age, gender)
 */
export async function getAccountInsights(
  accountId: string,
  accessToken: string,
  options?: { datePreset?: string; fields?: string[] }
): Promise<{ ok: true; insights: Array<Record<string, unknown>> } | { ok: false; error: string }> {
  const params = new URLSearchParams({
    access_token: accessToken,
    fields: (options?.fields ?? ["spend", "impressions", "clicks", "reach"]).join(","),
    date_preset: options?.datePreset ?? "last_30d",
  });
  const url = `${GRAPH_BASE}/${accountId}/insights?${params.toString()}`;

  try {
    const res = await fetch(url);
    const data = (await res.json()) as { data?: Array<Record<string, unknown>>; error?: { message: string } };

    if (!res.ok) {
      return { ok: false, error: data?.error?.message ?? `HTTP ${res.status}` };
    }
    return { ok: true, insights: data.data ?? [] };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Network error";
    return { ok: false, error: message };
  }
}
