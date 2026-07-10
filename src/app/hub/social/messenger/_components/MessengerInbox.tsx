"use client";

import { useState, useTransition } from "react";
import { MessageCircle, Send, RefreshCw } from "lucide-react";
import { PendingSubmitButton } from "@/app/hub/_components/PendingSubmitButton";
import { sendMessengerReply, syncPageConversations } from "../actions";

type Message = { id?: string; content: string; direction?: string; createdAt?: Date };

type Conversation = {
  id: string;
  participantPsid: string;
  participantName: string | null;
  lastMessageAt: Date;
  messages: Message[];
};

type Page = {
  id: string;
  pageName: string;
  pageExternalId: string;
  pageAccessTokenEncrypted: string | null;
  messengerConversations: Conversation[];
  socialAccount: { client: { companyName: string } };
};

type Props = { pages: Page[] };

export function MessengerInbox({ pages }: Props) {
  const [selectedPageId, setSelectedPageId] = useState<string>(pages[0]?.id ?? "");
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncSuccess, setSyncSuccess] = useState<string | null>(null);
  const [syncing, startSync] = useTransition();

  if (pages.length === 0) {
    return (
      <div className="rounded-xl border border-(--hub-border-light) bg-white p-12 text-center">
        <MessageCircle className="mx-auto h-12 w-12 text-(--hub-muted)" />
        <p className="mt-3 font-medium text-(--hub-text)">No Facebook pages connected</p>
        <p className="mt-1 text-sm text-(--hub-muted)">Connect a page in Social → Pages to receive Messenger messages.</p>
        <a href="/hub/social/pages" className="mt-4 inline-block text-sm font-medium text-(--primary) hover:underline">
          Go to Pages
        </a>
      </div>
    );
  }

  const activePage = pages.find((p) => p.id === selectedPageId) ?? pages[0];
  const conversations = activePage?.messengerConversations ?? [];
  const currentConv = selectedConvId ? conversations.find((c) => c.id === selectedConvId) : null;

  function handleSync() {
    if (!activePage) return;
    setSyncError(null);
    setSyncSuccess(null);
    startSync(async () => {
      const result = await syncPageConversations(activePage.id);
      if (result.ok) {
        setSyncSuccess(`Synced ${result.count ?? 0} conversation${result.count !== 1 ? "s" : ""}`);
        setTimeout(() => setSyncSuccess(null), 3000);
      } else {
        setSyncError(result.error ?? "Sync failed");
      }
    });
  }

  return (
    <div className="flex flex-col rounded-xl border border-(--hub-border-light) bg-white overflow-hidden" style={{ minHeight: 500 }}>
      {/* Page tabs */}
      {pages.length > 1 && (
        <div className="flex items-center gap-1 border-b border-(--hub-border-light) px-3 pt-2 overflow-x-auto">
          {pages.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => { setSelectedPageId(p.id); setSelectedConvId(null); setSyncError(null); setSyncSuccess(null); }}
              className={`shrink-0 rounded-t px-3 py-1.5 text-xs font-medium transition-colors ${
                p.id === selectedPageId
                  ? "border-b-2 border-(--primary) text-(--primary)"
                  : "text-(--hub-muted) hover:text-(--hub-text)"
              }`}
            >
              {p.pageName}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Left: conversation list */}
        <div className="flex w-72 shrink-0 flex-col border-r border-(--hub-border-light)">
          <div className="flex items-center justify-between border-b border-(--hub-border-light) px-3 py-2">
            <span className="text-xs font-medium text-(--hub-muted)">
              {pages.length === 1 && <span className="mr-1 font-semibold text-(--hub-text)">{activePage?.pageName} ·</span>}
              {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
            </span>
            <div className="flex items-center gap-2">
              {syncSuccess && <span className="text-xs text-green-600">{syncSuccess}</span>}
              {syncError && <span className="text-xs text-red-600">{syncError}</span>}
              <button
                type="button"
                onClick={handleSync}
                disabled={syncing}
                title="Sync from Facebook"
                className="flex items-center gap-1 rounded px-2 py-1 text-xs text-(--hub-muted) hover:bg-black/5 disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
                {syncing ? "Syncing…" : "Sync"}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-sm text-(--hub-muted)">
                <p>No conversations yet.</p>
                <p className="mt-1">Click Sync to pull from Facebook,<br />or configure the webhook to receive new messages.</p>
              </div>
            ) : (
              <ul>
                {conversations.map((c) => {
                  const lastMsg = c.messages[c.messages.length - 1];
                  const unread = lastMsg?.direction === "IN";
                  return (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedConvId(c.id)}
                        className={`w-full border-b border-(--hub-border-light) px-4 py-3 text-left hover:bg-black/3 transition-colors ${
                          selectedConvId === c.id ? "bg-(--primary)/5" : ""
                        }`}
                      >
                        <p className={`truncate text-sm ${unread ? "font-semibold text-(--hub-text)" : "font-medium text-(--hub-text)"}`}>
                          {c.participantName || `User ${c.participantPsid.slice(0, 8)}…`}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-(--hub-muted)">
                          {lastMsg?.content ?? "No messages"}
                        </p>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Right: thread */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {currentConv ? (
            <>
              <div className="border-b border-(--hub-border-light) px-4 py-3">
                <p className="font-semibold text-(--hub-text)">
                  {currentConv.participantName || `User ${currentConv.participantPsid}`}
                </p>
                <p className="text-xs text-(--hub-muted)">{activePage?.pageName}</p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {currentConv.messages.map((m, i) => (
                  <div key={m.id ?? i} className={`flex ${m.direction === "OUT" ? "justify-end" : "justify-start"}`}>
                    <p
                      className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                        m.direction === "OUT"
                          ? "bg-(--primary) text-white"
                          : "bg-slate-100 text-(--hub-text)"
                      }`}
                    >
                      {m.content}
                    </p>
                  </div>
                ))}
              </div>

              {activePage?.pageAccessTokenEncrypted && (
                <ReplyForm
                  conversationId={currentConv.id}
                  participantPsid={currentConv.participantPsid}
                  token={activePage.pageAccessTokenEncrypted}
                  action={sendMessengerReply}
                />
              )}
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-sm text-(--hub-muted)">
              Select a conversation
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ReplyForm({
  conversationId,
  participantPsid,
  token,
  action,
}: {
  conversationId: string;
  participantPsid: string;
  token: string;
  action: (conversationId: string, participantPsid: string, token: string, formData: FormData) => Promise<{ error?: string }>;
}) {
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="border-t border-(--hub-border-light) p-3"
      action={async (formData) => {
        setError(null);
        const r = await action(conversationId, participantPsid, token, formData);
        if (r.error) setError(r.error);
      }}
    >
      {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        <input
          name="message"
          type="text"
          required
          placeholder="Type a reply…"
          className="flex-1 rounded-lg border border-(--hub-border-light) px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-(--primary)"
        />
        <PendingSubmitButton className="inline-flex items-center gap-1.5 rounded-lg bg-(--meta-blue) px-3 py-2 text-sm font-medium text-white hover:opacity-90">
          <Send className="h-4 w-4 shrink-0" />
          Send
        </PendingSubmitButton>
      </div>
    </form>
  );
}
