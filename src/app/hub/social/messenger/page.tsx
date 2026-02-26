import Link from "next/link";
import { MessageCircle, Settings, ExternalLink } from "lucide-react";

export const metadata = {
  title: "Messenger | UMS Hub",
};

export default function MessengerPage() {
  return (
    <section className="py-6">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#050505]">
            Messenger
          </h1>
          <p className="mt-1 text-sm text-[#65676b]">
            View and respond to messages from your Facebook pages.
          </p>
        </div>
      </div>

      <div className="mt-12 rounded-xl border border-[#e4e6eb] bg-white p-12 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#0084ff]/10">
          <MessageCircle className="h-8 w-8 text-[#0084ff]" />
        </div>
        <h2 className="mt-6 text-lg font-semibold text-[#050505]">
          Messenger inbox coming soon
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-[#65676b]">
          To enable Messenger, you'll need to configure your Meta app with the{" "}
          <code className="rounded bg-[#f0f2f5] px-1.5 py-0.5 text-xs">pages_messaging</code>{" "}
          permission and set up a webhook to receive incoming messages.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <a
            href="https://www.facebook.com/business/help/2041148702659525"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-[#0084ff] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#0073e6]"
          >
            <ExternalLink className="h-4 w-4" />
            Meta Messenger setup guide
          </a>
          <a
            href="https://business.facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-[#e4e6eb] bg-white px-4 py-2.5 text-sm font-medium text-[#050505] hover:bg-[#f0f2f5]"
          >
            <Settings className="h-4 w-4" />
            Open Meta Business Suite
          </a>
        </div>
        <p className="mt-6 text-xs text-[#65676b]">
          In the meantime, use{" "}
          <a
            href="https://business.facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[#0084ff] hover:underline"
          >
            Meta Business Suite
          </a>{" "}
          to manage your Messenger conversations.
        </p>
      </div>
    </section>
  );
}
