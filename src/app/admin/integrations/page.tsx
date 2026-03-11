"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, CreditCard, Mail, Shield, RefreshCw } from "lucide-react";

interface HealthData {
  status: string;
  checks: Record<string, { status: string; details?: string }>;
}

export default function IntegrationsPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [ipEntries, setIpEntries] = useState<Array<{ id: string; ipRange: string; description: string | null; isActive: boolean }>>([]);
  const [newIp, setNewIp] = useState("");
  const [newIpDesc, setNewIpDesc] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/health").then((r) => r.json()),
      fetch("/api/admin/ip-allowlist").then((r) => r.json()),
    ]).then(([h, ip]) => {
      setHealth(h);
      setIpEntries(ip.entries || []);
      setLoading(false);
    });
  }, []);

  async function addIp() {
    if (!newIp) return;
    await fetch("/api/admin/ip-allowlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ipRange: newIp, description: newIpDesc }),
    });
    setNewIp("");
    setNewIpDesc("");
    const res = await fetch("/api/admin/ip-allowlist");
    const data = await res.json();
    setIpEntries(data.entries || []);
  }

  async function removeIp(id: string) {
    await fetch("/api/admin/ip-allowlist", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setIpEntries(ipEntries.filter((e) => e.id !== id));
  }

  const integrations = [
    { name: "Stripe", icon: CreditCard, key: "stripe", description: "Payment processing and subscription management" },
    { name: "Email Service", icon: Mail, key: "email", description: "Automated email delivery (Welcome, OTP, Billing)" },
    { name: "OTP Service", icon: Shield, key: "otp", description: "One-time password verification for email & phone" },
  ];

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Integrations & Security</h1>
        <p className="text-white/40 text-lg mt-1">External service health and IP access control</p>
      </div>

      {/* Integration Status */}
      <h2 className="text-white font-semibold text-lg mb-3">Service Status</h2>
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {integrations.map((int) => {
          const check = health?.checks[int.key];
          const isHealthy = check?.status === "configured" || check?.status === "active" || check?.status === "healthy";
          return (
            <div key={int.key} className="rounded-2xl bg-[#0D1B4B]/40 border border-white/10 p-5">
              <div className="flex items-center justify-between mb-3">
                <int.icon size={20} className="text-[#FDB02F]" />
                {loading ? <RefreshCw size={14} className="text-white/20 animate-spin" /> :
                isHealthy ? <CheckCircle size={16} className="text-green-400" /> : <XCircle size={16} className="text-red-400" />}
              </div>
              <p className="text-white text-lg font-medium">{int.name}</p>
              <p className="text-white/30 text-lg mt-0.5">{int.description}</p>
              {check?.details && <p className="text-white/15 text-base mt-2">{check.details}</p>}
            </div>
          );
        })}
      </div>

      {/* IP Allowlist */}
      <h2 className="text-white font-semibold text-lg mb-3">Admin IP Allowlist</h2>
      <p className="text-white/30 text-base mb-4">Restrict admin panel access to specific IP addresses. Leave empty to allow all IPs.</p>

      <div className="rounded-2xl bg-[#0D1B4B]/40 border border-white/10 p-5 mb-4">
        <div className="flex gap-3 mb-4">
          <input placeholder="IP address or CIDR (e.g. 192.168.1.0/24)" value={newIp} onChange={(e) => setNewIp(e.target.value)} className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-base placeholder:text-white/20 focus:outline-none" />
          <input placeholder="Description (optional)" value={newIpDesc} onChange={(e) => setNewIpDesc(e.target.value)} className="w-48 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-base placeholder:text-white/20 focus:outline-none" />
          <button onClick={addIp} className="px-4 py-2 rounded-lg bg-[#FDB02F] text-[#07123A] text-base font-bold hover:bg-[#FDAA40]">Add</button>
        </div>

        {ipEntries.length === 0 ? (
          <p className="text-white/20 text-base text-center py-4">No IP restrictions configured. All IPs can access admin.</p>
        ) : (
          <div className="divide-y divide-white/5">
            {ipEntries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-white text-base font-mono">{entry.ipRange}</p>
                  {entry.description && <p className="text-white/25 text-base">{entry.description}</p>}
                </div>
                <button onClick={() => removeIp(entry.id)} className="text-red-400/50 hover:text-red-400 text-lg">Remove</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
