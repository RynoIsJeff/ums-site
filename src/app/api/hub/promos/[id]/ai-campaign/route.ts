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
    .map(([h, c]) => `${String(h).padStart(2, "0")}:00 (${c} fans)`)
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

  // Compute the best posting hour server-side so the AI doesn't have to guess.
  // Priority: (1) historical best hour from post insights, (2) peak fans-online hour, (3) no data
  const topFansHour =
    Object.keys(fansOnline).length > 0
      ? parseInt(Object.entries(fansOnline).sort(([, a], [, b]) => b - a)[0][0])
      : null;
  const hasTimeData = topHour !== null || topFansHour !== null;
  const recommendedHour = topHour ?? topFansHour ?? null;
  const recommendedTime = recommendedHour !== null
    ? `${String(recommendedHour).padStart(2, "0")}:00`
    : null;

  // Current SAST hour — used to prevent scheduling today's post in the past
  const nowSastMs = Date.now() + 2 * 60 * 60 * 1000;
  const nowSastHour = Math.floor(nowSastMs / (60 * 60 * 1000)) % 24;
  // Minimum schedulable hour for today: at least 1 hour from now
  const minTodayHour = nowSastHour + 1;

  // Last date in the remaining schedule — always post at 07:00 (store opening)
  const lastDate = promoDates[promoDates.length - 1];

  // Is today actually the promo launch day, or is the promo already running?
  const promoLaunchDate = promo.promoDateFrom.toISOString().slice(0, 10);
  const todayDate = todaySast.toISOString().slice(0, 10);
  const isActualLaunchDay = promoDates[0] === promoLaunchDate;
  const currentPromoDay = Math.round((todaySast.getTime() - promoStart.getTime()) / msPerDay) + 1;

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
- Tone: ${bv.tone || "friendly, energetic, community-focused South African retail — speak directly to customers, use exclamation points, feel like a trusted local store"}
- Slogans/taglines to weave in naturally: ${bv.slogans || "none — create enthusiastic promotional copy that feels local and genuine"}
- Target audience: ${bv.audience || "South African families, builders, and DIY enthusiasts looking for value"}
- Words/phrases to use: ${bv.useWords || "specials, deals, savings, affordable, value, don't miss out, grab yours"}
- Words/phrases to AVOID: ${bv.avoidWords || "luxury, exclusive, premium, upmarket"}
- Preferred call-to-action: ${bv.cta || `Visit ${promo.store?.name ?? "us"} today!`}
- Always mention the store by name: ${promo.store?.name ?? "the store"}

PAGE PERFORMANCE DATA:
- Fans most active online (by hour SAST): ${topFanHours || "No data yet"}
- Historical promo posts on this page (last 90 days): ${historicalPosts.length} posts
- Average reach per promo post: ${avgReach > 0 ? avgReach : "No data yet"}
- Best performing posting hour (SAST): ${topHour !== null ? `${String(topHour).padStart(2, "0")}:00` : "No data yet"}
${recommendedTime ? `- DATA-DRIVEN OPTIMAL TIME: ${recommendedTime} SAST (use this for all posts)` : "- No time data yet — choose times by day of week (see rule 1)"}

EXISTING POSTS ALREADY SCHEDULED (avoid these exact times):
${conflictSlots.length > 0 ? conflictSlots.join("\n") : "None — all slots are open"}

PROMO STATUS:
- Today is ${todayDate} (SAST) — this is day ${currentPromoDay} of ${totalDays} of the promo.
- Promo actual launch date: ${promoLaunchDate}
- ${isActualLaunchDay ? "Today IS the launch day — write launch/opening post copy." : `The promo launched on ${promoLaunchDate} and is ALREADY RUNNING. Do NOT write launch copy for the first post. Write mid-promo copy ("still running", "grab it while you can", etc.).`}
- Today's earliest schedulable time: ${String(minTodayHour).padStart(2, "0")}:00 SAST (it is currently ${String(nowSastHour).padStart(2, "0")}:${String(new Date(nowSastMs).getUTCMinutes()).padStart(2, "0")} SAST — do not schedule today's post before this time)

TASK:
Create exactly one Facebook post per remaining day (${promoDates.length} posts total).
Dates required: ${promoDates.join(", ")}

Rules:
1. POSTING TIME (choose ONE rule based on data availability):
   ${recommendedTime
     ? `DATA EXISTS → Use ${recommendedTime} SAST for every post. This is the proven best time for this page. Deviate only when rule 2 forces it.`
     : `NO DATA YET → Choose the best time for each day by day of week. Use realistic variety — do NOT pick 10:00 for every day:
   - Monday–Friday: 12:00 (lunch) or 17:00 (after work, people browse Facebook on the way home)
   - Saturday: 09:00 (morning — people shop early)
   - Sunday: 10:00 (mid-morning)
   Feel free to shift ±1 hour to avoid repetition.`}
2. CONFLICT AVOIDANCE: If a chosen time on a given date is within 90 minutes of an existing scheduled post, shift to the next-best hour.
3. TODAY'S POST: Must be at ${String(minTodayHour).padStart(2, "0")}:00 or later (never in the past).
4. LAST DAY RULE (NON-NEGOTIABLE): The post for ${lastDate} MUST be at 07:00 — store opening time, maximum urgency. No exceptions, even if data says otherwise.
5. CAPTION TONE — follow strictly:
   ${isActualLaunchDay
     ? "- LAUNCH DAY: exciting opening copy. Briefly introduce ALL products on special and invite people to come in."
     : `- MID-PROMO (day ${currentPromoDay}/${totalDays}): "still running!", "grab it while you can", "don't miss these specials". NO launch copy.`}
   - Middle days: spotlight 1–2 specific products per day, use EXACT prices and savings (e.g. "Get 2kg Flour for only R24.99 — that's R10 off!").
   - Last day (${lastDate}): "LAST CHANCE TODAY!", "We close tonight — come grab your specials before it's too late!", "These prices end TODAY!"
6. HASHTAGS: Every post MUST end with relevant hashtags. ${bv.hashtags ? `Use these: ${bv.hashtags}` : `Generate relevant ones for a South African hardware/building supplies retail store, e.g. #WeeklySpecials #BuildIt #HardwareDeals #DIY #SouthAfrica #Specials — adapt to the products featured that day.`}
7. MUST include a post for every single date listed — do not skip any.
8. Each day spotlights DIFFERENT products. Rotate through the full product list.

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

  // Server-side enforcement: last day always 07:00; today's post never in the past
  schedule = schedule.map((post) => {
    if (post.date === lastDate) return { ...post, time: "07:00" };
    if (post.date === todayDate) {
      const [h] = post.time.split(":").map(Number);
      if (h < minTodayHour) return { ...post, time: `${String(minTodayHour).padStart(2, "0")}:00` };
    }
    return post;
  });

  return NextResponse.json({
    schedule,
    insights: {
      avgReach,
      topHour,
      historicalPostCount: historicalPosts.length,
    },
  });
}
