"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireHubAuth } from "@/lib/auth";
import { canAccessClient } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

const ConnectPageSchema = z.object({
  clientId: z.string().min(1),
  pageId: z.string().min(1, "Page ID is required"),
  pageName: z.string().min(1, "Page name is required"),
  pageAccessToken: z.string().min(1, "Page access token is required"),
});

const PostSchema = z.object({
  clientId: z.string().min(1),
  socialPageId: z.string().min(1, "Please select a page"),
  caption: z.string().min(1, "Caption is required").max(63206),
  scheduledFor: z.string().optional(),
});

export type SocialFormState = { error?: string };

export async function connectFacebookPage(
  _prev: SocialFormState,
  formData: FormData
): Promise<SocialFormState> {
  const { scope, user } = await requireHubAuth();

  const raw = {
    clientId: formData.get("clientId"),
    pageId: (formData.get("pageId") as string)?.trim(),
    pageName: (formData.get("pageName") as string)?.trim(),
    pageAccessToken: (formData.get("pageAccessToken") as string)?.trim(),
  };

  const parsed = ConnectPageSchema.safeParse(raw);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Invalid input";
    return { error: msg };
  }

  const { clientId, pageId, pageName, pageAccessToken } = parsed.data;
  if (!canAccessClient(scope, clientId)) {
    return { error: "Access denied to this client." };
  }

  const existing = await prisma.socialPage.findFirst({
    where: { provider: "META", pageExternalId: pageId },
    include: { socialAccount: { select: { clientId: true } } },
  });
  if (existing && existing.socialAccount.clientId !== clientId) {
    return { error: "This Facebook page is already connected to another client." };
  }
  if (existing) {
    await prisma.socialPage.update({
      where: { id: existing.id },
      data: {
        pageName,
        pageAccessTokenEncrypted: pageAccessToken,
      },
    });
    revalidatePath("/hub/social");
    revalidatePath("/hub/clients/[id]");
    redirect("/hub/social");
  }

  const account = await prisma.socialAccount.upsert({
    where: {
      provider_accountExternalId: { provider: "META", accountExternalId: pageId },
    },
    create: {
      clientId,
      provider: "META",
      accountName: pageName,
      accountExternalId: pageId,
      accessTokenEncrypted: pageAccessToken,
    },
    update: {
      accountName: pageName,
      accessTokenEncrypted: pageAccessToken,
    },
  });

  await prisma.socialPage.upsert({
    where: {
      provider_pageExternalId: { provider: "META", pageExternalId: pageId },
    },
    create: {
      socialAccountId: account.id,
      provider: "META",
      pageName,
      pageExternalId: pageId,
      pageAccessTokenEncrypted: pageAccessToken,
    },
    update: {
      pageName,
      pageAccessTokenEncrypted: pageAccessToken,
    },
  });

  revalidatePath("/hub/social");
  revalidatePath("/hub/clients/[id]");
  redirect("/hub/social");
}

export async function createPost(
  _prev: SocialFormState,
  formData: FormData
): Promise<SocialFormState> {
  const { scope, user } = await requireHubAuth();

  const raw = {
    clientId: formData.get("clientId"),
    socialPageId: formData.get("socialPageId"),
    caption: (formData.get("caption") as string)?.trim(),
    scheduledFor: formData.get("scheduledFor") || undefined,
  };

  const parsed = PostSchema.safeParse(raw);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Invalid input";
    return { error: msg };
  }

  const { clientId, socialPageId, caption, scheduledFor } = parsed.data;
  if (!canAccessClient(scope, clientId)) {
    return { error: "Access denied to this client." };
  }

  const page = await prisma.socialPage.findFirst({
    where: { id: socialPageId },
    include: { socialAccount: { select: { clientId: true } } },
  });
  if (!page || page.socialAccount.clientId !== clientId) {
    return { error: "Invalid page for this client." };
  }

  const scheduledAt = scheduledFor ? new Date(scheduledFor) : null;
  const status = scheduledAt && scheduledAt > new Date() ? "SCHEDULED" : "DRAFT";

  await prisma.socialPost.create({
    data: {
      clientId,
      socialPageId: page.id,
      provider: "META",
      status,
      caption,
      scheduledFor: scheduledAt,
      createdById: user.id,
    },
  });

  revalidatePath("/hub/social");
  revalidatePath("/hub/clients/[id]");
  redirect("/hub/social");
}

export async function updatePost(
  postId: string,
  _prev: SocialFormState,
  formData: FormData
): Promise<SocialFormState> {
  const { scope, user } = await requireHubAuth();

  const post = await prisma.socialPost.findUnique({
    where: { id: postId },
    include: { socialPage: { include: { socialAccount: true } } },
  });
  if (!post || !canAccessClient(scope, post.clientId)) {
    return { error: "Post not found or access denied." };
  }
  if (post.status !== "DRAFT" && post.status !== "SCHEDULED") {
    return { error: "Only draft or scheduled posts can be edited." };
  }

  const raw = {
    clientId: post.clientId,
    socialPageId: formData.get("socialPageId") ?? post.socialPageId,
    caption: (formData.get("caption") as string)?.trim(),
    scheduledFor: formData.get("scheduledFor") || undefined,
  };

  const parsed = PostSchema.safeParse(raw);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Invalid input";
    return { error: msg };
  }

  const { socialPageId, caption, scheduledFor } = parsed.data;

  const page = socialPageId
    ? await prisma.socialPage.findFirst({
        where: { id: socialPageId },
        include: { socialAccount: { select: { clientId: true } } },
      })
    : null;
  if (socialPageId && (!page || page.socialAccount.clientId !== post.clientId)) {
    return { error: "Invalid page for this client." };
  }

  const scheduledAt = scheduledFor ? new Date(scheduledFor) : null;
  const status =
    scheduledAt && scheduledAt > new Date()
      ? "SCHEDULED"
      : post.status === "SCHEDULED"
        ? "DRAFT"
        : post.status;

  await prisma.socialPost.update({
    where: { id: postId },
    data: {
      socialPageId: page?.id ?? post.socialPageId,
      caption,
      scheduledFor: scheduledAt,
      status,
    },
  });

  revalidatePath("/hub/social");
  revalidatePath(`/hub/social/posts/${postId}`);
  revalidatePath("/hub/clients/[id]");
  redirect("/hub/social");
}

export async function cancelPost(postId: string): Promise<SocialFormState> {
  const { scope } = await requireHubAuth();

  const post = await prisma.socialPost.findUnique({
    where: { id: postId },
    select: { clientId: true, status: true },
  });
  if (!post || !canAccessClient(scope, post.clientId)) {
    return { error: "Post not found or access denied." };
  }
  if (post.status !== "DRAFT" && post.status !== "SCHEDULED") {
    return { error: "Only draft or scheduled posts can be cancelled." };
  }

  await prisma.socialPost.update({
    where: { id: postId },
    data: { status: "CANCELLED" },
  });

  revalidatePath("/hub/social");
  revalidatePath(`/hub/social/posts/${postId}`);
  return {};
}
