"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, Send, Headset, HelpCircle, CreditCard, Bug, Settings, UserPlus, Star, MessageCircle } from "lucide-react";

// Notification sound using Web Audio API
function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch {
    // Audio not available
  }
}

function getOrCreateGuestId(): string {
  const key = "odp_guest_support_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = "guest_" + crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

interface SupportMsg {
  id: string;
  sender: "user" | "admin" | "system";
  content: string;
  createdAt: string;
}

const quickTopics = [
  { icon: HelpCircle, label: "General Question", message: "Hi, I have a general question about the platform." },
  { icon: CreditCard, label: "Billing & Plans", message: "I need help with pricing or billing." },
  { icon: Bug, label: "Report an Issue", message: "I'd like to report a technical issue I'm experiencing." },
  { icon: Settings, label: "Account Settings", message: "I need help with my account." },
  { icon: UserPlus, label: "Feature Request", message: "I have a feature suggestion for the platform." },
];

interface PublicSupportChatProps {
  theme?: "dark" | "light";
}

export function PublicSupportChat({ theme = "dark" }: PublicSupportChatProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<SupportMsg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [showTopics, setShowTopics] = useState(true);
  const [showRating, setShowRating] = useState(false);
  const [closedTicketId, setClosedTicketId] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingFeedback, setRatingFeedback] = useState("");
  const [submittingRating, setSubmittingRating] = useState(false);
  // Guest info collection
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestInfoCollected, setGuestInfoCollected] = useState(false);
  const [pendingTopic, setPendingTopic] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastMessageCountRef = useRef(0);

  const checkForNewAdminMessages = useCallback((newMessages: SupportMsg[]) => {
    if (newMessages.length > lastMessageCountRef.current) {
      const newOnes = newMessages.slice(lastMessageCountRef.current);
      if (newOnes.some((m) => m.sender === "admin")) {
        playNotificationSound();
      }
    }
    lastMessageCountRef.current = newMessages.length;
  }, []);

  // Load existing ticket on open
  useEffect(() => {
    if (!open) return;
    try {
      const guestId = getOrCreateGuestId();
      const savedTicketId = sessionStorage.getItem("odp_guest_ticket_id");
      if (savedTicketId) {
        fetch(`/api/public/support?ticketId=${savedTicketId}`)
          .then((r) => r.json())
          .then((data) => {
            if (data.ticket && data.ticket.userId === guestId && data.ticket.status !== "closed") {
              setTicketId(data.ticket.id);
              const msgs = data.ticket.messages || [];
              setMessages(msgs);
              lastMessageCountRef.current = msgs.length;
              setShowTopics(false);
              setGuestInfoCollected(true);
            }
          })
          .catch(() => {});
      }
    } catch {
      // localStorage/sessionStorage not available
    }
  }, [open]);

  // Poll for new messages
  useEffect(() => {
    if (!open || !ticketId) return;

    pollRef.current = setInterval(() => {
      fetch(`/api/public/support?ticketId=${ticketId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.ticket?.status === "closed") {
            setClosedTicketId(data.ticket.id);
            setTicketId(null);
            setShowRating(true);
            setRating(0);
            setHoverRating(0);
            setRatingFeedback("");
            lastMessageCountRef.current = 0;
            sessionStorage.removeItem("odp_guest_ticket_id");
            return;
          }
          if (data.ticket?.messages) {
            checkForNewAdminMessages(data.ticket.messages);
            setMessages(data.ticket.messages);
          }
        })
        .catch(() => {});
    }, 5000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [open, ticketId, checkForNewAdminMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(content: string) {
    if (!content.trim() || sending) return;
    setSending(true);

    try {
      const guestId = getOrCreateGuestId();
      const res = await fetch("/api/public/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          ticketId,
          guestId,
          name: guestName || "Guest",
          email: guestEmail || "guest@visitor",
        }),
      });
      if (!res.ok) {
        console.error("Public support API error:", res.status);
        setSending(false);
        return;
      }
      const data = await res.json();
      if (data.ticket) {
        setTicketId(data.ticket.id);
        sessionStorage.setItem("odp_guest_ticket_id", data.ticket.id);
        const msgs = data.ticket.messages || [];
        setMessages(msgs);
        lastMessageCountRef.current = msgs.length;
        setShowTopics(false);
      }
    } catch (err) {
      console.error("Public support send error:", err);
    }
    setSending(false);
  }

  async function handleSend() {
    if (!input.trim() || sending) return;
    const content = input.trim();
    setInput("");
    await sendMessage(content);
  }

  function handleTopicSelect(message: string) {
    if (!guestInfoCollected) {
      setPendingTopic(message);
      return;
    }
    sendMessage(message);
  }

  function handleGuestInfoSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!guestName.trim() || !guestEmail.trim()) return;
    setGuestInfoCollected(true);
    if (pendingTopic) {
      sendMessage(pendingTopic);
      setPendingTopic(null);
    }
  }

  async function submitRating() {
    if (!closedTicketId || rating === 0) return;
    setSubmittingRating(true);
    try {
      await fetch("/api/public/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "rate", ticketId: closedTicketId, rating, feedback: ratingFeedback }),
      });
    } catch {
      // silently fail
    }
    finishRating();
  }

  function finishRating() {
    setShowRating(false);
    setClosedTicketId(null);
    setMessages([]);
    setShowTopics(true);
    setGuestInfoCollected(false);
    setGuestName("");
    setGuestEmail("");
    setSubmittingRating(false);
  }

  const isDark = theme === "dark";

  return (
    <>
      {/* Floating bubble button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed z-50 bottom-6 right-6 w-14 h-14 rounded-full bg-[#FDB02F] text-[#07123A] shadow-lg shadow-[#FDB02F]/25 hover:shadow-xl hover:shadow-[#FDB02F]/30 hover:scale-105 transition-all flex items-center justify-center"
          aria-label="Open support chat"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className={`fixed z-50 flex flex-col overflow-hidden
          inset-0 md:inset-auto md:right-6 md:bottom-6 md:w-[400px] md:h-[520px] md:rounded-2xl md:shadow-2xl
          ${isDark
            ? "bg-[#0A1628] md:border md:border-white/10"
            : "bg-white md:border md:border-gray-200"
          }`}
        >
          {/* Header */}
          <div className={`shrink-0 flex items-center justify-between px-5 py-4 pt-[max(1rem,env(safe-area-inset-top))] border-b ${
            isDark ? "border-white/5 bg-[#0D1B4B]/60" : "border-gray-100 bg-gray-50"
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#FDB02F]/15 flex items-center justify-center">
                <Headset size={16} className="text-[#FDB02F]" />
              </div>
              <div>
                <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Support Chat</h3>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  <span className={`text-base ${isDark ? "text-white/40" : "text-gray-400"}`}>Online</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className={`p-1.5 rounded-lg transition-colors ${
                isDark ? "text-white/30 hover:text-white/60 hover:bg-white/5" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              }`}
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {showRating ? (
              <div className="flex flex-col items-center justify-center h-full py-6">
                <div className="w-14 h-14 rounded-2xl bg-green-500/15 flex items-center justify-center mb-4">
                  <Headset size={24} className="text-green-400" />
                </div>
                <h4 className={`text-lg font-bold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
                  Ticket Resolved
                </h4>
                <p className={`text-lg mb-5 text-center px-6 ${isDark ? "text-white/40" : "text-gray-500"}`}>
                  How was your support experience?
                </p>

                <div className="flex gap-1.5 mb-5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        size={28}
                        className={`transition-colors ${
                          star <= (hoverRating || rating)
                            ? "text-[#FDB02F] fill-[#FDB02F]"
                            : isDark ? "text-white/15" : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>

                {rating > 0 && (
                  <p className={`text-lg font-medium mb-4 ${isDark ? "text-white/50" : "text-gray-500"}`}>
                    {["", "Poor", "Fair", "Good", "Great", "Excellent"][rating]}
                  </p>
                )}

                <textarea
                  value={ratingFeedback}
                  onChange={(e) => setRatingFeedback(e.target.value)}
                  placeholder="Any additional feedback? (optional)"
                  rows={2}
                  className={`w-full rounded-xl px-3 py-2 text-base focus:outline-none resize-none mb-4 ${
                    isDark
                      ? "bg-white/5 border border-white/10 text-white placeholder:text-white/20"
                      : "bg-gray-50 border border-gray-200 text-gray-800 placeholder:text-gray-400"
                  }`}
                />

                <div className="flex gap-2 w-full">
                  <button
                    onClick={finishRating}
                    className={`flex-1 py-2.5 rounded-xl text-base font-medium transition-colors ${
                      isDark
                        ? "bg-white/5 text-white/50 hover:bg-white/10"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    Skip
                  </button>
                  <button
                    onClick={submitRating}
                    disabled={rating === 0 || submittingRating}
                    className="flex-1 py-2.5 rounded-xl text-base font-bold bg-[#FDB02F] text-[#07123A] hover:bg-[#FDAA40] disabled:opacity-30 transition-colors"
                  >
                    {submittingRating ? "Submitting..." : "Submit Rating"}
                  </button>
                </div>
              </div>
            ) : pendingTopic && !guestInfoCollected ? (
              /* Guest info collection form */
              <div className="py-2">
                <p className={`text-base font-semibold mb-1 ${isDark ? "text-white/50" : "text-gray-600"}`}>
                  Before we connect you...
                </p>
                <p className={`text-lg mb-4 ${isDark ? "text-white/25" : "text-gray-400"}`}>
                  Please share your details so we can assist you
                </p>
                <form onSubmit={handleGuestInfoSubmit} className="space-y-3">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? "text-white/40" : "text-gray-500"}`}>Name</label>
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Your name"
                      required
                      className={`w-full rounded-xl px-4 py-2.5 text-base focus:outline-none transition-all ${
                        isDark
                          ? "bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:border-[#FDB02F]/40"
                          : "bg-gray-50 border border-gray-200 text-gray-800 placeholder:text-gray-400 focus:border-[#FDB02F]/60"
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? "text-white/40" : "text-gray-500"}`}>Email</label>
                    <input
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className={`w-full rounded-xl px-4 py-2.5 text-base focus:outline-none transition-all ${
                        isDark
                          ? "bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:border-[#FDB02F]/40"
                          : "bg-gray-50 border border-gray-200 text-gray-800 placeholder:text-gray-400 focus:border-[#FDB02F]/60"
                      }`}
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl text-base font-bold bg-[#FDB02F] text-[#07123A] hover:bg-[#FDAA40] transition-colors"
                  >
                    Start Chat
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingTopic(null)}
                    className={`w-full py-2 rounded-xl text-base font-medium transition-colors ${
                      isDark ? "text-white/30 hover:text-white/50" : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    Back
                  </button>
                </form>
              </div>
            ) : showTopics && messages.length === 0 ? (
              <div className="py-2">
                <p className={`text-base font-semibold mb-1 ${isDark ? "text-white/50" : "text-gray-600"}`}>
                  How can we help you?
                </p>
                <p className={`text-lg mb-4 ${isDark ? "text-white/25" : "text-gray-400"}`}>
                  Select a topic to get started
                </p>
                <div className="space-y-2">
                  {quickTopics.map((topic) => (
                    <button
                      key={topic.label}
                      onClick={() => handleTopicSelect(topic.message)}
                      disabled={sending}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                        isDark
                          ? "bg-white/[0.03] border border-white/5 hover:bg-white/[0.07] hover:border-white/10"
                          : "bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                      } ${sending ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isDark ? "bg-[#FDB02F]/10" : "bg-[#FDB02F]/10"
                      }`}>
                        <topic.icon size={14} className="text-[#FDB02F]" />
                      </div>
                      <span className={`text-base font-medium ${isDark ? "text-white/70" : "text-gray-700"}`}>
                        {topic.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <div key={msg.id}>
                    {msg.sender === "system" ? (
                      <div className="flex justify-center my-2">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-base font-medium ${
                          isDark
                            ? "bg-[#FDB02F]/10 text-[#FDB02F]/70 border border-[#FDB02F]/10"
                            : "bg-[#FDB02F]/10 text-[#b8860b] border border-[#FDB02F]/15"
                        }`}>
                          <UserPlus size={10} />
                          {msg.content}
                        </div>
                      </div>
                    ) : (
                      <div className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-base leading-relaxed ${
                            msg.sender === "user"
                              ? "bg-[#FDB02F] text-[#07123A]"
                              : isDark
                                ? "bg-white/5 text-white/70 border border-white/5"
                                : "bg-gray-100 text-gray-700 border border-gray-200"
                          }`}
                        >
                          {msg.sender === "admin" && (
                            <p className={`text-base font-semibold mb-1 ${isDark ? "text-[#FDB02F]/70" : "text-[#FDB02F]"}`}>
                              Support Team
                            </p>
                          )}
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                          <p className={`text-base mt-1 ${
                            msg.sender === "user" ? "text-[#07123A]/40" : isDark ? "text-white/20" : "text-gray-400"
                          }`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          {!showRating && !pendingTopic && guestInfoCollected && (
            <div className={`shrink-0 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] border-t ${isDark ? "border-white/5" : "border-gray-100"}`}>
              <div className={`flex items-center gap-2 rounded-xl px-3 py-2 ${
                isDark ? "bg-white/5 border border-white/5" : "bg-gray-50 border border-gray-200"
              }`}>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
                  placeholder="Type your message..."
                  className={`flex-1 bg-transparent text-base focus:outline-none ${
                    isDark ? "text-white placeholder:text-white/20" : "text-gray-800 placeholder:text-gray-400"
                  }`}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                  className="p-2 rounded-lg bg-[#FDB02F] text-[#07123A] disabled:opacity-30 hover:bg-[#FDAA40] transition-colors"
                >
                  <Send size={12} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
