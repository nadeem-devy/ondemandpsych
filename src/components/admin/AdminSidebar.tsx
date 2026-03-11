"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  PenSquare,
  Settings,
  LogOut,
  Globe,
  Headset,
  Users,
  ScrollText,
  CreditCard,
  Receipt,
  Shield,
  Mail,
  FolderOpen,
  Activity,
  Plug,
  FileCheck,
} from "lucide-react";

const navGroups = [
  {
    label: "Platform",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/users", label: "Users", icon: Users },
      { href: "/admin/plans", label: "Plans", icon: CreditCard },
      { href: "/admin/transactions", label: "Transactions", icon: Receipt },
      { href: "/admin/support", label: "Support", icon: Headset, badgeKey: "openTickets" as const },
    ],
  },
  {
    label: "Security",
    items: [
      { href: "/admin/audit-logs", label: "Audit Logs", icon: ScrollText },
      { href: "/admin/sessions", label: "Sessions", icon: Shield },
      { href: "/admin/consent", label: "Consent", icon: FileCheck },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/pages", label: "Pages", icon: FileText },
      { href: "/admin/blog", label: "Blog Posts", icon: PenSquare },
      { href: "/admin/content-library", label: "Content Library", icon: FolderOpen },
      { href: "/admin/email-templates", label: "Email Templates", icon: Mail },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/admin/settings", label: "Settings", icon: Settings },
      { href: "/admin/health", label: "System Health", icon: Activity },
      { href: "/admin/integrations", label: "Integrations", icon: Plug },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [openTickets, setOpenTickets] = useState(0);

  useEffect(() => {
    if (pathname === "/admin/login") return;

    function fetchTicketCount() {
      fetch("/api/admin/support")
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) {
            const open = data.filter((t: { status: string }) => t.status === "open" || t.status === "assigned").length;
            setOpenTickets(open);
          }
        })
        .catch(() => {});
    }

    fetchTicketCount();
    const interval = setInterval(fetchTicketCount, 15000);
    return () => clearInterval(interval);
  }, [pathname]);

  if (pathname === "/admin/login") return null;

  return (
    <aside className="w-64 border-r border-white/10 bg-[#07123A] flex flex-col">
      {/* Logo */}
      <div className="py-4 px-6 border-b border-white/10 flex justify-center">
        <Link href="/admin">
          <img src="/logo.webp" alt="OnDemandPsych" className="h-16 w-auto" />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-4 mb-1.5 text-base font-semibold uppercase tracking-wider text-white/25">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/admin" && pathname.startsWith(item.href));
                const badgeCount = item.badgeKey === "openTickets" ? openTickets : 0;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-base font-medium transition-colors ${
                      isActive
                        ? "bg-[#FDB02F]/15 text-[#FDB02F]"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <item.icon size={20} />
                    <span className="flex-1">{item.label}</span>
                    {badgeCount > 0 && (
                      <span className="min-w-[22px] h-[22px] flex items-center justify-center px-1.5 rounded-full text-lg font-bold bg-[#FDB02F] text-[#07123A]">
                        {badgeCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10 space-y-1">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-base text-white/40 hover:text-white hover:bg-white/5 transition-colors"
        >
          <Globe size={20} />
          View Site
        </Link>
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-base text-white/40 hover:text-red-400 hover:bg-red-400/5 transition-colors w-full"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  );
}
