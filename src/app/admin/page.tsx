"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  MessageSquare,
  CreditCard,
  Headset,
  FileText,
  PenSquare,
  Settings,
  ExternalLink,
  ArrowUpRight,
  ArrowDownRight,
  UserPlus,
  Shield,
  AlertTriangle,
  Clock,
  ShieldAlert,
  UserX,
} from "lucide-react";

interface KPIs {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  freeUsers: number;
  paidUsers: number;
  newUsersThisMonth: number;
  newUsersThisWeek: number;
  totalChats: number;
  totalMessages: number;
  messagesThisWeek: number;
  openTickets: number;
  totalTickets: number;
  trialExhausted: number;
  conversionRate: string;
}

interface ActionRequired {
  unverifiedUsers: number;
  pastDueUsers: number;
  failedPayments: number;
  trialsEndingSoon: number;
  openTickets: number;
}

interface Analytics {
  kpis: KPIs;
  planBreakdown: { plan: string; count: number }[];
  recentSignups: string[];
  actionRequired: ActionRequired;
}

const quickLinks = [
  { href: "/admin/pages", icon: FileText, title: "Page Content", description: "Edit hero, sections, CTAs across all pages", color: "from-blue-500/20 to-blue-600/5" },
  { href: "/admin/blog", icon: PenSquare, title: "Blog Posts", description: "Create, edit, and publish blog articles", color: "from-[#FDB02F]/20 to-[#FDB02F]/5" },
  { href: "/admin/settings", icon: Settings, title: "Site Settings", description: "Global settings, SEO defaults, navigation", color: "from-purple-500/20 to-purple-600/5" },
];

export default function AdminDashboard() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const kpis = data?.kpis;

  const kpiCards = kpis
    ? [
        { label: "Total Users", value: kpis.totalUsers, icon: Users, color: "text-blue-400", sub: `${kpis.newUsersThisWeek} this week`, trend: kpis.newUsersThisWeek > 0 ? "up" : "neutral" },
        { label: "Active Users", value: kpis.activeUsers, icon: Shield, color: "text-green-400", sub: `${kpis.suspendedUsers} suspended`, trend: "neutral" },
        { label: "Paid Users", value: kpis.paidUsers, icon: CreditCard, color: "text-[#FDB02F]", sub: `${kpis.conversionRate}% conversion`, trend: parseFloat(kpis.conversionRate) > 0 ? "up" : "neutral" },
        { label: "Messages", value: kpis.totalMessages, icon: MessageSquare, color: "text-purple-400", sub: `${kpis.messagesThisWeek} this week`, trend: kpis.messagesThisWeek > 0 ? "up" : "neutral" },
        { label: "New This Month", value: kpis.newUsersThisMonth, icon: UserPlus, color: "text-cyan-400", sub: `${kpis.totalChats} total chats`, trend: "neutral" },
        { label: "Open Tickets", value: kpis.openTickets, icon: Headset, color: "text-orange-400", sub: `${kpis.totalTickets} total`, trend: kpis.openTickets > 0 ? "attention" : "neutral" },
      ]
    : [];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white">Dashboard</h1>
          <p className="text-white/40 text-lg mt-1">Platform overview and analytics</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/users" className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 text-lg font-medium hover:bg-white/10 transition-colors">
            Manage Users
          </Link>
          <Link href="/admin/support" className="px-4 py-2 rounded-lg bg-[#FDB02F]/10 border border-[#FDB02F]/20 text-[#FDB02F] text-lg font-medium hover:bg-[#FDB02F]/20 transition-colors">
            {kpis && kpis.openTickets > 0 ? `${kpis.openTickets} Open Tickets` : "Support"}
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-5 rounded-2xl bg-[#0D1B4B]/60 border border-white/10 animate-pulse h-28" />
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {kpiCards.map((kpi) => (
            <div key={kpi.label} className="p-5 rounded-2xl bg-[#0D1B4B]/60 border border-white/10 hover:border-white/20 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <kpi.icon size={18} className={kpi.color} />
                {kpi.trend === "up" && <ArrowUpRight size={14} className="text-green-400" />}
                {kpi.trend === "attention" && <ArrowDownRight size={14} className="text-orange-400" />}
              </div>
              <p className="text-3xl font-bold text-white">{kpi.value.toLocaleString()}</p>
              <p className="text-lg text-white/35 mt-1">{kpi.label}</p>
              <p className="text-base text-white/20 mt-0.5">{kpi.sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* Action Required Panel */}
      {data?.actionRequired && (() => {
        const ar = data.actionRequired;
        const items = [
          { label: "Unverified Users", count: ar.unverifiedUsers, icon: UserX, href: "/admin/users?status=active", color: "text-yellow-400 bg-yellow-400/10" },
          { label: "Past Due Payments", count: ar.pastDueUsers, icon: ShieldAlert, href: "/admin/users?status=active", color: "text-red-400 bg-red-400/10" },
          { label: "Failed Payments", count: ar.failedPayments, icon: AlertTriangle, href: "/admin/transactions?status=failed", color: "text-orange-400 bg-orange-400/10" },
          { label: "Trials Ending Soon", count: ar.trialsEndingSoon, icon: Clock, href: "/admin/users?plan=free", color: "text-cyan-400 bg-cyan-400/10" },
          { label: "Open Tickets", count: ar.openTickets, icon: Headset, href: "/admin/support", color: "text-[#FDB02F] bg-[#FDB02F]/10" },
        ].filter((i) => i.count > 0);

        return items.length > 0 ? (
          <div className="rounded-2xl bg-[#0D1B4B]/40 border border-orange-400/20 p-5 mb-8">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={18} className="text-orange-400" />
              <h2 className="text-white font-semibold text-lg">Action Required</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {items.map((item) => (
                <Link key={item.label} href={item.href} className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/15 transition-colors">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${item.color.split(" ")[1]}`}>
                    <item.icon size={13} className={item.color.split(" ")[0]} />
                  </div>
                  <div>
                    <p className="text-white text-base font-bold">{item.count}</p>
                    <p className="text-white/30 text-base">{item.label}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : null;
      })()}

      {/* Plan Breakdown + Trial Stats */}
      {data && (
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="p-6 rounded-2xl bg-[#0D1B4B]/40 border border-white/10">
            <h2 className="text-white font-semibold text-lg mb-4">Plan Distribution</h2>
            <div className="space-y-3">
              {data.planBreakdown.map((p) => {
                const pct = kpis && kpis.totalUsers > 0 ? (p.count / kpis.totalUsers * 100) : 0;
                return (
                  <div key={p.plan} className="flex items-center gap-3">
                    <span className="text-lg text-white/50 w-28 capitalize">{p.plan}</span>
                    <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-[#FDB02F]/60 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-lg text-white/40 w-20 text-right">{p.count} ({pct.toFixed(0)}%)</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-[#0D1B4B]/40 border border-white/10">
            <h2 className="text-white font-semibold text-lg mb-4">Trial & Conversion</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <p className="text-2xl font-bold text-white">{kpis?.freeUsers || 0}</p>
                <p className="text-lg text-white/35 mt-1">Free Users</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <p className="text-2xl font-bold text-white">{kpis?.paidUsers || 0}</p>
                <p className="text-lg text-white/35 mt-1">Paid Users</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <p className="text-2xl font-bold text-[#FDB02F]">{kpis?.conversionRate || 0}%</p>
                <p className="text-lg text-white/35 mt-1">Conversion Rate</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <p className="text-2xl font-bold text-orange-400">{kpis?.trialExhausted || 0}</p>
                <p className="text-lg text-white/35 mt-1">Trial Exhausted</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Links */}
      <h2 className="text-white font-semibold text-lg mb-3">Website Management</h2>
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {quickLinks.map((link) => (
          <Link key={link.href} href={link.href} className="group p-6 rounded-2xl bg-[#0D1B4B]/60 border border-white/10 hover:border-[#FDB02F]/25 transition-all">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${link.color} flex items-center justify-center mb-4`}>
              <link.icon size={22} className="text-white/80" />
            </div>
            <h3 className="text-white font-semibold text-base mb-1">{link.title}</h3>
            <p className="text-white/40 text-lg">{link.description}</p>
          </Link>
        ))}
      </div>

      {/* Managed Pages */}
      <div className="bg-[#0D1B4B]/40 border border-white/10 rounded-2xl p-6">
        <h2 className="text-white font-semibold text-lg mb-4">Managed Pages</h2>
        <div className="space-y-2">
          {[
            { name: "Home", slug: "home", sections: 10 },
            { name: "Features & Benefits", slug: "features-benefits", sections: 5 },
            { name: "Founder", slug: "founder", sections: 6 },
            { name: "Pricing", slug: "pricing", sections: 4 },
            { name: "Our Approach", slug: "our-unique-approach-workflow", sections: 5 },
            { name: "Contact Us", slug: "contact-us", sections: 3 },
          ].map((page) => (
            <Link key={page.slug} href={`/admin/pages?page=${page.slug}`} className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white/5 transition-colors group">
              <div className="flex items-center gap-3">
                <FileText size={16} className="text-white/30" />
                <span className="text-white/70 text-base font-medium">{page.name}</span>
                <span className="text-white/20 text-lg">{page.sections} sections</span>
              </div>
              <ExternalLink size={14} className="text-white/20 group-hover:text-[#FDB02F] transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
