"use server";

import { revalidatePath } from "next/cache";
import { requireHubAuth } from "@/lib/auth";
import { canAccessClient } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { sendMessengerMessage } from "@/lib/facebook";

const GRAPH_BASE = "https://graph.facebook.com/v22.0";

export async function syncPageConversations(
  pageId: string,
): Promise<{ ok: boolean; count?: number; error?: string }> {
  const { scope } = await requireHubAuth();

  const page = await prisma.socialPage.findUnique({
    where: { id: pageId },
    include: { socialAccount: true },
  });
  if (!page || !canAccessClient(scope, page.socialAccount.clientId)) {
    return { ok: false, error: "Page not found." };
  }
  const token = page.pageAccessTokenEncrypted;
  if (!token) return { ok: false, error: "Page has no access token configured." };

  const fields = "id,participants,messages{id,message,from,created_time}";
  const url = `${GRAPH_BASE}/${page.pageExternalId}/conversations?platform=messenger&fields=${fields}&limit=25&access_token=${encodeURIComponent(token)}`;

  let fbData: { data?: unknown[]; error?: { message: string } };
  try {
    const res = await fetch(url, { cache: "no-store" });
    fbData = await res.json();
    if (!res.ok) return { ok: false, error: fbData.error?.message ?? `Facebook API error (${res.status})` };
  } catch {
    return { ok: false, error: "Network error reaching Facebook." };
  }

  const conversations = (fbData.data ?? []) as {
    id: string;
    participants?: { data: { id: string; name: string }[] };
    messages?: { data: { id: string; message?: string; from?: { id: string }; created_time: string }[] };
  }[];

  let synced = 0;
  for (const conv of conversations) {
    const participant = conv.participants?.data?.find((p) => p.id !== page.pageExternalId);
    if (!participant) continue;

    const dbConv = await prisma.messengerConversation.upsert({
      where: { socialPageId_participantPsid: { socialPageId: page.id, participantPsid: participant.id } },
      create: { socialPageId: page.id, participantPsid: participant.id, participantName: participant.name, isRead: true },
      update: { participantName: participant.name, isRead: true },
    });

    const messages = (conv.messages?.data ?? []).reverse(); // FB returns newest-first; flip for chronological
    for (const msg of messages) {
      if (!msg.message) continue;
      const alreadyExists = msg.id
        ? await prisma.messengerMessage.findFirst({ where: { externalMid: msg.id } })
        : null;
      if (alreadyExists) continue;

      await prisma.messengerMessage.create({
        data: {
          conversationId: dbConv.id,
          direction: msg.from?.id === page.pageExternalId ? "OUT" : "IN",
          externalMid: msg.id,
          content: msg.message,
          createdAt: new Date(msg.created_time),
        },
      });
    }

    const latestMsg = conv.messages?.data?.[0];
    if (latestMsg?.created_time) {
      await prisma.messengerConversation.update({
        where: { id: dbConv.id },
        data: { lastMessageAt: new Date(latestMsg.created_time) },
      });
    }

    synced++;
  }

  revalidatePath("/hub/social/messenger");
  return { ok: true, count: synced };
}

export async function sendMessengerReply(
  conversationId: string,
  participantPsid: string,
  pageAccessToken: string,
  formData: FormData
): Promise<{ error?: string }> {
  const { scope } = await requireHubAuth();

  const conv = await prisma.messengerConversation.findUnique({
    where: { id: conversationId },
    include: { socialPage: { include: { socialAccount: true } } },
  });
  if (!conv || !canAccessClient(scope, conv.socialPage.socialAccount.clientId)) {
    return { error: "Conversation not found." };
  }

  const message = (formData.get("message") as string)?.trim();
  if (!message) return { error: "Message is required." };

  const token = pageAccessToken || conv.socialPage.pageAccessTokenEncrypted;
  if (!token) return { error: "Page has no access token." };

  const result = await sendMessengerMessage(token, participantPsid, message);
  if (!result.ok) return { error: result.error };

  await prisma.messengerMessage.create({
    data: {
      conversationId,
      direction: "OUT",
      externalMid: result.messageId,
      content: message,
    },
  });

  await prisma.messengerConversation.update({
    where: { id: conversationId },
    data: { lastMessageAt: new Date() },
  });

  revalidatePath("/hub/social/messenger");
  return {};
}

async function getConvWithAccess(conversationId: string) {
  const { scope } = await requireHubAuth();
  const conv = await prisma.messengerConversation.findUnique({
    where: { id: conversationId },
    include: { socialPage: { include: { socialAccount: true } } },
  });
  if (!conv || !canAccessClient(scope, conv.socialPage.socialAccount.clientId)) return null;
  return conv;
}

export async function markConversationRead(conversationId: string): Promise<{ error?: string }> {
  if (!await getConvWithAccess(conversationId)) return { error: "Not found." };
  await prisma.messengerConversation.update({ where: { id: conversationId }, data: { isRead: true } });
  revalidatePath("/hub/social/messenger");
  return {};
}

export async function markConversationDone(conversationId: string): Promise<{ error?: string }> {
  if (!await getConvWithAccess(conversationId)) return { error: "Not found." };
  await prisma.messengerConversation.update({
    where: { id: conversationId },
    data: { status: "DONE", isRead: true },
  });
  revalidatePath("/hub/social/messenger");
  return {};
}

export async function markConversationOpen(conversationId: string): Promise<{ error?: string }> {
  if (!await getConvWithAccess(conversationId)) return { error: "Not found." };
  await prisma.messengerConversation.update({
    where: { id: conversationId },
    data: { status: "OPEN" },
  });
  revalidatePath("/hub/social/messenger");
  return {};
}
