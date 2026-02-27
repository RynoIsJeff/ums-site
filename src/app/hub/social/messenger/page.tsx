import Link from "next/link";
import { getSession } from "@/lib/auth";
import { toAuthScope } from "@/lib/auth";
import { clientWhere } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { MessageCircle, ExternalLink, Settings } from "lucide-react";
import { MessengerInbox } from "./_components/MessengerInbox";

export const metadata = {
  title: "Messenger | UMS Hub",
};

export default async function MessengerPage() {
  const { user } = await getSession();
  if (!user) return null;

  const scope = toAuthScope(user);
  const pages = await prisma.socialPage.findMany({
    where: {
      provider: "META",
      socialAccount: { client: clientWhere(scope) },
    },
    include: {
      messengerConversations: {
        include: { messages: { orderBy: { createdAt: "asc" }, take: 50 } },
        orderBy: { lastMessageAt: "desc" },
      },
      socialAccount: { select: { client: { select: { companyName: true } } } },
    },
  });

  const webhookUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}` || ""
    : "https://yoursite.com";

  return (
    <section className="py-6">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-(--hub-text)">
            Messenger
          </h1>
          <p className="mt-1 text-sm text-(--hub-muted)">
            View and respond to messages from your Facebook pages.
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href="https://business.facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-(--hub-border-light) px-4 py-2 text-sm font-medium hover:bg-black/5"
          >
            <ExternalLink className="h-4 w-4" />
            Business Suite
          </a>
        </div>
      </div>

      {!process.env.MESSENGER_VERIFY_TOKEN && (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Set <code className="rounded bg-amber-100 px-1">MESSENGER_VERIFY_TOKEN</code> and add webhook{" "}
          <code className="rounded bg-amber-100 px-1">{webhookUrl}/api/webhooks/messenger</code> in Meta App Dashboard to receive messages.
        </div>
      )}

      <div className="mt-8">
        <MessengerInbox pages={pages} />
      </div>
    </section>
  );
}
