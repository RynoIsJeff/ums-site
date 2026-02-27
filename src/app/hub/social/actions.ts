"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireHubAuth } from "@/lib/auth";
import { canAccessClient } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { getPageProfile, getPageInstagramAccountId } from "@/lib/facebook";

const ConnectPageSchema = z.object({
  clientId: z.string().min(1),
  pageId: z.string().min(1, "Page ID is required"),
  pageName: z.string().min(1, "Page name is required"),
  pageAccessToken: z.string().min(1, "Page access token is required"),
});

const CreatePostSchema = z.object({
  clientId: z.string().min(1),
  socialPageIds: z.array(z.string().min(1)).min(1, "Please select at least one page"),
  caption: z.string().min(1, "Caption is required").max(63206),
  scheduledFor: z.string().optional(),
});

const UpdatePostSchema = z.object({
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
  let metadata: { profilePictureUrl?: string; coverPhotoUrl?: string } | undefined;
  let instagramBusinessAccountId: string | null = null;
  try {
    const [profileResult, igResult] = await Promise.all([
      getPageProfile(pageId, pageAccessToken),
      getPageInstagramAccountId(pageId, pageAccessToken),
    ]);
    if (profileResult.ok) {
      metadata = {
        profilePictureUrl: profileResult.profile.pictureUrl,
        coverPhotoUrl: profileResult.profile.coverUrl,
      };
    }
    if (igResult.ok) instagramBusinessAccountId = igResult.igUserId;
  } catch {
    // Ignore
  }

  if (existing) {
    await prisma.socialPage.update({
      where: { id: existing.id },
      data: {
        pageName,
        pageAccessTokenEncrypted: pageAccessToken,
        instagramBusinessAccountId,
        ...(metadata && { metadata }),
      },
    });
    revalidatePath("/hub/social");
    revalidatePath("/hub/social/pages");
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
      instagramBusinessAccountId,
      ...(metadata && { metadata }),
    },
    update: {
      pageName,
      pageAccessTokenEncrypted: pageAccessToken,
      instagramBusinessAccountId,
      ...(metadata && { metadata }),
    },
  });

  revalidatePath("/hub/social");
  revalidatePath("/hub/social/pages");
  revalidatePath("/hub/clients/[id]");
  redirect("/hub/social");
}

export async function createPost(
  _prev: SocialFormState,
  formData: FormData
): Promise<SocialFormState> {
  const { scope, user } = await requireHubAuth();

  const pageIds = formData.getAll("socialPageIds");
  const raw = {
    clientId: formData.get("clientId"),
    socialPageIds: Array.isArray(pageIds) ? pageIds.filter((id): id is string => typeof id === "string") : [],
    caption: (formData.get("caption") as string)?.trim(),
    scheduledFor: formData.get("scheduledFor") || undefined,
  };

  const parsed = CreatePostSchema.safeParse(raw);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Invalid input";
    return { error: msg };
  }

  const { clientId, socialPageIds, caption, scheduledFor } = parsed.data;
  if (!canAccessClient(scope, clientId)) {
    return { error: "Access denied to this client." };
  }

  const pages = await prisma.socialPage.findMany({
    where: {
      id: { in: socialPageIds },
      socialAccount: { clientId },
    },
    include: { socialAccount: { select: { clientId: true } } },
  });

  if (pages.length !== socialPageIds.length) {
    return { error: "One or more selected pages are invalid for this client." };
  }

  const scheduledAt = scheduledFor ? new Date(scheduledFor) : null;
  const status = scheduledAt && scheduledAt > new Date() ? "SCHEDULED" : "DRAFT";

  await prisma.socialPost.createMany({
    data: pages.map((page) => ({
      clientId,
      socialPageId: page.id,
      provider: "META",
      status,
      caption,
      scheduledFor: scheduledAt,
      createdById: user.id,
    })),
  });

  revalidatePath("/hub/social");
  revalidatePath("/hub/social/calendar");
  revalidatePath("/hub/clients/[id]");

  if (formData.get("noRedirect") === "true") {
    return {};
  }
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

  const parsed = UpdatePostSchema.safeParse(raw);
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
  revalidatePath("/hub/social/calendar");
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
  revalidatePath("/hub/social/calendar");
  revalidatePath(`/hub/social/posts/${postId}`);
  return {};
}

export async function refreshPageProfile(socialPageId: string): Promise<SocialFormState> {
  const { scope } = await requireHubAuth();

  const page = await prisma.socialPage.findUnique({
    where: { id: socialPageId },
    include: { socialAccount: { select: { clientId: true } } },
  });
  if (!page || !canAccessClient(scope, page.socialAccount.clientId)) {
    return { error: "Page not found or access denied." };
  }
  const token = page.pageAccessTokenEncrypted;
  if (!token) return { error: "Page has no access token." };

  const result = await getPageProfile(page.pageExternalId, token);
  if (!result.ok) return { error: result.error };

  const metadata = page.metadata && typeof page.metadata === "object" ? { ...page.metadata } : {};
  Object.assign(metadata, {
    profilePictureUrl: result.profile.pictureUrl,
    coverPhotoUrl: result.profile.coverUrl,
  });

  await prisma.socialPage.update({
    where: { id: socialPageId },
    data: { pageName: result.profile.name || page.pageName, metadata },
  });

  revalidatePath("/hub/social");
  revalidatePath("/hub/social/pages");
  return {};
}

const UpdatePagePictureSchema = z.object({
  socialPageId: z.string().min(1),
  imageUrl: z.string().url("Enter a valid image URL"),
  type: z.enum(["profile", "cover"]),
});

export async function updatePagePicture(
  _prev: SocialFormState,
  formData: FormData
): Promise<SocialFormState> {
  const { scope } = await requireHubAuth();

  const raw = {
    socialPageId: formData.get("socialPageId"),
    imageUrl: (formData.get("imageUrl") as string)?.trim(),
    type: formData.get("type"),
  };
  const parsed = UpdatePagePictureSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { socialPageId, imageUrl, type } = parsed.data;

  const page = await prisma.socialPage.findUnique({
    where: { id: socialPageId },
    include: { socialAccount: { select: { clientId: true } } },
  });
  if (!page || !canAccessClient(scope, page.socialAccount.clientId)) {
    return { error: "Page not found or access denied." };
  }
  const token = page.pageAccessTokenEncrypted;
  if (!token) return { error: "Page has no access token." };

  const { updatePageProfilePicture, updatePageCover } = await import("@/lib/facebook");
  const result =
    type === "profile"
      ? await updatePageProfilePicture(page.pageExternalId, token, imageUrl)
      : await updatePageCover(page.pageExternalId, token, imageUrl);

  if (!result.ok) return { error: result.error };

  const metadata = page.metadata && typeof page.metadata === "object" ? { ...page.metadata } : {};
  if (type === "profile") (metadata as Record<string, string>).profilePictureUrl = imageUrl;
  else (metadata as Record<string, string>).coverPhotoUrl = imageUrl;

  await prisma.socialPage.update({
    where: { id: socialPageId },
    data: { metadata },
  });

  revalidatePath("/hub/social");
  revalidatePath("/hub/social/pages");
  return {};
}
