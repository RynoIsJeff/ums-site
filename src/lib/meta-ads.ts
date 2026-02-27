/**
 * Meta Marketing API - ad account insights and campaigns.
 * Requires ads_read or ads_management permission.
 */

const GRAPH_VERSION = "v22.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

export type AdAccountInsights = {
  spend: number;
  impressions: number;
  clicks: number;
  reach?: number;
};

export type CampaignSummary = {
  id: string;
  name: string;
  status: string;
  dailyBudget?: string;
  lifetimeBudget?: string;
  objective?: string;
};

export async function fetchAdAccountInsights(
  accountId: string,
  accessToken: string,
  datePreset: "today" | "last_7d" | "last_30d" = "last_7d"
): Promise<{ ok: true; data: AdAccountInsights } | { ok: false; error: string }> {
  const fields = "spend,impressions,clicks,reach";
  const url = `${GRAPH_BASE}/${accountId}/insights?fields=${fields}&date_preset=${datePreset}&access_token=${encodeURIComponent(accessToken)}`;

  try {
    const res = await fetch(url);
    const data = (await res.json()) as {
      data?: { spend?: string; impressions?: string; clicks?: string; reach?: string }[];
      error?: { message: string };
    };

    if (!res.ok) {
      return { ok: false, error: data?.error?.message ?? `HTTP ${res.status}` };
    }

    const first = data?.data?.[0];
    const insights: AdAccountInsights = {
      spend: parseFloat(first?.spend ?? "0") || 0,
      impressions: parseInt(first?.impressions ?? "0", 10) || 0,
      clicks: parseInt(first?.clicks ?? "0", 10) || 0,
      reach: first?.reach ? parseInt(first.reach, 10) : undefined,
    };
    return { ok: true, data: insights };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Network error",
    };
  }
}

export async function fetchAdAccountCampaigns(
  accountId: string,
  accessToken: string,
  limit = 50
): Promise<
  | { ok: true; campaigns: CampaignSummary[] }
  | { ok: false; error: string }
> {
  const fields =
    "id,name,status,daily_budget,lifetime_budget,objective";
  const url = `${GRAPH_BASE}/${accountId}/campaigns?fields=${fields}&limit=${limit}&access_token=${encodeURIComponent(accessToken)}`;

  try {
    const res = await fetch(url);
    const data = (await res.json()) as {
      data?: {
        id: string;
        name: string;
        status: string;
        daily_budget?: string;
        lifetime_budget?: string;
        objective?: string;
      }[];
      error?: { message: string };
    };

    if (!res.ok) {
      return { ok: false, error: data?.error?.message ?? `HTTP ${res.status}` };
    }

    const campaigns: CampaignSummary[] = (data?.data ?? []).map((c) => ({
      id: c.id,
      name: c.name,
      status: c.status ?? "UNKNOWN",
      dailyBudget: c.daily_budget,
      lifetimeBudget: c.lifetime_budget,
      objective: c.objective,
    }));
    return { ok: true, campaigns };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Network error",
    };
  }
}
