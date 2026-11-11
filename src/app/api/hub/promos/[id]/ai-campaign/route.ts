import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import { getSession, toAuthScope } from "@/lib/auth";
import { clientIdWhere, canAccessClient } from "@/lib/rbac";
import { toNum } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type CampaignPost = {
  date: string;
  time: string;
  caption: string;
  reasoning: string;
};

type AICampaignResponse = {
  schedule: CampaignPost[];
  insights: {
    avgReach: number;
    topHour: number | null;
    historicalPostCount: number;
  };
};

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<AICampaignResponse | { error: string }>> {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: promoId } = await params;
  const body = (await req.json()) as { socialPageId: string };
  const { socialPageId } = body;

  if (!socialPageId) {
    return NextResponse.json({ error: "socialPageId is required" }, { status: 400 });
  }

  const scope = toAuthScope(user);
  const scopeWhere = clientIdWhere(scope);

  // Fetch promo with items
  const promo = await prisma.promo.findFirst({
    where: { id: promoId, ...scopeWhere },
    include: {
      store: { select: { name: true } },
      items: {
        orderBy: { sortOrder: "asc" },
        include: { product: { select: { name: true, unit: true, variant: true, price: true } } },
      },
    },
  });

  if (!promo) return NextResponse.json({ error: "Promo not found" }, { status: 404 });
  if (!canAccessClient(scope, promo.clientId)) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  // Fetch the target social page (verify access)
  const page = await prisma.socialPage.findFirst({
    where: { id: socialPageId, socialAccount: scopeWhere },
    select: { id: true, pageName: true, metadata: true },
  });
  if (!page) return NextResponse.json({ error: "Social page not found" }, { status: 404 });

  const pageMeta = (page.metadata ?? {}) as Record<string, unknown>;
  const fansOnline = (pageMeta.fansOnline ?? {}) as Record<string, number>;

  // Historical promo post performance for this page (last 90 days)
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const historicalPosts = await prisma.socialPost.findMany({
    where: {
      socialPageId,
      promoId: { not: null },
      status: "PUBLISHED",
      publishedAt: { gte: ninetyDaysAgo },
    },
    select: {
      publishedAt: true,
      scheduledFor: true,
      postInsight: { select: { reach: true, impressions: true, reactions: true, clicks: true } },
    },
    orderBy: { publishedAt: "desc" },
    take: 50,
  });

  // Derive best-performing hours and avg reach
  const withInsights = historicalPosts.filter((p) => (p.postInsight?.reach ?? 0) > 0);
  const avgReach =
    withInsights.length > 0
      ? Math.round(
          withInsights.reduce((s, p) => s + (p.postInsight?.reach ?? 0), 0) / withInsights.length,
        )
      : 0;

  const hourEngagement: Record<number, { totalReach: number; count: number }> = {};
  for (const p of withInsights) {
    const publishTime = p.publishedAt ?? p.scheduledFor;
    if (!publishTime) continue;
    // Convert UTC to SAST (+2)
    const hour = (publishTime.getUTCHours() + 2) % 24;
    if (!hourEngagement[hour]) hourEngagement[hour] = { totalReach: 0, count: 0 };
    hourEngagement[hour].totalReach += p.postInsight?.reach ?? 0;
    hourEngagement[hour].count++;
  }
  const topHour =
    Object.keys(hourEngagement).length > 0
      ? parseInt(
          Object.entries(hourEngagement).sort(
            ([, a], [, b]) => b.totalReach / b.count - a.totalReach / a.count,
          )[0][0],
        )
      : null;

  // Existing scheduled posts in this promo's date range (conflict data)
  const existingScheduled = await prisma.socialPost.findMany({
    where: {
      socialPageId,
      status: { in: ["SCHEDULED", "PROCESSING"] },
      scheduledFor: { gte: promo.promoDateFrom, lte: promo.promoDateTo },
      promoId: { not: promoId },
    },
    select: { scheduledFor: true },
  });

  const conflictSlots = existingScheduled
    .filter((p) => p.scheduledFor)
    .map((p) => {
      const d = p.scheduledFor!;
      const sastHour = (d.getUTCHours() + 2) % 24;
      return `${d.toISOString().slice(0, 10)} at ${String(sastHour).padStart(2, "0")}:00`;
    });

  // Build product list for prompt
  const productList = promo.items.map((item) => {
    const price = item.priceOverride ? toNum(item.priceOverride) : toNum(item.product.price);
    const name = item.product.name + (item.product.variant ? ` (${item.product.variant})` : "");
    return `- ${name}: R${price.toFixed(2)}${item.product.unit ? ` per ${item.product.unit}` : ""}`;
  });

  // Fans-online summary: top 5 hours
  const topFanHours = Object.entries(fansOnline)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([h, c]) => `${h.padStart(2, "0")}:00 (${c} fans)`)
    .join(", ");

  // Calculate number of days and build date list
  const promoStart = new Date(promo.promoDateFrom);
  const promoEnd = new Date(promo.promoDateTo);
  const msPerDay = 24 * 60 * 60 * 1000;
  const numDays = Math.round((promoEnd.getTime() - promoStart.getTime()) / msPerDay) + 1;

  const promoDates: string[] = [];
  for (let i = 0; i < numDays; i++) {
    const d = new Date(promoStart.getTime() + i * msPerDay);
    promoDates.push(d.toISOString().slice(0, 10));
  }

  const systemPrompt = `You are an expert social media campaign manager specialising in South African retail promotions.
You create data-driven, engaging Facebook campaign schedules that maximise reach and engagement.
You always respond with valid JSON only — no markdown, no explanation outside the JSON.`;

  const userPrompt = `Plan a Facebook campaign for this retail promotion.

PROMO DETAILS:
- Title: ${promo.title}
- Store: ${promo.store?.name ?? "Unknown store"}
- Dates: ${promo.promoDateFrom.toISOString().slice(0, 10)} to ${promo.promoDateTo.toISOString().slice(0, 10)} (${numDays} days)
- Facebook Page: ${page.pageName}
- Products on special:
${productList.join("\n")}

PAGE PERFORMANCE DATA:
- Fans most active online (by hour SAST): ${topFanHours || "No data yet"}
- Historical promo posts on this page (last 90 days): ${historicalPosts.length} posts
- Average reach per promo post: ${avgReach > 0 ? avgReach : "No data yet"}
- Best performing posting hour (SAST): ${topHour !== null ? `${String(topHour).padStart(2, "0")}:00` : "No data yet"}

EXISTING POSTS ALREADY SCHEDULED (avoid these exact times):
${conflictSlots.length > 0 ? conflictSlots.join("\n") : "None — all slots are open"}

TASK:
Create exactly one Facebook post per day for every day of the promo (${numDays} posts total).
Dates required: ${promoDates.join(", ")}

Rules:
1. Choose the optimal posting time (SAST, whole hours only like "09:00") based on the fans-online data and historical best-performing hours. Default to 10:00 if no data.
2. If a time conflicts with an existing scheduled post (within 90 minutes), shift to the next-best available hour.
3. Vary caption tone: Day 1 = excitement/launch, middle days = highlight specific deals, last day = urgency/don't miss out.
4. Keep captions engaging, conversational, and in South African English. Include relevant emojis. Mention specific products and prices where appropriate. End with a call to action.
5. MUST include a post for every single date listed — do not skip any.

Respond with ONLY this JSON (no other text):
{
  "schedule": [
    {
      "date": "YYYY-MM-DD",
      "time": "HH:00",
      "caption": "Full post caption here",
      "reasoning": "Brief explanation of time/content choice"
    }
  ]
}`;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY is not configured" }, { status: 503 });
  }

  const anthropic = new Anthropic({ apiKey });

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 4096,
    messages: [{ role: "user", content: userPrompt }],
    system: systemPrompt,
  });

  const rawContent = message.content[0];
  if (rawContent.type !== "text") {
    return NextResponse.json({ error: "Unexpected response from AI" }, { status: 500 });
  }

  let schedule: CampaignPost[];
  try {
    // Strip markdown code fences if Claude wrapped the JSON
    const jsonText = rawContent.text
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```\s*$/, "")
      .trim();
    const parsed = JSON.parse(jsonText) as { schedule: CampaignPost[] };
    schedule = parsed.schedule;
  } catch {
    return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
  }

  return NextResponse.json({
    schedule,
    insights: {
      avgReach,
      topHour,
      historicalPostCount: historicalPosts.length,
    },
  });
}
