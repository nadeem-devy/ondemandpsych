"use client";

import { useEffect, useState } from "react";
import { Monitor, Trash2, Shield } from "lucide-react";

interface AdminSession {
  id: string;
  userId: string;
  email: string;
  userAgent: string | null;
  ipAddress: string | null;
  isActive: boolean;
  expiresAt: string;
  createdAt: string;
  lastSeenAt: string;
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<AdminSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchSessions(); }, []);

  async function fetchSessions() {
    const res = await fetch("/api/admin/sessions");
    const data = await res.json();
    setSessions(data.sessions || []);
    setLoading(false);
  }

  async function revokeSession(id: string) {
    if (!confirm("Revoke this session?")) return;
    await fetch(`/api/admin/sessions/${id}`, { method: "DELETE" });
    fetchSessions();
  }

  return (
    <div className="">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Session Management</h1>
        <p className="text-white/40 text-lg mt-1">Active admin sessions and device management</p>
      </div>

      <div className="rounded-2xl bg-[#0D1B4B]/40 border border-white/10 overflow-hidden">
        {loading ? (
          <div className=""><div className="h-20 bg-white/5 rounded animate-pulse" /></div>
        ) : sessions.length === 0 ? (
          <div className="p-12 text-center text-white/30 text-lg">No active sessions</div>
        ) : (
          <div className="divide-y divide-white/5">
            {sessions.map((s) => (
              <div key={s.id} className="flex items-center justify-between px-5 py-4 hover:bg-white/[0.02]">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                    <Monitor size={16} className="text-white/30" />
                  </div>
                  <div>
                    <p className="text-white text-base font-medium">{s.email}</p>
                    <p className="text-white/25 text-base mt-0.5">{s.userAgent ? s.userAgent.slice(0, 60) + "..." : "Unknown device"}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-base text-white/20">IP: {s.ipAddress || "—"}</span>
                      <span className="text-base text-white/20">Last seen: {new Date(s.lastSeenAt).toLocaleString()}</span>
                      <span className="text-base text-white/20">Expires: {new Date(s.expiresAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => revokeSession(s.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-lg hover:bg-red-500/20">
                  <Trash2 size={12} />
                  Revoke
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
