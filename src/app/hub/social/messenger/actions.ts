"use server";

import { revalidatePath } from "next/cache";
import { requireHubAuth } from "@/lib/auth";
import { canAccessClient } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { sendMessengerMessage } from "@/lib/facebook";

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
