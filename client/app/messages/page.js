"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../../components/Avatar";

function formatTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDay(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  if (isToday) return formatTime(dateStr);
  return d.toLocaleDateString([], { day: "numeric", month: "short" });
}

const VISIT_LABEL = {
  none: null,
  requested: { text: "Visit requested", tone: "bg-coral-50 text-coral-600" },
  confirmed: { text: "Visit confirmed", tone: "bg-teal-50 text-teal-800" },
  declined: { text: "Visit declined", tone: "bg-black/5 text-ink/50" },
  completed: { text: "Visit completed", tone: "bg-black/5 text-ink/50" },
};

export default function MessagesPage() {
  const { user, ready } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [showThreadOnMobile, setShowThreadOnMobile] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!ready) return;
    if (!user) return router.push("/login");

    api
      .getMyConversations()
      .then((res) => {
        const real = res.conversations || [];
        setConversations(real);
        if (real.length) setActiveId(real[0]._id);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, user, router]);

  const displayConversations = conversations;
  const active = displayConversations.find((c) => c._id === activeId);
  const myId = user?.id || user?._id;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [active?.messages?.length, activeId]);

  async function handleSend(e) {
    e.preventDefault();
    if (!draft.trim() || !active) return;

    const res = await api.sendMessage(active._id, draft);
    setConversations((prev) => prev.map((c) => (c._id === active._id ? res.conversation : c)));
    setDraft("");
  }

  async function handleVisitAction(status) {
    if (!active) return;
    const res = await api.updateVisit(active._id, status);
    setConversations((prev) => prev.map((c) => (c._id === active._id ? res.conversation : c)));
  }

  if (!ready || loading) {
    return <p className="mx-auto max-w-5xl px-5 py-16 text-center text-sm text-ink/50">Loading...</p>;
  }

  const isHostHere =
    active && !active.isDemo && String(active.host?._id || active.host) === String(myId);
  const otherPartyName = active ? (active.isDemo ? active.otherName : (isHostHere ? active.customer : active.host)?.name) : null;
  const visitInfo = active ? VISIT_LABEL[active.visitStatus] : null;

  return (
    <div className="mx-auto max-w-6xl px-0 py-0 sm:px-5 sm:py-8">
      <div className="flex h-[calc(100svh-57px)] overflow-hidden bg-white shadow-sm ring-1 ring-black/5 sm:h-[calc(100svh-128px)] sm:rounded-2xl">
        {/* ------- Conversation list ------- */}
        <div
          className={`flex w-full flex-col border-r border-black/5 sm:w-[340px] sm:flex-none ${
            showThreadOnMobile ? "hidden sm:flex" : "flex"
          }`}
        >
          <div className="border-b border-black/5 px-4 py-4">
            <h2 className="font-head text-lg font-bold text-ink">Messages</h2>
          </div>

          <div className="flex-1 overflow-y-auto">
            {displayConversations.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-50">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-teal-600">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p className="text-sm font-medium text-ink/70">No conversations yet</p>
                <p className="text-xs text-ink/40">
                  Message a host from any property page to start a chat here.
                </p>
              </div>
            ) : (
              displayConversations
                .slice()
                .sort((a, b) => {
                  const aLast = a.messages?.[a.messages.length - 1]?.createdAt;
                  const bLast = b.messages?.[b.messages.length - 1]?.createdAt;
                  return new Date(bLast || 0) - new Date(aLast || 0);
                })
                .map((c) => {
                  const hostHere = String(c.host?._id || c.host) === String(myId);
                  const otherName = (hostHere ? c.customer : c.host)?.name;
                  const lastMsg = c.messages?.[c.messages.length - 1];
                  return (
                    <button
                      key={c._id}
                      onClick={() => {
                        setActiveId(c._id);
                        setShowThreadOnMobile(true);
                      }}
                      className={`flex w-full items-center gap-3 border-b border-black/5 px-4 py-3 text-left transition ${
                        c._id === activeId ? "bg-teal-50" : "hover:bg-black/[0.03]"
                      }`}
                    >
                      <Avatar name={otherName} size={44} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-semibold text-ink">
                            {otherName || "User"}
                          </p>
                          <span className="flex-none text-[11px] text-ink/40">
                            {formatDay(lastMsg?.createdAt)}
                          </span>
                        </div>
                        <p className="truncate text-xs text-ink/50">{c.property?.title || "Listing"}</p>
                        <p className="truncate text-xs text-ink/40">
                          {lastMsg?.text || "No messages yet"}
                        </p>
                      </div>
                    </button>
                  );
                })
            )}
          </div>
        </div>

        {/* ------- Active thread ------- */}
        <div className={`flex min-w-0 flex-1 flex-col bg-canvas ${showThreadOnMobile ? "flex" : "hidden sm:flex"}`}>
          {!active ? (
            <div className="m-auto flex flex-col items-center gap-2 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-50">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-teal-600">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="text-sm font-medium text-ink/60">Select a conversation</p>
            </div>
          ) : (
            <>
              {/* thread header */}
              <div className="flex items-center gap-3 border-b border-black/5 bg-white px-4 py-3">
                <button
                  onClick={() => setShowThreadOnMobile(false)}
                  className="-ml-1 flex h-8 w-8 flex-none items-center justify-center rounded-full hover:bg-black/5 sm:hidden"
                  aria-label="Back to conversations"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <Avatar name={otherPartyName} size={40} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-sm font-semibold text-ink">{otherPartyName || "User"}</p>
                  </div>
                  <p className="truncate text-xs text-ink/50">{active.property?.title}</p>
                </div>

                {isHostHere ? (
                  <div className="flex flex-none gap-2">
                    <button
                      onClick={() => handleVisitAction("confirmed")}
                      className="rounded-full bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-800 hover:bg-teal-100"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => handleVisitAction("declined")}
                      className="rounded-full bg-black/5 px-3 py-1.5 text-xs font-semibold text-ink/60 hover:bg-black/10"
                    >
                      Decline
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleVisitAction("requested")}
                    className="flex-none rounded-full bg-coral-400 px-3 py-1.5 text-xs font-semibold text-white hover:bg-coral-600"
                  >
                    Book a visit
                  </button>
                )}
              </div>

              {visitInfo && (
                <div className={`px-4 py-1.5 text-center text-[11px] font-medium ${visitInfo.tone}`}>
                  {visitInfo.text}
                </div>
              )}

              {/* messages */}
              <div className="flex-1 space-y-1 overflow-y-auto px-4 py-4">
                {active.messages.length === 0 && (
                  <p className="mt-10 text-center text-xs text-ink/40">
                    Say hello — no messages yet in this conversation.
                  </p>
                )}
                {active.messages.map((m, i) => {
                  const isMine = active.isDemo ? m.fromMe : String(m.sender) === String(myId);
                  const prevSameSender = active.isDemo
                    ? i > 0 && active.messages[i - 1].fromMe === m.fromMe
                    : i > 0 && String(active.messages[i - 1].sender) === String(m.sender);
                  return (
                    <div
                      key={i}
                      className={`flex ${isMine ? "justify-end" : "justify-start"} ${prevSameSender ? "mt-0.5" : "mt-2.5"}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm shadow-sm ${
                          isMine
                            ? "rounded-br-sm bg-teal-600 text-white"
                            : "rounded-bl-sm bg-white text-ink ring-1 ring-black/5"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{m.text}</p>
                        <p className={`mt-0.5 text-right text-[10px] ${isMine ? "text-teal-100" : "text-ink/35"}`}>
                          {formatTime(m.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* composer */}
              <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-black/5 bg-white px-3 py-3">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Message..."
                  className="flex-1 rounded-full border border-black/10 bg-canvas px-4 py-2.5 text-sm outline-none focus:border-teal-400"
                />
                <button
                  disabled={!draft.trim()}
                  className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-teal-600 text-white transition hover:bg-teal-800 disabled:opacity-40"
                  aria-label="Send message"
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}