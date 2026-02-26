import { MessageCircle, ExternalLink, Settings } from "lucide-react";
import { ComingSoonPlaceholder } from "@/app/hub/_components/ComingSoonPlaceholder";

export const metadata = {
  title: "Messenger | UMS Hub",
};

export default function MessengerPage() {
  return (
    <section className="py-6">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--hub-text)]">
            Messenger
          </h1>
          <p className="mt-1 text-sm text-[var(--hub-muted)]">
            View and respond to messages from your Facebook pages.
          </p>
        </div>
      </div>

      <div className="mt-12">
        <ComingSoonPlaceholder
          feature="Messenger inbox"
          description={
            <>
              To enable Messenger, you&apos;ll need to configure your Meta app with the{" "}
              <code className="rounded bg-black/5 px-1.5 py-0.5 text-xs">
                pages_messaging
              </code>{" "}
              permission and set up a webhook to receive incoming messages.
            </>
          }
          icon={MessageCircle}
          iconClassName="text-[var(--meta-blue)]"
          primaryAction={{
            href: "https://www.facebook.com/business/help/2041148702659525",
            label: "Meta Messenger setup guide",
            external: true,
            meta: true,
            icon: ExternalLink,
          }}
          secondaryActions={[
            {
              href: "https://business.facebook.com",
              label: "Open Meta Business Suite",
              external: true,
              icon: Settings,
            },
          ]}
          footer={
            <>
              In the meantime, use{" "}
              <a
                href="https://business.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[var(--meta-blue)] hover:underline"
              >
                Meta Business Suite
              </a>{" "}
              to manage your Messenger conversations.
            </>
          }
        />
      </div>
    </section>
  );
}
