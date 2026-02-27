import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const VERIFY_TOKEN = process.env.MESSENGER_VERIFY_TOKEN;

/**
 * Meta Messenger webhook. GET for verification, POST for events.
 * Configure in Meta App Dashboard: Webhooks → Add Callback URL
 * Subscribe to: messages, messaging_postbacks
 */
export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get("hub.mode");
  const token = req.nextUrl.searchParams.get("hub.verify_token");
  const challenge = req.nextUrl.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN && challenge) {
    return new NextResponse(challenge);
  }
  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.object !== "page") {
      return new NextResponse("OK", { status: 200 });
    }

    for (const entry of body.entry ?? []) {
      for (const event of entry.messaging ?? []) {
        const senderId = event.sender?.id;
        const recipientId = event.recipient?.id;
        const message = event.message;
        if (!senderId || !recipientId || !message?.text) continue;

        const pageId = recipientId;
        const page = await prisma.socialPage.findFirst({
          where: { pageExternalId: pageId },
          select: { id: true },
        });
        if (!page) continue;

        const conv = await prisma.messengerConversation.upsert({
          where: {
            socialPageId_participantPsid: {
              socialPageId: page.id,
              participantPsid: senderId,
            },
          },
          create: {
            socialPageId: page.id,
            participantPsid: senderId,
            participantName: null,
          },
          update: { lastMessageAt: new Date() },
        });

        await prisma.messengerMessage.create({
          data: {
            conversationId: conv.id,
            direction: "IN",
            externalMid: message.mid,
            content: message.text,
          },
        });
      }
    }
  } catch {
    // Log error
  }
  return new NextResponse("OK", { status: 200 });
}
