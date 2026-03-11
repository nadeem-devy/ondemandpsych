"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  Eye,
  UserX,
  Shield,
  Filter,
} from "lucide-react";

interface UserRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  organization: string | null;
  role: string | null;
  status: string;
  plan: string;
  subscriptionStatus: string;
  trialMessageCount: number;
  trialMessageLimit: number;
  lastLoginAt: string | null;
  emailVerified: boolean;
  tags: string | null;
  createdAt: string;
  _count: { chats: number };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const statusColors: Record<string, string> = {
  active: "bg-green-400/10 text-green-400 border-green-400/20",
  suspended: "bg-red-400/10 text-red-400 border-red-400/20",
  deactivated: "bg-white/5 text-white/30 border-white/10",
};

const planColors: Record<string, string> = {
  free: "bg-white/5 text-white/50 border-white/10",
  basic: "bg-blue-400/10 text-blue-400 border-blue-400/20",
  professional: "bg-purple-400/10 text-purple-400 border-purple-400/20",
  enterprise: "bg-[#FDB02F]/10 text-[#FDB02F] border-[#FDB02F]/20",
};

export default function UsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    if (planFilter) params.set("plan", planFilter);

    try {
      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();
      setUsers(data.users || []);
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
    } catch { /* ignore */ }
    setLoading(false);
  }, [search, statusFilter, planFilter]);

  useEffect(() => { fetchUsers(1); }, [fetchUsers]);

  function handleExportCSV() {
    const params = new URLSearchParams({ format: "csv" });
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    if (planFilter) params.set("plan", planFilter);
    window.open(`/api/admin/users?${params}`, "_blank");
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-white/40 text-lg mt-1">{pagination.total} total users</p>
        </div>
        <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 text-base font-medium hover:bg-white/10 transition-colors">
          <Download size={14} />
          Export CSV
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Search by name, email, or organization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-base placeholder:text-white/25 focus:outline-none focus:border-[#FDB02F]/30"
          />
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-base font-medium transition-colors ${showFilters ? "bg-[#FDB02F]/10 border-[#FDB02F]/20 text-[#FDB02F]" : "bg-white/5 border-white/10 text-white/50 hover:text-white/70"}`}>
          <Filter size={14} />
          Filters
        </button>
      </div>

      {showFilters && (
        <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-white/[0.02] border border-white/5">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 text-base focus:outline-none">
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="deactivated">Deactivated</option>
          </select>
          <select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 text-base focus:outline-none">
            <option value="">All Plans</option>
            <option value="free">Free</option>
            <option value="basic">Basic</option>
            <option value="professional">Professional</option>
            <option value="enterprise">Enterprise</option>
          </select>
          {(statusFilter || planFilter) && (
            <button onClick={() => { setStatusFilter(""); setPlanFilter(""); }} className="text-base text-white/30 hover:text-white/60 transition-colors">
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl bg-[#0D1B4B]/40 border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-base">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-4 py-3 text-white/30 font-medium">User</th>
                <th className="text-left px-4 py-3 text-white/30 font-medium">Status</th>
                <th className="text-left px-4 py-3 text-white/30 font-medium">Plan</th>
                <th className="text-left px-4 py-3 text-white/30 font-medium">Trial</th>
                <th className="text-left px-4 py-3 text-white/30 font-medium">Chats</th>
                <th className="text-left px-4 py-3 text-white/30 font-medium">Joined</th>
                <th className="text-right px-4 py-3 text-white/30 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td colSpan={7} className="px-4 py-4"><div className="h-4 bg-white/5 rounded animate-pulse" /></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-white/30">No users found</td></tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-white font-medium">{u.name}</p>
                        <p className="text-white/30 text-lg">{u.email}</p>
                        {u.organization && <p className="text-white/20 text-base">{u.organization}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-base font-medium border ${statusColors[u.status] || statusColors.active}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-base font-medium capitalize border ${planColors[u.plan] || planColors.free}`}>
                        {u.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-[#FDB02F]/50 rounded-full" style={{ width: `${Math.min(100, (u.trialMessageCount / u.trialMessageLimit) * 100)}%` }} />
                        </div>
                        <span className="text-white/30 text-base">{u.trialMessageCount}/{u.trialMessageLimit}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white/40">{u._count.chats}</td>
                    <td className="px-4 py-3 text-white/30 text-lg">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/users/${u.id}`} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-colors text-lg">
                        <Eye size={12} />
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
            <p className="text-lg text-white/25">
              Showing {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => fetchUsers(pagination.page - 1)} disabled={pagination.page <= 1} className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/5 disabled:opacity-20 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft size={14} />
              </button>
              <span className="text-lg text-white/40 px-2">Page {pagination.page} of {pagination.totalPages}</span>
              <button onClick={() => fetchUsers(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages} className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/5 disabled:opacity-20 disabled:cursor-not-allowed transition-colors">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
