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
  FolderPlus,
  FolderOpen,
  FolderClosed,
  ChevronDown,
  ChevronRight,
  FolderInput,
  Pencil,
  Check,
} from "lucide-react";

interface ChatItem {
  id: string;
  title: string;
  pinned: boolean;
  folderId?: string | null;
  updatedAt: string;
  messages?: { content: string; createdAt: string }[];
}

interface FolderItem {
  id: string;
  name: string;
  icon?: string | null;
  description?: string | null;
  _count?: { chats: number };
}

interface CopilotSidebarProps {
  chats: ChatItem[];
  folders: FolderItem[];
  activeChatId?: string;
  userName: string;
  userPlan: string;
  onNewChat: (folderId?: string) => void;
  onDeleteChat: (id: string) => void;
  onPinChat: (id: string, pinned: boolean) => void;
  onMoveChat: (chatId: string, folderId: string | null) => void;
  onCreateFolder: (name: string) => void;
  onRenameFolder: (id: string, name: string) => void;
  onDeleteFolder: (id: string) => void;
  onRefresh: () => void;
  onCloseMobile?: () => void;
}

export function CopilotSidebar({
  chats,
  folders,
  activeChatId,
  userName,
  userPlan,
  onNewChat,
  onDeleteChat,
  onPinChat,
  onMoveChat,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onCloseMobile,
}: CopilotSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editFolderName, setEditFolderName] = useState("");
  const [folderMenuOpen, setFolderMenuOpen] = useState<string | null>(null);

  const filtered = chats.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const pinnedChats = filtered.filter((c) => c.pinned && !c.folderId);
  const unfiledChats = filtered.filter((c) => !c.pinned && !c.folderId);

  function toggleFolder(folderId: string) {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) next.delete(folderId);
      else next.add(folderId);
      return next;
    });
  }

  function handleCreateFolder() {
    if (!newFolderName.trim()) return;
    onCreateFolder(newFolderName.trim());
    setNewFolderName("");
    setCreatingFolder(false);
  }

  function handleRenameFolder(id: string) {
    if (!editFolderName.trim()) return;
    onRenameFolder(id, editFolderName.trim());
    setEditingFolderId(null);
    setEditFolderName("");
  }

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
          onClick={() => onNewChat()}
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

        <div className="flex gap-2">
          <button
            onClick={() => onNewChat()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#FDB02F] text-[#07123A] font-semibold text-sm hover:bg-[#FDAA40] transition-colors"
          >
            <Plus size={16} />
            New Chat
          </button>
          <button
            onClick={() => setCreatingFolder(true)}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white/80 hover:bg-white/10 transition-colors"
            title="New Folder"
          >
            <FolderPlus size={16} />
          </button>
        </div>
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

      {/* New folder input */}
      {creatingFolder && (
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleCreateFolder(); if (e.key === "Escape") setCreatingFolder(false); }}
              placeholder="Folder name..."
              autoFocus
              className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 border border-[#FDB02F]/30 text-white/80 text-xs placeholder:text-white/20 focus:outline-none"
            />
            <button
              onClick={handleCreateFolder}
              className="p-1.5 rounded-lg bg-[#FDB02F] text-[#07123A] hover:bg-[#FDAA40] transition-colors"
            >
              <Check size={12} />
            </button>
            <button
              onClick={() => { setCreatingFolder(false); setNewFolderName(""); }}
              className="p-1.5 rounded-lg text-white/30 hover:text-white/50 hover:bg-white/5 transition-colors"
            >
              <X size={12} />
            </button>
          </div>
        </div>
      )}

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {/* Pinned chats */}
        {pinnedChats.length > 0 && (
          <div className="mb-3">
            <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/25">Pinned</p>
            {pinnedChats.map((chat) => (
              <ChatRow
                key={chat.id}
                chat={chat}
                active={chat.id === activeChatId}
                menuOpen={menuOpen === chat.id}
                folders={folders}
                onToggleMenu={() => { setMenuOpen(menuOpen === chat.id ? null : chat.id); setFolderMenuOpen(null); }}
                onPin={() => { onPinChat(chat.id, false); setMenuOpen(null); }}
                onDelete={() => { onDeleteChat(chat.id); setMenuOpen(null); }}
                onMoveToFolder={(folderId) => { onMoveChat(chat.id, folderId); setMenuOpen(null); }}
              />
            ))}
          </div>
        )}

        {/* Folders */}
        {folders.length > 0 && (
          <div className="mb-3">
            <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/25">Folders</p>
            {folders.map((folder) => {
              const folderChats = filtered.filter((c) => c.folderId === folder.id);
              const isExpanded = expandedFolders.has(folder.id);
              const isEditing = editingFolderId === folder.id;

              return (
                <div key={folder.id} className="mb-1">
                  {/* Folder header */}
                  <div className="relative group">
                    <button
                      onClick={() => toggleFolder(folder.id)}
                      className="w-full flex items-center gap-2 px-2 py-2 rounded-xl text-sm transition-all text-white/60 hover:text-white/80 hover:bg-white/5"
                    >
                      {isExpanded ? <ChevronDown size={12} className="shrink-0" /> : <ChevronRight size={12} className="shrink-0" />}
                      {isExpanded
                        ? <FolderOpen size={14} className="shrink-0 text-[#FDB02F]/60" />
                        : <FolderClosed size={14} className="shrink-0 text-[#FDB02F]/60" />
                      }
                      {isEditing ? (
                        <input
                          type="text"
                          value={editFolderName}
                          onChange={(e) => setEditFolderName(e.target.value)}
                          onKeyDown={(e) => {
                            e.stopPropagation();
                            if (e.key === "Enter") handleRenameFolder(folder.id);
                            if (e.key === "Escape") { setEditingFolderId(null); setEditFolderName(""); }
                          }}
                          onClick={(e) => e.stopPropagation()}
                          autoFocus
                          className="flex-1 bg-white/5 border border-[#FDB02F]/30 rounded px-2 py-0.5 text-xs text-white/80 focus:outline-none"
                        />
                      ) : (
                        <span className="truncate flex-1 text-left">{folder.icon ? `${folder.icon} ` : ""}{folder.name}</span>
                      )}
                      <span className="text-[10px] text-white/20 shrink-0">{folderChats.length}</span>
                    </button>

                    {/* Folder context menu trigger */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFolderMenuOpen(folderMenuOpen === folder.id ? null : folder.id);
                        setMenuOpen(null);
                      }}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md transition-all ${
                        folderMenuOpen === folder.id ? "opacity-100 bg-white/10" : "opacity-0 group-hover:opacity-100"
                      } text-white/40 hover:text-white/60`}
                    >
                      <MoreHorizontal size={12} />
                    </button>

                    {folderMenuOpen === folder.id && (
                      <div className="absolute right-0 top-full mt-1 z-50 bg-[#0D1B4B] border border-white/10 rounded-xl shadow-xl py-1 min-w-[160px]">
                        <button
                          onClick={() => { onNewChat(folder.id); setFolderMenuOpen(null); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <Plus size={12} />
                          New Chat in Folder
                        </button>
                        <button
                          onClick={() => {
                            setEditingFolderId(folder.id);
                            setEditFolderName(folder.name);
                            setFolderMenuOpen(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <Pencil size={12} />
                          Rename Folder
                        </button>
                        <button
                          onClick={() => { onDeleteFolder(folder.id); setFolderMenuOpen(null); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400/70 hover:text-red-400 hover:bg-red-500/5 transition-colors"
                        >
                          <Trash2 size={12} />
                          Delete Folder
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Folder chats */}
                  {isExpanded && (
                    <div className="ml-4 border-l border-white/5 pl-1">
                      {folderChats.length === 0 ? (
                        <p className="px-3 py-2 text-[10px] text-white/15 italic">No chats yet</p>
                      ) : (
                        folderChats.map((chat) => (
                          <ChatRow
                            key={chat.id}
                            chat={chat}
                            active={chat.id === activeChatId}
                            menuOpen={menuOpen === chat.id}
                            folders={folders}
                            onToggleMenu={() => { setMenuOpen(menuOpen === chat.id ? null : chat.id); setFolderMenuOpen(null); }}
                            onPin={() => { onPinChat(chat.id, !chat.pinned); setMenuOpen(null); }}
                            onDelete={() => { onDeleteChat(chat.id); setMenuOpen(null); }}
                            onMoveToFolder={(folderId) => { onMoveChat(chat.id, folderId); setMenuOpen(null); }}
                          />
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Unfiled recent chats */}
        {unfiledChats.length > 0 && (
          <div>
            <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/25">Recent</p>
            {unfiledChats.map((chat) => (
              <ChatRow
                key={chat.id}
                chat={chat}
                active={chat.id === activeChatId}
                menuOpen={menuOpen === chat.id}
                folders={folders}
                onToggleMenu={() => { setMenuOpen(menuOpen === chat.id ? null : chat.id); setFolderMenuOpen(null); }}
                onPin={() => { onPinChat(chat.id, true); setMenuOpen(null); }}
                onDelete={() => { onDeleteChat(chat.id); setMenuOpen(null); }}
                onMoveToFolder={(folderId) => { onMoveChat(chat.id, folderId); setMenuOpen(null); }}
              />
            ))}
          </div>
        )}

        {chats.length === 0 && folders.length === 0 && (
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
  folders,
  onToggleMenu,
  onPin,
  onDelete,
  onMoveToFolder,
}: {
  chat: ChatItem;
  active: boolean;
  menuOpen: boolean;
  folders: FolderItem[];
  onToggleMenu: () => void;
  onPin: () => void;
  onDelete: () => void;
  onMoveToFolder: (folderId: string | null) => void;
}) {
  const [showFolderPicker, setShowFolderPicker] = useState(false);

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
        onClick={(e) => { e.preventDefault(); onToggleMenu(); setShowFolderPicker(false); }}
        className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md transition-all ${
          menuOpen ? "opacity-100 bg-white/10" : "opacity-0 group-hover:opacity-100"
        } text-white/40 hover:text-white/60`}
      >
        <MoreHorizontal size={14} />
      </button>
      {menuOpen && (
        <div className="absolute right-0 top-full mt-1 z-50 bg-[#0D1B4B] border border-white/10 rounded-xl shadow-xl py-1 min-w-[160px]">
          <button
            onClick={onPin}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white/60 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Pin size={12} />
            {chat.pinned ? "Unpin" : "Pin chat"}
          </button>
          <button
            onClick={() => setShowFolderPicker(!showFolderPicker)}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white/60 hover:text-white hover:bg-white/5 transition-colors"
          >
            <FolderInput size={12} />
            Move to Folder
          </button>
          {showFolderPicker && (
            <div className="border-t border-white/5 py-1">
              {chat.folderId && (
                <button
                  onClick={() => onMoveToFolder(null)}
                  className="w-full flex items-center gap-2 px-5 py-1.5 text-[11px] text-white/40 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Remove from folder
                </button>
              )}
              {folders.map((f) => (
                <button
                  key={f.id}
                  onClick={() => onMoveToFolder(f.id)}
                  className={`w-full flex items-center gap-2 px-5 py-1.5 text-[11px] transition-colors ${
                    chat.folderId === f.id
                      ? "text-[#FDB02F] bg-[#FDB02F]/5"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <FolderClosed size={10} />
                  {f.icon ? `${f.icon} ` : ""}{f.name}
                </button>
              ))}
            </div>
          )}
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
