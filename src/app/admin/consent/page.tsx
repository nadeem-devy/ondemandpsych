"use client";

import { useEffect, useState } from "react";
import { Plus, FileCheck, Check } from "lucide-react";

interface ConsentVersion {
  id: string;
  version: string;
  title: string;
  content: string;
  isActive: boolean;
  publishedAt: string;
}

export default function ConsentPage() {
  const [versions, setVersions] = useState<ConsentVersion[]>([]);
  const [totalAcceptances, setTotalAcceptances] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ version: "", title: "", content: "" });

  useEffect(() => { fetchConsent(); }, []);

  async function fetchConsent() {
    const res = await fetch("/api/admin/consent");
    const data = await res.json();
    setVersions(data.versions || []);
    setTotalAcceptances(data.totalAcceptances || 0);
    setLoading(false);
  }

  async function handleCreate() {
    await fetch("/api/admin/consent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setShowCreate(false);
    setForm({ version: "", title: "", content: "" });
    fetchConsent();
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Consent Management</h1>
          <p className="text-white/40 text-sm mt-1">Manage consent versions and track user acceptance ({totalAcceptances} total acceptances)</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FDB02F] text-[#07123A] text-xs font-bold hover:bg-[#FDAA40]">
          <Plus size={14} />
          New Version
        </button>
      </div>

      {showCreate && (
        <div className="rounded-2xl bg-[#0D1B4B]/60 border border-[#FDB02F]/20 p-6 mb-6 space-y-3">
          <p className="text-white/40 text-[11px]">Publishing a new version will deactivate all previous versions. Users must re-accept.</p>
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Version (e.g. 2.0)" value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/20 focus:outline-none" />
            <input placeholder="Title (e.g. Terms of Service)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/20 focus:outline-none" />
          </div>
          <textarea placeholder="Full consent text..." value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={8} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/20 focus:outline-none resize-none" />
          <div className="flex gap-2">
            <button onClick={handleCreate} className="px-4 py-2 rounded-lg bg-[#FDB02F] text-[#07123A] text-xs font-bold">Publish</button>
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-lg bg-white/5 text-white/50 text-xs">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {loading ? Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />) :
        versions.length === 0 ? <div className="text-center py-12 text-white/30">No consent versions created yet.</div> :
        versions.map((v) => (
          <div key={v.id} className={`rounded-2xl border p-5 ${v.isActive ? "bg-[#0D1B4B]/60 border-[#FDB02F]/20" : "bg-[#0D1B4B]/20 border-white/5 opacity-60"}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${v.isActive ? "bg-green-400/10" : "bg-white/5"}`}>
                  {v.isActive ? <Check size={14} className="text-green-400" /> : <FileCheck size={14} className="text-white/30" />}
                </div>
                <div>
                  <p className="text-white text-xs font-medium">{v.title} <span className="text-white/30 font-mono">v{v.version}</span></p>
                  <p className="text-white/25 text-[10px]">{v.isActive ? "Active" : "Archived"} • Published {new Date(v.publishedAt).toLocaleDateString()}</p>
                </div>
              </div>
              {v.isActive && <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-400/10 text-green-400 border border-green-400/20">Current</span>}
            </div>
            <p className="text-white/20 text-[11px] mt-3 line-clamp-2">{v.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
