"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Plus,
  MessageSquare,
  User,
  CreditCard,
  LogOut,
  Pin,
  Trash2,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeft,
  Search,
  X,
} from "lucide-react";

interface ChatItem {
  id: string;
  title: string;
  pinned: boolean;
  updatedAt: string;
  messages?: { content: string; createdAt: string }[];
}

interface CopilotSidebarProps {
  chats: ChatItem[];
  activeChatId?: string;
  userName: string;
  userPlan: string;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
  onPinChat: (id: string, pinned: boolean) => void;
  onRefresh: () => void;
  onCloseMobile?: () => void;
}

export function CopilotSidebar({
  chats,
  activeChatId,
  userName,
  userPlan,
  onNewChat,
  onDeleteChat,
  onPinChat,
  onCloseMobile,
}: CopilotSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const filtered = chats.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const pinnedChats = filtered.filter((c) => c.pinned);
  const recentChats = filtered.filter((c) => !c.pinned);

  async function handleLogout() {
    await fetch("/api/copilot/auth", { method: "DELETE" });
    router.push("/copilot/login");
  }

  const planColors: Record<string, string> = {
    free: "bg-white/10 text-white/50",
    basic: "bg-blue-500/15 text-blue-400",
    advanced: "bg-[#FDB02F]/15 text-[#FDB02F]",
    premium: "bg-purple-500/15 text-purple-400",
    enterprise: "bg-emerald-500/15 text-emerald-400",
  };

  if (collapsed) {
    return (
      <div className="w-16 h-full bg-[#0A1628] border-r border-white/5 hidden md:flex flex-col items-center py-4 gap-3">
        <button
          onClick={() => setCollapsed(false)}
          className="p-2 rounded-lg text-white/40 hover:text-white/60 hover:bg-white/5 transition-colors mb-1"
        >
          <PanelLeft size={18} />
        </button>
        <img src="/logo.webp" alt="OnDemandPsych" className="h-28 w-auto object-contain mb-2" />
        <button
          onClick={onNewChat}
          className="p-2.5 rounded-xl bg-[#FDB02F] text-[#07123A] hover:bg-[#FDAA40] transition-colors"
        >
          <Plus size={18} />
        </button>
        <div className="flex-1" />
        <Link
          href="/copilot/profile"
          className={`p-2 rounded-lg transition-colors ${
            pathname === "/copilot/profile" ? "text-[#FDB02F] bg-[#FDB02F]/10" : "text-white/40 hover:text-white/60 hover:bg-white/5"
          }`}
        >
          <User size={18} />
        </Link>
        <Link
          href="/copilot/subscription"
          className={`p-2 rounded-lg transition-colors ${
            pathname === "/copilot/subscription" ? "text-[#FDB02F] bg-[#FDB02F]/10" : "text-white/40 hover:text-white/60 hover:bg-white/5"
          }`}
        >
          <CreditCard size={18} />
        </Link>
        <button onClick={handleLogout} className="p-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors">
          <LogOut size={18} />
        </button>
      </div>
    );
  }

  return (
    <div className="w-72 bg-[#0A1628] border-r border-white/5 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center justify-between mb-2">
          {/* Mobile close button */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-white/30 hover:text-white/50 hover:bg-white/5 transition-colors md:hidden"
            >
              <X size={16} />
            </button>
          )}
          <div className="flex-1" />
          <button
            onClick={() => setCollapsed(true)}
            className="p-1.5 rounded-lg text-white/30 hover:text-white/50 hover:bg-white/5 transition-colors hidden md:block"
          >
            <PanelLeftClose size={16} />
          </button>
        </div>
        <div className="flex justify-center mb-3">
          <img src="/logo.webp" alt="OnDemandPsych" className="h-28 w-auto" />
        </div>

        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#FDB02F] text-[#07123A] font-semibold text-sm hover:bg-[#FDAA40] transition-colors"
        >
          <Plus size={16} />
          New Chat
        </button>
      </div>

      {/* Search */}
      <div className="px-4 py-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search chats..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/5 border border-white/5 text-white/70 text-xs placeholder:text-white/20 focus:outline-none focus:border-white/10 transition-colors"
          />
        </div>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {pinnedChats.length > 0 && (
          <div className="mb-3">
            <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/25">Pinned</p>
            {pinnedChats.map((chat) => (
              <ChatRow
                key={chat.id}
                chat={chat}
                active={chat.id === activeChatId}
                menuOpen={menuOpen === chat.id}
                onToggleMenu={() => setMenuOpen(menuOpen === chat.id ? null : chat.id)}
                onPin={() => { onPinChat(chat.id, false); setMenuOpen(null); }}
                onDelete={() => { onDeleteChat(chat.id); setMenuOpen(null); }}
              />
            ))}
          </div>
        )}

        {recentChats.length > 0 && (
          <div>
            <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/25">Recent</p>
            {recentChats.map((chat) => (
              <ChatRow
                key={chat.id}
                chat={chat}
                active={chat.id === activeChatId}
                menuOpen={menuOpen === chat.id}
                onToggleMenu={() => setMenuOpen(menuOpen === chat.id ? null : chat.id)}
                onPin={() => { onPinChat(chat.id, true); setMenuOpen(null); }}
                onDelete={() => { onDeleteChat(chat.id); setMenuOpen(null); }}
              />
            ))}
          </div>
        )}

        {chats.length === 0 && (
          <div className="text-center py-12 px-4">
            <MessageSquare size={32} className="mx-auto text-white/10 mb-3" />
            <p className="text-white/25 text-xs">No conversations yet</p>
            <p className="text-white/15 text-[11px] mt-1">Start a new chat to begin</p>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div className="border-t border-white/5 p-2 space-y-0.5">
        <Link
          href="/copilot/profile"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
            pathname === "/copilot/profile"
              ? "bg-[#FDB02F]/10 text-[#FDB02F]"
              : "text-white/40 hover:text-white/60 hover:bg-white/5"
          }`}
        >
          <User size={16} />
          Profile
        </Link>
        <Link
          href="/copilot/subscription"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
            pathname === "/copilot/subscription"
              ? "bg-[#FDB02F]/10 text-[#FDB02F]"
              : "text-white/40 hover:text-white/60 hover:bg-white/5"
          }`}
        >
          <CreditCard size={16} />
          Subscription
          <span className={`ml-auto text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${planColors[userPlan] || planColors.free}`}>
            {userPlan}
          </span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:text-red-400 hover:bg-red-500/5 transition-colors"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>

      {/* User info */}
      <div className="border-t border-white/5 p-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FDB02F]/20 to-[#FDB02F]/5 flex items-center justify-center text-[#FDB02F] text-xs font-bold">
            {userName?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white/70 text-xs font-medium truncate">{userName}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatRow({
  chat,
  active,
  menuOpen,
  onToggleMenu,
  onPin,
  onDelete,
}: {
  chat: ChatItem;
  active: boolean;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onPin: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="relative group">
      <Link
        href={`/copilot/chat?id=${chat.id}`}
        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all ${
          active
            ? "bg-white/10 text-white"
            : "text-white/50 hover:text-white/70 hover:bg-white/5"
        }`}
      >
        <MessageSquare size={14} className="shrink-0" />
        <span className="truncate flex-1">{chat.title}</span>
        {chat.pinned && <Pin size={10} className="text-[#FDB02F]/50 shrink-0" />}
      </Link>
      <button
        onClick={(e) => { e.preventDefault(); onToggleMenu(); }}
        className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md transition-all ${
          menuOpen ? "opacity-100 bg-white/10" : "opacity-0 group-hover:opacity-100"
        } text-white/40 hover:text-white/60`}
      >
        <MoreHorizontal size={14} />
      </button>
      {menuOpen && (
        <div className="absolute right-0 top-full mt-1 z-50 bg-[#0D1B4B] border border-white/10 rounded-xl shadow-xl py-1 min-w-[140px]">
          <button
            onClick={onPin}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white/60 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Pin size={12} />
            {chat.pinned ? "Unpin" : "Pin chat"}
          </button>
          <button
            onClick={onDelete}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400/70 hover:text-red-400 hover:bg-red-500/5 transition-colors"
          >
            <Trash2 size={12} />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
