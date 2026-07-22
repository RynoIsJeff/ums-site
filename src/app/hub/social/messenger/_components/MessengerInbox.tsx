"use client";

import { useState, useTransition, useRef } from "react";
import { MessageCircle, Send, RefreshCw, CheckCheck, MailOpen, ImageIcon, X } from "lucide-react";
import { PendingSubmitButton } from "@/app/hub/_components/PendingSubmitButton";
import {
  sendMessengerReply,
  sendMessengerImageReply,
  syncPageConversations,
  markConversationRead,
  markConversationDone,
  markConversationOpen,
} from "../actions";

type Message = { id?: string; content: string; direction?: string; createdAt?: Date | string };

function msgDate(m: Message): Date | null {
  if (!m.createdAt) return null;
  return m.createdAt instanceof Date ? m.createdAt : new Date(m.createdAt);
}

function formatMsgTime(m: Message): string {
  const d = msgDate(m);
  if (!d) return "";
  return d.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function dayKey(m: Message): string {
  const d = msgDate(m);
  if (!d) return "unknown";
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

function formatDaySeparator(key: string): string {
  if (key === "unknown") return "Unknown date";
  const d = new Date(`${key}T12:00:00Z`);
  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yKey = yesterday.toISOString().slice(0, 10);
  if (key === todayKey) return "Today";
  if (key === yKey) return "Yesterday";
  return d.toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function groupByDay(messages: Message[]) {
  const groups: { key: string; messages: Message[] }[] = [];
  for (const m of messages) {
    const k = dayKey(m);
    const last = groups[groups.length - 1];
    if (last?.key === k) last.messages.push(m);
    else groups.push({ key: k, messages: [m] });
  }
  return groups;
}

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
  const [pendingDone, setPendingDone] = useState<Set<string>>(new Set());
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

  function handleQuickDone(convId: string) {
    setPendingDone((prev) => new Set([...prev, convId]));
    startAction(async () => {
      await markConversationDone(convId);
      setPendingDone((prev) => { const n = new Set(prev); n.delete(convId); return n; });
      if (selectedConvId === convId) setSelectedConvId(null);
    });
  }

  function handleMarkDone() {
    if (!selectedConvId) return;
    handleQuickDone(selectedConvId);
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
          {pages.map((p) => {
            const pageUnread = p.messengerConversations.filter(
              (c) => c.status !== "DONE" && !c.isRead && !localRead.has(c.id)
            ).length;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => { setSelectedPageId(p.id); setSelectedConvId(null); setSyncError(null); setSyncSuccess(null); }}
                className={`relative shrink-0 flex items-center gap-1.5 rounded-t px-3 py-1.5 text-xs font-medium transition-colors ${
                  p.id === selectedPageId
                    ? "border-b-2 border-(--primary) text-(--primary)"
                    : "text-(--hub-muted) hover:text-(--hub-text)"
                }`}
              >
                {p.pageName}
                {pageUnread > 0 && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white leading-none">
                    {pageUnread > 99 ? "99+" : pageUnread}
                  </span>
                )}
              </button>
            );
          })}
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
                  const isDonePending = pendingDone.has(c.id);
                  return (
                    <li key={c.id} className={`group flex items-stretch border-b border-(--hub-border-light) transition-colors hover:bg-black/3 ${selectedConvId === c.id ? "bg-(--primary)/5" : ""}`}>
                      <button
                        type="button"
                        onClick={() => selectConv(c)}
                        className="min-w-0 flex-1 px-3 py-3 text-left"
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
                      {filter === "open" && (
                        <button
                          type="button"
                          onClick={() => handleQuickDone(c.id)}
                          disabled={isDonePending}
                          title="Mark done"
                          aria-label="Mark done"
                          className="flex shrink-0 items-center justify-center px-2.5 text-(--hub-muted) opacity-0 transition-all hover:text-green-600 group-hover:opacity-100 disabled:opacity-40"
                        >
                          <CheckCheck className={`h-4 w-4 ${isDonePending ? "animate-pulse" : ""}`} />
                        </button>
                      )}
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
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
                {groupByDay(currentConv.messages).map(({ key, messages }) => (
                  <div key={key}>
                    {/* Date separator */}
                    <div className="flex items-center gap-3 my-4">
                      <div className="flex-1 h-px bg-(--hub-border-light)" />
                      <span className="text-xs font-medium text-(--hub-muted) shrink-0">{formatDaySeparator(key)}</span>
                      <div className="flex-1 h-px bg-(--hub-border-light)" />
                    </div>
                    {/* Messages in this day */}
                    <div className="space-y-1">
                      {messages.map((m, i) => {
                        const isOut = m.direction === "OUT";
                        const time = formatMsgTime(m);
                        return (
                          <div key={m.id ?? `${key}-${i}`} className={`flex flex-col ${isOut ? "items-end" : "items-start"}`}>
                            {m.content === "[image]" ? (
                              <div className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-sm ${isOut ? "bg-(--primary) text-white" : "bg-slate-100 text-(--hub-text)"}`}>
                                <ImageIcon className="h-4 w-4 shrink-0" />
                                <span>Image</span>
                              </div>
                            ) : (
                              <p className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${isOut ? "bg-(--primary) text-white" : "bg-slate-100 text-(--hub-text)"}`}>
                                {m.content}
                              </p>
                            )}
                            {time && (
                              <span className="mt-0.5 px-1 text-[10px] text-(--hub-muted)">{time}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {(() => {
                const lastCustomerMsg = [...currentConv.messages].reverse().find(m => m.direction === "IN");
                const windowClosed = lastCustomerMsg
                  ? Date.now() - new Date(lastCustomerMsg.createdAt ?? 0).getTime() > 24 * 60 * 60 * 1000
                  : false;
                return (
                  <>
                    {windowClosed && (
                      <div className="mx-3 mb-1 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                        <strong>24-hour window closed.</strong> Facebook only allows replies within 24 hours of the customer&apos;s last message. To reply to older conversations, apply for{" "}
                        <a href="https://developers.facebook.com/docs/messenger-platform/handover-protocol/human-agent" target="_blank" rel="noreferrer" className="underline font-medium">Human Agent access</a>{" "}
                        in Meta App Dashboard → Messenger → Settings.
                      </div>
                    )}
                    {activePage?.pageAccessTokenEncrypted && (
                      <ReplyForm
                        conversationId={currentConv.id}
                        participantPsid={currentConv.participantPsid}
                        token={activePage.pageAccessTokenEncrypted}
                        action={sendMessengerReply}
                        imageAction={sendMessengerImageReply}
                      />
                    )}
                  </>
                );
              })()}
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
  imageAction,
}: {
  conversationId: string;
  participantPsid: string;
  token: string;
  action: (conversationId: string, participantPsid: string, token: string, formData: FormData) => Promise<{ error?: string }>;
  imageAction: (conversationId: string, participantPsid: string, token: string, formData: FormData) => Promise<{ error?: string }>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [sending, startSend] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function pickImage(file: File) {
    if (!file.type.startsWith("image/")) return;
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError(null);
  }

  function clearImage() {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
  }

  function sendImage() {
    if (!imageFile) return;
    const fd = new FormData();
    fd.append("image", imageFile);
    startSend(async () => {
      const r = await imageAction(conversationId, participantPsid, token, fd);
      if (r.error) setError(r.error);
      else clearImage();
    });
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) pickImage(file);
  }

  return (
    <div
      className={`shrink-0 border-t border-(--hub-border-light) transition-colors ${dragOver ? "bg-blue-50" : ""}`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      {imagePreview ? (
        <div className="p-3">
          <div className="relative mb-2 inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imagePreview} alt="Preview" className="max-h-40 max-w-xs rounded-lg border border-(--hub-border-light) object-contain" />
            <button
              type="button"
              onClick={clearImage}
              className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
          {error && <p className="mb-1 text-xs text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={clearImage}
              className="rounded-lg border border-(--hub-border-light) px-3 py-1.5 text-sm text-(--hub-muted) hover:bg-black/5"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={sendImage}
              disabled={sending}
              className="inline-flex items-center gap-1.5 rounded-lg bg-(--meta-blue) px-4 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              {sending ? "Sending…" : "Send image"}
            </button>
          </div>
        </div>
      ) : (
        <form
          className="p-3"
          action={async (formData) => {
            setError(null);
            const r = await action(conversationId, participantPsid, token, formData);
            if (r.error) setError(r.error);
          }}
        >
          {dragOver && (
            <div className="mb-2 flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-(--primary) py-3 text-sm font-medium text-(--primary)">
              <ImageIcon className="h-4 w-4" />
              Drop image to send
            </div>
          )}
          {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Attach image"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-(--hub-border-light) text-(--hub-muted) hover:bg-black/5"
            >
              <ImageIcon className="h-4 w-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) pickImage(f); e.target.value = ""; }}
            />
            <input
              name="message"
              type="text"
              required
              placeholder="Type a reply or drag an image…"
              className="flex-1 rounded-lg border border-(--hub-border-light) px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-(--primary)"
            />
            <PendingSubmitButton className="inline-flex items-center gap-1.5 rounded-lg bg-(--meta-blue) px-3 py-2 text-sm font-medium text-white hover:opacity-90">
              <Send className="h-4 w-4 shrink-0" />
              Send
            </PendingSubmitButton>
          </div>
        </form>
      )}
    </div>
  );
}
