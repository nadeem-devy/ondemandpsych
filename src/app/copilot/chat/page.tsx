"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CopilotSidebar } from "@/components/copilot/CopilotSidebar";
import { ChatInterface } from "@/components/copilot/ChatInterface";
import { QuickActions } from "@/components/copilot/QuickActions";
import { SupportChatBubble } from "@/components/copilot/SupportChatBubble";
import { ThemeProvider, useTheme } from "@/components/copilot/ThemeProvider";

interface ChatItem {
  id: string;
  title: string;
  pinned: boolean;
  updatedAt: string;
  messages?: { content: string; createdAt: string }[];
}

interface MessageItem {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

function CopilotChatInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const chatId = searchParams.get("id");
  const { theme, toggleTheme } = useTheme();

  const [chats, setChats] = useState<ChatItem[]>([]);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("");
  const [userPlan, setUserPlan] = useState("free");
  const [authChecked, setAuthChecked] = useState(false);
  const [fontSize, setFontSize] = useState(15);
  const [supportOpen, setSupportOpen] = useState(false);

  // Check auth
  useEffect(() => {
    fetch("/api/copilot/profile")
      .then((r) => {
        if (!r.ok) throw new Error("Unauthorized");
        return r.json();
      })
      .then((data) => {
        setUserName(data.name);
        setUserPlan(data.plan);
        setAuthChecked(true);
      })
      .catch(() => {
        router.push("/copilot/login");
      });
  }, [router]);

  // Load saved font size
  useEffect(() => {
    const saved = localStorage.getItem("copilot-font-size");
    if (saved) setFontSize(Number(saved));
  }, []);

  // Load chats
  const loadChats = useCallback(() => {
    fetch("/api/copilot/chats")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setChats(data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (authChecked) loadChats();
  }, [authChecked, loadChats]);

  // Load messages when chat changes
  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      return;
    }
    fetch(`/api/copilot/messages?chatId=${chatId}`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setMessages(data); })
      .catch(() => {});
  }, [chatId]);

  function handleFontSizeChange(size: number) {
    setFontSize(size);
    localStorage.setItem("copilot-font-size", String(size));
  }

  async function handleNewChat() {
    try {
      const res = await fetch("/api/copilot/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const chat = await res.json();
      loadChats();
      router.push(`/copilot/chat?id=${chat.id}`);
    } catch {}
  }

  async function handleDeleteChat(id: string) {
    await fetch("/api/copilot/chats", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    loadChats();
    if (chatId === id) router.push("/copilot/chat");
  }

  async function handlePinChat(id: string, pinned: boolean) {
    await fetch("/api/copilot/chats", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, pinned }),
    });
    loadChats();
  }

  async function handleSendMessage(content: string) {
    let currentChatId = chatId;

    // Auto-create chat if none selected
    if (!currentChatId) {
      const res = await fetch("/api/copilot/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const chat = await res.json();
      currentChatId = chat.id;
      router.push(`/copilot/chat?id=${chat.id}`);
    }

    // Optimistic user message
    const tempUserMsg: MessageItem = {
      id: "temp-user-" + Date.now(),
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const res = await fetch("/api/copilot/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId: currentChatId, content }),
      });
      const data = await res.json();

      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempUserMsg.id),
        data.userMessage,
        data.assistantMessage,
      ]);
      loadChats();
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
    }
    setLoading(false);
  }

  const isDark = theme === "dark";

  if (!authChecked) {
    return (
      <div className={`h-screen flex items-center justify-center ${isDark ? "bg-[#07123A]" : "bg-gray-50"}`}>
        <div className="w-8 h-8 border-2 border-[#FDB02F]/30 border-t-[#FDB02F] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      className={`flex h-screen overflow-hidden ${isDark ? "bg-[#07123A]" : "bg-gray-50"}`}
      style={{ "--copilot-font-size": `${fontSize}px` } as React.CSSProperties}
    >
      <div className="shrink-0">
        <CopilotSidebar
          chats={chats}
          activeChatId={chatId || undefined}
          userName={userName}
          userPlan={userPlan}
          onNewChat={handleNewChat}
          onDeleteChat={handleDeleteChat}
          onPinChat={handlePinChat}
          onRefresh={loadChats}
        />
      </div>

      <div className={`flex-1 flex flex-col min-h-0 min-w-0 ${isDark ? "" : "copilot-light"}`}>
        <ChatInterface
          chatId={chatId}
          messages={messages}
          onSendMessage={handleSendMessage}
          loading={loading}
        />
      </div>

      <QuickActions
        fontSize={fontSize}
        onFontSizeChange={handleFontSizeChange}
        theme={theme}
        onThemeToggle={toggleTheme}
        onOpenSupport={() => setSupportOpen(true)}
      />

      <SupportChatBubble
        open={supportOpen}
        onClose={() => setSupportOpen(false)}
        theme={theme}
      />
    </div>
  );
}

export default function CopilotChatPage() {
  return (
    <ThemeProvider>
      <Suspense fallback={null}>
        <CopilotChatInner />
      </Suspense>
    </ThemeProvider>
  );
}
