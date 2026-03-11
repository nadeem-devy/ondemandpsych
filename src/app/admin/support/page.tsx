"use client";

import { useState, useEffect, useRef } from "react";
import { Send, MessageCircle, XCircle, RefreshCw, UserPlus, Star } from "lucide-react";

interface Ticket {
  id: string;
  userName: string;
  userEmail: string;
  status: string;
  rating: number | null;
  ratingFeedback: string | null;
  createdAt: string;
  updatedAt: string;
  messages: { content: string; sender: string; createdAt: string }[];
}

interface TicketDetail {
  id: string;
  userName: string;
  userEmail: string;
  status: string;
  rating: number | null;
  ratingFeedback: string | null;
  messages: { id: string; sender: string; content: string; createdAt: string }[];
}

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [activeTicket, setActiveTicket] = useState<TicketDetail | null>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  function loadTickets() {
    fetch("/api/admin/support")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setTickets(data); })
      .catch(() => {});
  }

  useEffect(() => {
    loadTickets();
    const interval = setInterval(loadTickets, 10000);
    return () => clearInterval(interval);
  }, []);

  // Poll active ticket for new messages
  useEffect(() => {
    if (!activeTicket) return;

    const interval = setInterval(() => {
      fetch(`/api/admin/support?ticketId=${activeTicket.id}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.ticket) setActiveTicket(data.ticket);
        })
        .catch(() => {});
    }, 5000);

    return () => clearInterval(interval);
  }, [activeTicket?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeTicket?.messages]);

  function selectTicket(id: string) {
    fetch(`/api/admin/support?ticketId=${id}`)
      .then((r) => r.json())
      .then((data) => { if (data.ticket) setActiveTicket(data.ticket); })
      .catch(() => {});
  }

  async function handleReply() {
    if (!reply.trim() || !activeTicket || sending) return;
    setSending(true);

    const res = await fetch("/api/admin/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticketId: activeTicket.id, content: reply.trim() }),
    });
    const data = await res.json();
    if (data.ticket) setActiveTicket(data.ticket);
    setReply("");
    setSending(false);
    loadTickets();
  }

  async function updateStatus(ticketId: string, status: string) {
    await fetch("/api/admin/support", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticketId, status }),
    });
    loadTickets();
    // Reload full ticket to get the system message
    fetch(`/api/admin/support?ticketId=${ticketId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.ticket) setActiveTicket(data.ticket);
      })
      .catch(() => {});
  }

  const statusColors: Record<string, string> = {
    open: "text-green-400 bg-green-500/10",
    assigned: "text-blue-400 bg-blue-500/10",
    closed: "text-white/30 bg-white/5",
  };

  return (
    <div className="flex h-screen">
      {/* Tickets list */}
      <div className="w-80 border-r border-white/10 bg-[#07123A]/50 flex flex-col">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-white text-lg font-bold flex items-center gap-2">
            <MessageCircle size={20} className="text-[#FDB02F]" />
            Support Tickets
          </h2>
          <button onClick={loadTickets} className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5">
            <RefreshCw size={14} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {tickets.length === 0 && (
            <p className="text-white/20 text-sm text-center py-12">No support tickets yet</p>
          )}
          {tickets.map((t) => (
            <button
              key={t.id}
              onClick={() => selectTicket(t.id)}
              className={`w-full text-left p-4 border-b border-white/5 transition-colors ${
                activeTicket?.id === t.id ? "bg-white/10" : "hover:bg-white/5"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-white text-sm font-medium truncate">{t.userName}</span>
                <span className={`text-lg px-2.5 py-1 rounded-full font-semibold ${statusColors[t.status] || statusColors.open}`}>
                  {t.status}
                </span>
              </div>
              <p className="text-white/30 text-sm truncate">{t.userEmail}</p>
              {t.messages?.[0] && (
                <p className="text-white/20 text-sm mt-1 truncate">
                  {t.messages[0].sender === "admin" ? "You: " : ""}{t.messages[0].content}
                </p>
              )}
              {t.rating && (
                <div className="flex items-center gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={10} className={s <= t.rating! ? "text-[#FDB02F] fill-[#FDB02F]" : "text-white/10"} />
                  ))}
                </div>
              )}
              <p className="text-white/15 text-lg mt-1">
                {new Date(t.updatedAt).toLocaleDateString()} {new Date(t.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Chat view */}
      <div className="flex-1 flex flex-col">
        {!activeTicket ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle size={48} className="mx-auto text-white/10 mb-4" />
              <p className="text-white/25 text-sm">Select a ticket to view conversation</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-white text-lg font-bold">{activeTicket.userName}</h3>
                <p className="text-white/30 text-sm">{activeTicket.userEmail}</p>
              </div>
              <div className="flex items-center gap-2">
                {activeTicket.status === "open" && (
                  <button
                    onClick={() => updateStatus(activeTicket.id, "assigned")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-green-400 bg-green-500/10 hover:bg-green-500/20 transition-colors font-medium"
                  >
                    <UserPlus size={12} />
                    Join Chat
                  </button>
                )}
                {activeTicket.status !== "closed" && (
                  <button
                    onClick={() => updateStatus(activeTicket.id, "closed")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors"
                  >
                    <XCircle size={10} />
                    Close
                  </button>
                )}
                {activeTicket.status === "closed" && (
                  <>
                    {activeTicket.rating && (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} size={12} className={s <= activeTicket.rating! ? "text-[#FDB02F] fill-[#FDB02F]" : "text-white/10"} />
                          ))}
                        </div>
                        {activeTicket.ratingFeedback && (
                          <span className="text-lg text-white/40 max-w-[200px] truncate" title={activeTicket.ratingFeedback}>
                            &ldquo;{activeTicket.ratingFeedback}&rdquo;
                          </span>
                        )}
                      </div>
                    )}
                    <button
                      onClick={() => updateStatus(activeTicket.id, "open")}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-green-400 bg-green-500/10 hover:bg-green-500/20 transition-colors"
                    >
                      <UserPlus size={12} />
                      Reopen
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {activeTicket.messages.map((msg) => (
                <div key={msg.id}>
                  {msg.sender === "system" ? (
                    <div className="flex justify-center my-2">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-base font-medium bg-[#FDB02F]/10 text-[#FDB02F]/70 border border-[#FDB02F]/10">
                        <UserPlus size={10} />
                        {msg.content}
                      </div>
                    </div>
                  ) : (
                    <div className={`flex ${msg.sender === "admin" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[70%] rounded-2xl px-4 py-3 text-base ${
                        msg.sender === "admin"
                          ? "bg-[#FDB02F] text-[#07123A]"
                          : "bg-white/5 text-white/70 border border-white/5"
                      }`}>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        <p className={`text-base mt-1 ${
                          msg.sender === "admin" ? "text-[#07123A]/40" : "text-white/20"
                        }`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply input */}
            {activeTicket.status !== "closed" && (
              <div className="p-4 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleReply(); }}
                    placeholder="Type your reply..."
                    className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-base placeholder:text-white/20 focus:outline-none focus:border-[#FDB02F]/40"
                  />
                  <button
                    onClick={handleReply}
                    disabled={!reply.trim() || sending}
                    className="p-3 rounded-xl bg-[#FDB02F] text-[#07123A] disabled:opacity-30 hover:bg-[#FDAA40] transition-colors"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
