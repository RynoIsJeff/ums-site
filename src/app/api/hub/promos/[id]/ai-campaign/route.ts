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

  // Fetch promo with items and client brand voice
  const promo = await prisma.promo.findFirst({
    where: { id: promoId, ...scopeWhere },
    include: {
      store: { select: { name: true } },
      client: { select: { brandVoice: true } },
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

  // Past-date guard: "today" in SAST (UTC+2)
  const todaySast = new Date(Date.now() + 2 * 60 * 60 * 1000);
  todaySast.setUTCHours(0, 0, 0, 0);
  if (promo.promoDateTo < todaySast) {
    return NextResponse.json(
      { error: "This promo has already ended. No posts can be scheduled." },
      { status: 400 },
    );
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

  // Build richer product list for prompt
  type CardVariant = { label: string; promoPrice: number; originalPrice?: number };
  const productList = promo.items.map((item) => {
    const variants = item.variants as CardVariant[] | null;
    if (Array.isArray(variants) && variants.length >= 2) {
      const varStr = variants
        .map(
          (v) =>
            `${v.label}: R${v.promoPrice.toFixed(2)}${v.originalPrice ? ` (was R${v.originalPrice.toFixed(2)}, save R${(v.originalPrice - v.promoPrice).toFixed(2)})` : ""}`,
        )
        .join(" | ");
      return `- ${item.product.name}: ${varStr}`;
    }
    const promoPrice = item.priceOverride ? toNum(item.priceOverride) : toNum(item.product.price);
    const originalPrice = item.originalPrice ? toNum(item.originalPrice) : null;
    const saving =
      originalPrice && originalPrice > promoPrice
        ? ` (was R${originalPrice.toFixed(2)}, save R${(originalPrice - promoPrice).toFixed(2)})`
        : "";
    const name = item.product.name + (item.product.variant ? ` (${item.product.variant})` : "");
    const unit = item.product.unit ? ` per ${item.product.unit}` : "";
    return `- ${name}: R${promoPrice.toFixed(2)}${unit}${saving}`;
  });

  // Fans-online summary: top 5 hours
  const topFanHours = Object.entries(fansOnline)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([h, c]) => `${h.padStart(2, "0")}:00 (${c} fans)`)
    .join(", ");

  // Build date list — only future dates (from today SAST onwards)
  const promoStart = new Date(promo.promoDateFrom);
  const promoEnd = new Date(promo.promoDateTo);
  const msPerDay = 24 * 60 * 60 * 1000;
  const totalDays = Math.round((promoEnd.getTime() - promoStart.getTime()) / msPerDay) + 1;

  const promoDates: string[] = [];
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(promoStart.getTime() + i * msPerDay);
    if (d >= todaySast) promoDates.push(d.toISOString().slice(0, 10));
  }

  if (promoDates.length === 0) {
    return NextResponse.json(
      { error: "No remaining days to schedule posts for this promo." },
      { status: 400 },
    );
  }

  // Brand voice from client
  const bv = (promo.client?.brandVoice ?? {}) as Record<string, string>;

  const systemPrompt = `You are an expert social media campaign manager specialising in South African retail promotions.
You create data-driven, engaging Facebook campaign schedules that maximise reach and engagement.
You always respond with valid JSON only — no markdown, no explanation outside the JSON.`;

  const userPrompt = `Plan a Facebook campaign for this retail promotion.

PROMO DETAILS:
- Title: ${promo.title}
- Store: ${promo.store?.name ?? "Unknown store"}
- Full promo period: ${promo.promoDateFrom.toISOString().slice(0, 10)} to ${promo.promoDateTo.toISOString().slice(0, 10)}
- Remaining days to schedule: ${promoDates.length}
- Facebook Page: ${page.pageName}
- Products on special (with savings where available):
${productList.join("\n")}

BRAND VOICE & STYLE (apply to ALL captions):
- Tone: ${bv.tone || "friendly, conversational, South African retail"}
- Slogans/taglines to weave in naturally: ${bv.slogans || "none provided"}
- Target audience: ${bv.audience || "general public"}
- Preferred hashtags: ${bv.hashtags || "none"}
- Words/phrases to use: ${bv.useWords || "none"}
- Words/phrases to AVOID: ${bv.avoidWords || "none"}
- Preferred call-to-action: ${bv.cta || "Visit us today!"}
- Always mention the store by name: ${promo.store?.name ?? "the store"}

PAGE PERFORMANCE DATA:
- Fans most active online (by hour SAST): ${topFanHours || "No data yet"}
- Historical promo posts on this page (last 90 days): ${historicalPosts.length} posts
- Average reach per promo post: ${avgReach > 0 ? avgReach : "No data yet"}
- Best performing posting hour (SAST): ${topHour !== null ? `${String(topHour).padStart(2, "0")}:00` : "No data yet"}

EXISTING POSTS ALREADY SCHEDULED (avoid these exact times):
${conflictSlots.length > 0 ? conflictSlots.join("\n") : "None — all slots are open"}

TASK:
Create exactly one Facebook post per remaining day (${promoDates.length} posts total).
Dates required: ${promoDates.join(", ")}

Rules:
1. Choose the optimal posting time (SAST, whole hours only like "09:00") based on the fans-online data and historical best-performing hours. Default to 10:00 if no data.
2. If a time conflicts with an existing scheduled post (within 90 minutes), shift to the next-best available hour.
3. Vary caption tone: first day = excitement/launch (introduce all items), middle days = spotlight 1-2 items with specific prices and savings, last day = urgency ("Don't miss out before ${promo.promoDateTo.toISOString().slice(0, 10)}!").
4. Keep captions engaging, conversational, and in South African English. Include relevant emojis. Use specific prices and savings amounts (e.g. "Get 2kg Flour for only R24.99 — that's R10 off!"). Apply the brand voice above consistently.
5. MUST include a post for every single date listed — do not skip any.
6. Each day should spotlight DIFFERENT products from the list. Middle days: deep-dive one or two items per day, highlighting savings.

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
