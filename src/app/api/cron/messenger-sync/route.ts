import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const GRAPH_BASE = "https://graph.facebook.com/v22.0";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = (req as Request & { headers: Headers }).headers.get("Authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const pages = await prisma.socialPage.findMany({
    where: { provider: "META", pageAccessTokenEncrypted: { not: null } },
    select: { id: true, pageExternalId: true, pageAccessTokenEncrypted: true },
  });

  let newMessages = 0;
  let errors = 0;

  for (const page of pages) {
    try {
      const token = page.pageAccessTokenEncrypted!;
      const fields = "id,participants,messages{id,message,from,created_time}";
      const url = `${GRAPH_BASE}/${page.pageExternalId}/conversations?platform=messenger&fields=${fields}&limit=25&access_token=${encodeURIComponent(token)}`;

      const res = await fetch(url, { cache: "no-store" });
      const data = (await res.json()) as {
        data?: {
          id: string;
          participants?: { data: { id: string; name: string }[] };
          messages?: { data: { id: string; message?: string; from?: { id: string }; created_time: string }[] };
        }[];
        error?: { message: string };
      };

      if (!res.ok || data.error) { errors++; continue; }

      for (const conv of data.data ?? []) {
        const participant = conv.participants?.data?.find((p) => p.id !== page.pageExternalId);
        if (!participant) continue;

        const dbConv = await prisma.messengerConversation.upsert({
          where: { socialPageId_participantPsid: { socialPageId: page.id, participantPsid: participant.id } },
          create: { socialPageId: page.id, participantPsid: participant.id, participantName: participant.name, isRead: false },
          update: { participantName: participant.name },
        });

        // FB returns newest-first; process oldest-first for correct ordering
        const messages = (conv.messages?.data ?? []).slice().reverse();
        let hasNewIncoming = false;

        for (const msg of messages) {
          if (!msg.message) continue;
          const already = msg.id
            ? await prisma.messengerMessage.findFirst({ where: { externalMid: msg.id } })
            : null;
          if (already) continue;

          const isIncoming = msg.from?.id !== page.pageExternalId;
          await prisma.messengerMessage.create({
            data: {
              conversationId: dbConv.id,
              direction: isIncoming ? "IN" : "OUT",
              externalMid: msg.id,
              content: msg.message,
              createdAt: new Date(msg.created_time),
            },
          });
          if (isIncoming) hasNewIncoming = true;
          newMessages++;
        }

        // If new incoming messages arrived, mark conversation unread and reopen if done
        if (hasNewIncoming) {
          const latest = conv.messages?.data?.[0];
          await prisma.messengerConversation.update({
            where: { id: dbConv.id },
            data: {
              isRead: false,
              status: "OPEN",
              lastMessageAt: latest?.created_time ? new Date(latest.created_time) : new Date(),
            },
          });
        } else {
          // Still update lastMessageAt if we have it
          const latest = conv.messages?.data?.[0];
          if (latest?.created_time) {
            await prisma.messengerConversation.update({
              where: { id: dbConv.id },
              data: { lastMessageAt: new Date(latest.created_time) },
            });
          }
        }
      }
    } catch {
      errors++;
    }
  }

  return NextResponse.json({ ok: true, pages: pages.length, newMessages, errors });
}
