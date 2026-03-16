"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
} from "lucide-react";

interface AuditEntry {
  id: string;
  actorId: string;
  actorEmail: string;
  actorType: string;
  action: string;
  targetType: string | null;
  targetId: string | null;
  details: string | null;
  ipAddress: string | null;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const actionColors: Record<string, string> = {
  "user.update": "text-blue-400",
  "user.delete": "text-red-400",
  "user.suspend": "text-orange-400",
  "login": "text-green-400",
  "plan.update": "text-purple-400",
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 30, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [actorTypeFilter, setActorTypeFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const fetchLogs = useCallback(async (page = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "30" });
    if (search) params.set("search", search);
    if (actionFilter) params.set("action", actionFilter);
    if (actorTypeFilter) params.set("actorType", actorTypeFilter);

    try {
      const res = await fetch(`/api/admin/audit-logs?${params}`);
      const data = await res.json();
      setLogs(data.logs || []);
      setPagination(data.pagination || { page: 1, limit: 30, total: 0, totalPages: 0 });
    } catch { /* ignore */ }
    setLoading(false);
  }, [search, actionFilter, actorTypeFilter]);

  useEffect(() => { fetchLogs(1); }, [fetchLogs]);

  return (
    <div className="">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
        <p className="text-white/40 text-lg mt-1">Track all admin and user actions ({pagination.total} entries)</p>
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Search by email, action, or target..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-base placeholder:text-white/25 focus:outline-none focus:border-[#FDB02F]/30"
          />
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-base font-medium transition-colors ${showFilters ? "bg-[#FDB02F]/10 border-[#FDB02F]/20 text-[#FDB02F]" : "bg-white/5 border-white/10 text-white/50"}`}>
          <Filter size={14} />
          Filters
        </button>
      </div>

      {showFilters && (
        <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-white/[0.02] border border-white/5">
          <select value={actorTypeFilter} onChange={(e) => setActorTypeFilter(e.target.value)} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 text-base focus:outline-none">
            <option value="">All Actor Types</option>
            <option value="admin">Admin</option>
            <option value="client">Client</option>
          </select>
          <input type="text" value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} placeholder="Filter by action (e.g. user.update)" className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 text-base placeholder:text-white/20 focus:outline-none" />
          {(actionFilter || actorTypeFilter) && (
            <button onClick={() => { setActionFilter(""); setActorTypeFilter(""); }} className="text-base text-white/30 hover:text-white/60">Clear</button>
          )}
        </div>
      )}

      {/* Log entries */}
      <div className="rounded-2xl bg-[#0D1B4B]/40 border border-white/10 overflow-hidden">
        {loading ? (
          <div className="divide-y divide-white/5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="px-4 py-4"><div className="h-4 bg-white/5 rounded animate-pulse" /></div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-white/30 text-lg">No audit logs found</div>
        ) : (
          <div className="divide-y divide-white/5">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                <Clock size={12} className="text-white/15 mt-1 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base font-medium text-white/70">{log.actorEmail}</span>
                    <span className={`text-lg font-mono ${actionColors[log.action] || "text-[#FDB02F]"}`}>{log.action}</span>
                    {log.targetType && (
                      <span className="text-base text-white/20">{log.targetType} {log.targetId ? `#${log.targetId.slice(0, 8)}` : ""}</span>
                    )}
                    <span className={`text-base px-1.5 py-0.5 rounded-full border ${log.actorType === "admin" ? "bg-purple-400/10 text-purple-400 border-purple-400/20" : "bg-blue-400/10 text-blue-400 border-blue-400/20"}`}>
                      {log.actorType}
                    </span>
                  </div>
                  {log.details && (() => {
                    try {
                      const parsed = JSON.parse(log.details);
                      return (
                        <div className="mt-1 flex flex-wrap gap-2">
                          {Object.entries(parsed).map(([key, val]) => {
                            const change = val as { from: unknown; to: unknown };
                            return (
                              <span key={key} className="text-base text-white/20">
                                {key}: <span className="text-red-400/50 line-through">{String(change.from ?? "")}</span> → <span className="text-green-400/50">{String(change.to ?? "")}</span>
                              </span>
                            );
                          })}
                        </div>
                      );
                    } catch {
                      return <p className="text-base text-white/15 mt-0.5 truncate">{log.details}</p>;
                    }
                  })()}
                </div>
                <span className="text-base text-white/15 shrink-0 whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
            <p className="text-lg text-white/25">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} entries)
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => fetchLogs(pagination.page - 1)} disabled={pagination.page <= 1} className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/5 disabled:opacity-20 transition-colors">
                <ChevronLeft size={14} />
              </button>
              <button onClick={() => fetchLogs(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages} className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/5 disabled:opacity-20 transition-colors">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
