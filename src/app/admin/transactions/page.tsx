"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, Download, ChevronLeft, ChevronRight, Filter, DollarSign, AlertTriangle } from "lucide-react";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  planName: string | null;
  description: string | null;
  createdAt: string;
  user: { name: string; email: string };
}

interface Pagination { page: number; limit: number; total: number; totalPages: number }

const statusColors: Record<string, string> = {
  completed: "bg-green-400/10 text-green-400 border-green-400/20",
  pending: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
  failed: "bg-red-400/10 text-red-400 border-red-400/20",
  refunded: "bg-purple-400/10 text-purple-400 border-purple-400/20",
};

export default function TransactionsPage() {
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [stats, setStats] = useState({ totalRevenue: 0, failedCount: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const fetchTxns = useCallback(async (page = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);

    const res = await fetch(`/api/admin/transactions?${params}`);
    const data = await res.json();
    setTxns(data.transactions || []);
    setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
    setStats(data.stats || { totalRevenue: 0, failedCount: 0 });
    setLoading(false);
  }, [search, statusFilter]);

  useEffect(() => { fetchTxns(1); }, [fetchTxns]);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Transactions</h1>
          <p className="text-white/40 text-lg mt-1">Payment history and billing</p>
        </div>
        <button onClick={() => window.open(`/api/admin/transactions?format=csv&${new URLSearchParams({ ...(search && { search }), ...(statusFilter && { status: statusFilter }) })}`, "_blank")} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 text-base font-medium hover:bg-white/10">
          <Download size={14} />
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-5 rounded-2xl bg-[#0D1B4B]/60 border border-white/10">
          <div className="flex items-center gap-2 mb-2"><DollarSign size={16} className="text-green-400" /></div>
          <p className="text-2xl font-bold text-white">${stats.totalRevenue.toFixed(2)}</p>
          <p className="text-lg text-white/35">Total Revenue</p>
        </div>
        <div className="p-5 rounded-2xl bg-[#0D1B4B]/60 border border-white/10">
          <div className="flex items-center gap-2 mb-2"><AlertTriangle size={16} className="text-red-400" /></div>
          <p className="text-2xl font-bold text-white">{stats.failedCount}</p>
          <p className="text-lg text-white/35">Failed Payments</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input type="text" placeholder="Search by user or plan..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-base placeholder:text-white/25 focus:outline-none focus:border-[#FDB02F]/30" />
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-base font-medium ${showFilters ? "bg-[#FDB02F]/10 border-[#FDB02F]/20 text-[#FDB02F]" : "bg-white/5 border-white/10 text-white/50"}`}>
          <Filter size={14} />Filters
        </button>
      </div>

      {showFilters && (
        <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-white/[0.02] border border-white/5">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 text-base focus:outline-none">
            <option value="">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl bg-[#0D1B4B]/40 border border-white/10 overflow-hidden">
        <table className="w-full text-base">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left px-4 py-3 text-white/30 font-medium">User</th>
              <th className="text-left px-4 py-3 text-white/30 font-medium">Type</th>
              <th className="text-left px-4 py-3 text-white/30 font-medium">Amount</th>
              <th className="text-left px-4 py-3 text-white/30 font-medium">Status</th>
              <th className="text-left px-4 py-3 text-white/30 font-medium">Plan</th>
              <th className="text-left px-4 py-3 text-white/30 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? Array.from({ length: 5 }).map((_, i) => <tr key={i} className="border-b border-white/5"><td colSpan={6} className="px-4 py-4"><div className="h-4 bg-white/5 rounded animate-pulse" /></td></tr>) :
            txns.length === 0 ? <tr><td colSpan={6} className="text-center py-12 text-white/30">No transactions yet</td></tr> :
            txns.map((t) => (
              <tr key={t.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="px-4 py-3"><p className="text-white/70">{t.user.name}</p><p className="text-white/30 text-base">{t.user.email}</p></td>
                <td className="px-4 py-3 text-white/50 capitalize">{t.type}</td>
                <td className="px-4 py-3 text-white font-medium">${t.amount.toFixed(2)}</td>
                <td className="px-4 py-3"><span className={`inline-flex px-2 py-0.5 rounded-full text-base font-medium border ${statusColors[t.status] || ""}`}>{t.status}</span></td>
                <td className="px-4 py-3 text-white/40 capitalize">{t.planName || "—"}</td>
                <td className="px-4 py-3 text-white/30">{new Date(t.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
            <p className="text-lg text-white/25">Page {pagination.page} of {pagination.totalPages}</p>
            <div className="flex gap-1">
              <button onClick={() => fetchTxns(pagination.page - 1)} disabled={pagination.page <= 1} className="p-1.5 rounded-lg text-white/30 hover:text-white disabled:opacity-20"><ChevronLeft size={14} /></button>
              <button onClick={() => fetchTxns(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages} className="p-1.5 rounded-lg text-white/30 hover:text-white disabled:opacity-20"><ChevronRight size={14} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
