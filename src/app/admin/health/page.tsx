"use client";

import { useEffect, useState } from "react";
import { Activity, RefreshCw, CheckCircle, AlertTriangle, XCircle } from "lucide-react";

interface HealthCheck {
  status: string;
  latency?: number;
  details?: string;
}

interface HealthData {
  status: string;
  checks: Record<string, HealthCheck>;
  timestamp: string;
}

const statusIcons = {
  healthy: { icon: CheckCircle, color: "text-green-400" },
  configured: { icon: CheckCircle, color: "text-green-400" },
  active: { icon: CheckCircle, color: "text-green-400" },
  dev_mode: { icon: AlertTriangle, color: "text-yellow-400" },
  warning: { icon: AlertTriangle, color: "text-orange-400" },
  not_configured: { icon: XCircle, color: "text-red-400" },
  unhealthy: { icon: XCircle, color: "text-red-400" },
};

export default function HealthPage() {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchHealth() {
    setLoading(true);
    const res = await fetch("/api/admin/health");
    const d = await res.json();
    setData(d);
    setLoading(false);
  }

  useEffect(() => { fetchHealth(); }, []);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">System Health</h1>
          <p className="text-white/40 text-sm mt-1">
            {data ? `Last checked: ${new Date(data.timestamp).toLocaleTimeString()}` : "Loading..."}
          </p>
        </div>
        <button onClick={fetchHealth} disabled={loading} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 text-xs font-medium hover:bg-white/10 disabled:opacity-50">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Overall status */}
      {data && (
        <div className={`rounded-2xl border p-6 mb-6 ${data.status === "healthy" ? "bg-green-400/5 border-green-400/20" : "bg-red-400/5 border-red-400/20"}`}>
          <div className="flex items-center gap-3">
            {data.status === "healthy" ? <CheckCircle size={24} className="text-green-400" /> : <XCircle size={24} className="text-red-400" />}
            <div>
              <p className="text-white font-bold text-lg">System {data.status === "healthy" ? "Healthy" : "Unhealthy"}</p>
              <p className="text-white/40 text-xs">All services checked</p>
            </div>
          </div>
        </div>
      )}

      {/* Individual checks */}
      <div className="grid md:grid-cols-2 gap-4">
        {loading ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />) :
        data ? Object.entries(data.checks).map(([name, check]) => {
          const config = statusIcons[check.status as keyof typeof statusIcons] || statusIcons.warning;
          const Icon = config.icon;
          return (
            <div key={name} className="rounded-2xl bg-[#0D1B4B]/40 border border-white/10 p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-white text-xs font-medium capitalize">{name.replace(/_/g, " ")}</p>
                <div className="flex items-center gap-1.5">
                  <Icon size={14} className={config.color} />
                  <span className={`text-[10px] font-medium ${config.color}`}>{check.status}</span>
                </div>
              </div>
              {check.latency !== undefined && <p className="text-white/30 text-[10px]">Latency: {check.latency}ms</p>}
              {check.details && <p className="text-white/20 text-[10px] mt-1">{check.details}</p>}
            </div>
          );
        }) : null}
      </div>
    </div>
  );
}
