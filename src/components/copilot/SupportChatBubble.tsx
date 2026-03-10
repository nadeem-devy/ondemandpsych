"use client";

import { useState, useEffect, useRef } from "react";
import { X, Send, Headset, HelpCircle, CreditCard, Bug, Settings, UserPlus } from "lucide-react";

interface SupportMsg {
  id: string;
  sender: "user" | "admin" | "system";
  content: string;
  createdAt: string;
}

interface SupportChatBubbleProps {
  open: boolean;
  onClose: () => void;
  theme: "dark" | "light";
}

const quickTopics = [
  { icon: HelpCircle, label: "General Question", message: "Hi, I have a general question about using the Co-Pilot." },
  { icon: CreditCard, label: "Billing & Plans", message: "I need help with my subscription or billing." },
  { icon: Bug, label: "Report an Issue", message: "I'd like to report a technical issue I'm experiencing." },
  { icon: Settings, label: "Account Settings", message: "I need help with my account settings." },
  { icon: UserPlus, label: "Feature Request", message: "I have a feature suggestion for the platform." },
];

export function SupportChatBubble({ open, onClose, theme }: SupportChatBubbleProps) {
  const [messages, setMessages] = useState<SupportMsg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [showTopics, setShowTopics] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load or create ticket
  useEffect(() => {
    if (!open) return;

    fetch("/api/copilot/support")
      .then((r) => r.json())
      .then((data) => {
        if (data.ticket) {
          setTicketId(data.ticket.id);
          setMessages(data.ticket.messages || []);
          setShowTopics(false);
        } else {
          setShowTopics(true);
        }
      })
      .catch(() => {});
  }, [open]);

  // Poll for new messages every 5 seconds
  useEffect(() => {
    if (!open || !ticketId) return;

    pollRef.current = setInterval(() => {
      fetch(`/api/copilot/support?ticketId=${ticketId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.ticket?.messages) {
            setMessages(data.ticket.messages);
          }
        })
        .catch(() => {});
    }, 5000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [open, ticketId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(content: string) {
    if (!content.trim() || sending) return;
    setSending(true);

    try {
      const res = await fetch("/api/copilot/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, ticketId }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error("Support API error:", res.status, errData);
        setSending(false);
        return;
      }
      const data = await res.json();
      if (data.ticket) {
        setTicketId(data.ticket.id);
        setMessages(data.ticket.messages || []);
        setShowTopics(false);
      }
    } catch (err) {
      console.error("Support send error:", err);
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
    sendMessage(message);
  }

  if (!open) return null;

  const isDark = theme === "dark";

  return (
    <div className={`fixed right-16 bottom-6 z-50 w-[400px] rounded-2xl shadow-2xl flex flex-col overflow-hidden ${
      isDark
        ? "bg-[#0A1628] border border-white/10"
        : "bg-white border border-gray-200"
    }`}
    style={{ height: "520px" }}
    >
      {/* Header */}
      <div className={`shrink-0 flex items-center justify-between px-5 py-4 border-b ${
        isDark ? "border-white/5 bg-[#0D1B4B]/60" : "border-gray-100 bg-gray-50"
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#FDB02F]/15 flex items-center justify-center">
            <Headset size={16} className="text-[#FDB02F]" />
          </div>
          <div>
            <h3 className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Support Chat</h3>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <span className={`text-[10px] ${isDark ? "text-white/40" : "text-gray-400"}`}>Online</span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className={`p-1.5 rounded-lg transition-colors ${
            isDark ? "text-white/30 hover:text-white/60 hover:bg-white/5" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          }`}
        >
          <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {showTopics && messages.length === 0 ? (
          <div className="py-2">
            <p className={`text-xs font-semibold mb-1 ${isDark ? "text-white/50" : "text-gray-600"}`}>
              How can we help you?
            </p>
            <p className={`text-[11px] mb-4 ${isDark ? "text-white/25" : "text-gray-400"}`}>
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
                  <span className={`text-xs font-medium ${isDark ? "text-white/70" : "text-gray-700"}`}>
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
                  // System message (joined chat, closed, etc.)
                  <div className="flex justify-center my-2">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-medium ${
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
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                        msg.sender === "user"
                          ? "bg-[#FDB02F] text-[#07123A]"
                          : isDark
                            ? "bg-white/5 text-white/70 border border-white/5"
                            : "bg-gray-100 text-gray-700 border border-gray-200"
                      }`}
                    >
                      {msg.sender === "admin" && (
                        <p className={`text-[10px] font-semibold mb-1 ${isDark ? "text-[#FDB02F]/70" : "text-[#FDB02F]"}`}>
                          Support Team
                        </p>
                      )}
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      <p className={`text-[9px] mt-1 ${
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
      <div className={`shrink-0 p-3 border-t ${isDark ? "border-white/5" : "border-gray-100"}`}>
        <div className={`flex items-center gap-2 rounded-xl px-3 py-2 ${
          isDark ? "bg-white/5 border border-white/5" : "bg-gray-50 border border-gray-200"
        }`}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
            placeholder="Type your message..."
            className={`flex-1 bg-transparent text-xs focus:outline-none ${
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
    </div>
  );
}
