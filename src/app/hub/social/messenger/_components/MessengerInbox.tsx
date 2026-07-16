"use client";

import { useState, useTransition } from "react";
import { MessageCircle, Send, RefreshCw, CheckCheck, MailOpen } from "lucide-react";
import { PendingSubmitButton } from "@/app/hub/_components/PendingSubmitButton";
import {
  sendMessengerReply,
  syncPageConversations,
  markConversationRead,
  markConversationDone,
  markConversationOpen,
} from "../actions";

type Message = { id?: string; content: string; direction?: string; createdAt?: Date };

type Conversation = {
  id: string;
  participantPsid: string;
  participantName: string | null;
  lastMessageAt: Date;
  isRead: boolean;
  status: string;
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

type Filter = "open" | "done";

type Props = { pages: Page[] };

export function MessengerInbox({ pages }: Props) {
  const [selectedPageId, setSelectedPageId] = useState<string>(pages[0]?.id ?? "");
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("open");
  const [localRead, setLocalRead] = useState<Set<string>>(new Set());
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncSuccess, setSyncSuccess] = useState<string | null>(null);
  const [syncing, startSync] = useTransition();
  const [actioning, startAction] = useTransition();

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

  // Separate and sort conversations: unread first within Open, then by lastMessageAt
  const allConvs = activePage?.messengerConversations ?? [];
  const openConvs = allConvs
    .filter((c) => c.status !== "DONE")
    .sort((a, b) => {
      const aRead = a.isRead && !localRead.has(a.id) ? false : a.isRead || localRead.has(a.id);
      const bRead = b.isRead && !localRead.has(b.id) ? false : b.isRead || localRead.has(b.id);
      // unread (isRead=false and not locally marked) floats to top
      const aUnread = !(a.isRead || localRead.has(a.id));
      const bUnread = !(b.isRead || localRead.has(b.id));
      if (aUnread && !bUnread) return -1;
      if (!aUnread && bUnread) return 1;
      return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
    });
  const doneConvs = allConvs
    .filter((c) => c.status === "DONE")
    .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

  const visibleConvs = filter === "open" ? openConvs : doneConvs;
  const currentConv = selectedConvId ? allConvs.find((c) => c.id === selectedConvId) : null;

  const unreadCount = allConvs.filter((c) => c.status !== "DONE" && !c.isRead && !localRead.has(c.id)).length;

  function selectConv(conv: Conversation) {
    setSelectedConvId(conv.id);
    if (!conv.isRead && !localRead.has(conv.id)) {
      setLocalRead((prev) => new Set([...prev, conv.id]));
      startAction(async () => { await markConversationRead(conv.id); });
    }
  }

  function handleSync() {
    if (!activePage) return;
    setSyncError(null);
    setSyncSuccess(null);
    startSync(async () => {
      const result = await syncPageConversations(activePage.id);
      if (result.ok) {
        setSyncSuccess(`Synced ${result.count ?? 0}`);
        setTimeout(() => setSyncSuccess(null), 3000);
      } else {
        setSyncError(result.error ?? "Sync failed");
      }
    });
  }

  function handleMarkDone() {
    if (!selectedConvId) return;
    startAction(async () => {
      await markConversationDone(selectedConvId);
      setSelectedConvId(null);
    });
  }

  function handleMarkOpen() {
    if (!selectedConvId) return;
    startAction(async () => {
      await markConversationOpen(selectedConvId);
    });
  }

  return (
    <div className="flex flex-col rounded-xl border border-(--hub-border-light) bg-white overflow-hidden" style={{ minHeight: 520 }}>
      {/* Page tabs */}
      {pages.length > 1 && (
        <div className="flex items-center gap-1 border-b border-(--hub-border-light) px-3 pt-2 overflow-x-auto shrink-0">
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
        {/* Left: list */}
        <div className="flex w-72 shrink-0 flex-col border-r border-(--hub-border-light) overflow-hidden">
          {/* Filter tabs + Sync */}
          <div className="flex items-center justify-between border-b border-(--hub-border-light) px-3 py-1.5 shrink-0">
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => { setFilter("open"); setSelectedConvId(null); }}
                className={`flex items-center gap-1 rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                  filter === "open" ? "bg-(--primary)/10 text-(--primary)" : "text-(--hub-muted) hover:bg-black/5"
                }`}
              >
                Open
                {unreadCount > 0 && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-(--primary) px-1 text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => { setFilter("done"); setSelectedConvId(null); }}
                className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                  filter === "done" ? "bg-green-100 text-green-700" : "text-(--hub-muted) hover:bg-black/5"
                }`}
              >
                Done {doneConvs.length > 0 && `(${doneConvs.length})`}
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              {syncSuccess && <span className="text-[10px] text-green-600">{syncSuccess}</span>}
              {syncError && <span className="text-[10px] text-red-600">{syncError}</span>}
              <button
                type="button"
                onClick={handleSync}
                disabled={syncing}
                title="Sync from Facebook"
                className="flex items-center gap-1 rounded px-2 py-1 text-xs text-(--hub-muted) hover:bg-black/5 disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
                {syncing ? "…" : "Sync"}
              </button>
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto">
            {visibleConvs.length === 0 ? (
              <div className="p-6 text-center text-xs text-(--hub-muted)">
                {filter === "open"
                  ? "No open conversations. Click Sync to pull from Facebook."
                  : "No conversations marked as done yet."}
              </div>
            ) : (
              <ul>
                {visibleConvs.map((c) => {
                  const isUnread = !c.isRead && !localRead.has(c.id);
                  const lastMsg = c.messages[c.messages.length - 1];
                  return (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => selectConv(c)}
                        className={`w-full border-b border-(--hub-border-light) px-3 py-3 text-left transition-colors hover:bg-black/3 ${
                          selectedConvId === c.id ? "bg-(--primary)/5" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {isUnread && (
                            <span className="h-2 w-2 shrink-0 rounded-full bg-(--primary)" />
                          )}
                          <p className={`flex-1 truncate text-sm ${isUnread ? "font-bold text-(--hub-text)" : "font-medium text-(--hub-text)"}`}>
                            {c.participantName || `User ${c.participantPsid.slice(0, 8)}…`}
                          </p>
                        </div>
                        <p className={`mt-0.5 truncate text-xs ${isUnread ? "font-medium text-(--hub-muted)" : "text-(--hub-muted)"}`}>
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
              {/* Thread header with action button */}
              <div className="flex items-center justify-between border-b border-(--hub-border-light) px-4 py-3 shrink-0">
                <div>
                  <p className="font-semibold text-(--hub-text)">
                    {currentConv.participantName || `User ${currentConv.participantPsid}`}
                  </p>
                  <p className="text-xs text-(--hub-muted)">{activePage?.pageName}</p>
                </div>
                {currentConv.status !== "DONE" ? (
                  <button
                    type="button"
                    onClick={handleMarkDone}
                    disabled={actioning}
                    className="flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100 disabled:opacity-50"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    Mark done
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleMarkOpen}
                    disabled={actioning}
                    className="flex items-center gap-1.5 rounded-lg border border-(--hub-border-light) px-3 py-1.5 text-xs font-medium text-(--hub-muted) hover:bg-black/5 disabled:opacity-50"
                  >
                    <MailOpen className="h-3.5 w-3.5" />
                    Reopen
                  </button>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {currentConv.messages.map((m, i) => (
                  <div key={m.id ?? i} className={`flex ${m.direction === "OUT" ? "justify-end" : "justify-start"}`}>
                    <p
                      className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
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
      className="shrink-0 border-t border-(--hub-border-light) p-3"
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
