"use client";

import { useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import { sendMessengerReply } from "../actions";

type Page = {
  id: string;
  pageName: string;
  pageAccessTokenEncrypted: string | null;
  messengerConversations: {
    id: string;
    participantPsid: string;
    participantName: string | null;
    lastMessageAt: Date;
    messages: { content: string; direction?: string }[];
  }[];
  socialAccount: { client: { companyName: string } };
};

type Props = { pages: Page[] };

export function MessengerInbox({ pages }: Props) {
  const [selected, setSelected] = useState<{
    pageId: string;
    conversationId: string;
    participantPsid: string;
    token: string;
  } | null>(null);

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

  const allConversations = pages.flatMap((p) =>
    p.messengerConversations.map((c) => ({
      ...c,
      page: p,
    }))
  );

  const currentConv = selected
    ? allConversations.find((c) => c.id === selected.conversationId)
    : null;

  return (
    <div className="flex gap-4 rounded-xl border border-(--hub-border-light) bg-white overflow-hidden" style={{ minHeight: 400 }}>
      <div className="w-72 border-r border-(--hub-border-light) overflow-y-auto">
        <div className="p-3 border-b border-(--hub-border-light) font-medium text-sm text-(--hub-muted)">
          Conversations ({allConversations.length})
        </div>
        {allConversations.length === 0 ? (
          <p className="p-4 text-sm text-(--hub-muted)">No messages yet. Configure the webhook to receive messages.</p>
        ) : (
          <ul>
            {allConversations.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() =>
                    setSelected({
                      pageId: c.page.id,
                      conversationId: c.id,
                      participantPsid: c.participantPsid,
                      token: c.page.pageAccessTokenEncrypted ?? "",
                    })
                  }
                  className={`w-full text-left px-4 py-3 border-b border-(--hub-border-light) hover:bg-black/3 ${
                    selected?.conversationId === c.id ? "bg-(--primary)/5" : ""
                  }`}
                >
                  <p className="font-medium text-sm truncate">
                    {c.participantName || `User ${c.participantPsid.slice(0, 8)}…`}
                  </p>
                  <p className="text-xs text-(--hub-muted) truncate">
                    {c.messages[c.messages.length - 1]?.content ?? "No messages"}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="flex-1 flex flex-col">
        {currentConv ? (
          <>
            <div className="p-4 border-b border-(--hub-border-light)">
              <p className="font-medium">{currentConv.participantName || `User ${currentConv.participantPsid}`}</p>
              <p className="text-xs text-(--hub-muted)">{currentConv.page.pageName}</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {(currentConv.messages ?? []).map((m: { content: string; direction?: string }, i: number) => (
                <div key={i} className={`text-sm ${m.direction === "OUT" ? "text-right" : ""}`}>
                  <p className={`rounded-lg p-2 inline-block max-w-[80%] ${m.direction === "OUT" ? "bg-(--primary)/10 ml-auto" : "bg-slate-100"}`}>
                    {m.content}
                  </p>
                </div>
              ))}
            </div>
            {selected && selected.token && (
              <ReplyForm
                conversationId={selected.conversationId}
                participantPsid={selected.participantPsid}
                token={selected.token}
                action={sendMessengerReply}
              />
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-(--hub-muted) text-sm">
            Select a conversation
          </div>
        )}
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
      className="p-4 border-t border-(--hub-border-light)"
      action={async (formData) => {
        setError(null);
        const r = await action(conversationId, participantPsid, token, formData);
        if (r.error) setError(r.error);
      }}
    >
      {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
      <div className="flex gap-2">
        <input
          name="message"
          type="text"
          required
          placeholder="Type a reply..."
          className="flex-1 rounded-lg border border-(--hub-border-light) px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-(--primary)"
        />
        <button
          type="submit"
          className="rounded-lg bg-(--meta-blue) px-4 py-2 text-white text-sm font-medium hover:opacity-90 inline-flex items-center gap-2"
        >
          <Send className="h-4 w-4" />
          Send
        </button>
      </div>
    </form>
  );
}
