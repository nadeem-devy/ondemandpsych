"use client";

import { useEffect, useState } from "react";
import { Plus, Save, Trash2, Package } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  priceMonthly: number;
  priceYearly: number;
  messageLimit: number;
  features: string | null;
  isActive: boolean;
  sortOrder: number;
}

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", displayName: "", description: "", priceMonthly: 0, priceYearly: 0, messageLimit: -1, features: "", sortOrder: 0 });

  useEffect(() => { fetchPlans(); }, []);

  async function fetchPlans() {
    const res = await fetch("/api/admin/plans");
    const data = await res.json();
    setPlans(data.plans || []);
    setLoading(false);
  }

  async function handleCreate() {
    const features = form.features ? form.features.split(",").map((f) => f.trim()) : [];
    await fetch("/api/admin/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, features }),
    });
    setShowCreate(false);
    setForm({ name: "", displayName: "", description: "", priceMonthly: 0, priceYearly: 0, messageLimit: -1, features: "", sortOrder: 0 });
    fetchPlans();
  }

  async function handleUpdate(id: string, updates: Partial<Plan>) {
    await fetch(`/api/admin/plans/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    setEditing(null);
    fetchPlans();
  }

  async function handleDelete(id: string) {
    if (!confirm("Deactivate this plan?")) return;
    await fetch(`/api/admin/plans/${id}`, { method: "DELETE" });
    fetchPlans();
  }

  return (
    <div className="">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Plans Management</h1>
          <p className="text-white/40 text-lg mt-1">Create and manage subscription plans</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FDB02F] text-[#07123A] text-base font-bold hover:bg-[#FDAA40] transition-colors">
          <Plus size={14} />
          New Plan
        </button>
      </div>

      {showCreate && (
        <div className="rounded-2xl bg-[#0D1B4B]/60 border border-[#FDB02F]/20 p-6 mb-6 space-y-4">
          <h3 className="text-white font-semibold text-lg">Create New Plan</h3>
          <div className="grid grid-cols-2 gap-4">
            <input placeholder="Internal name (e.g. basic)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-base placeholder:text-white/20 focus:outline-none" />
            <input placeholder="Display name (e.g. Basic Plan)" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-base placeholder:text-white/20 focus:outline-none" />
            <input placeholder="Monthly price" type="number" value={form.priceMonthly} onChange={(e) => setForm({ ...form, priceMonthly: parseFloat(e.target.value) })} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-base focus:outline-none" />
            <input placeholder="Yearly price" type="number" value={form.priceYearly} onChange={(e) => setForm({ ...form, priceYearly: parseFloat(e.target.value) })} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-base focus:outline-none" />
            <input placeholder="Message limit (-1 = unlimited)" type="number" value={form.messageLimit} onChange={(e) => setForm({ ...form, messageLimit: parseInt(e.target.value) })} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-base focus:outline-none" />
            <input placeholder="Features (comma-separated)" value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-base placeholder:text-white/20 focus:outline-none" />
          </div>
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-base placeholder:text-white/20 focus:outline-none resize-none" rows={2} />
          <div className="flex gap-2">
            <button onClick={handleCreate} className="px-4 py-2 rounded-lg bg-[#FDB02F] text-[#07123A] text-base font-bold">Create Plan</button>
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-lg bg-white/5 text-white/50 text-base">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />)
        ) : plans.length === 0 ? (
          <div className="text-center py-12 text-white/30">No plans created yet. Click "New Plan" to start.</div>
        ) : (
          plans.map((plan) => (
            <div key={plan.id} className={`rounded-2xl border p-6 ${plan.isActive ? "bg-[#0D1B4B]/40 border-white/10" : "bg-white/[0.02] border-white/5 opacity-50"}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FDB02F]/10 flex items-center justify-center">
                    <Package size={18} className="text-[#FDB02F]" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">{plan.displayName}</h3>
                    <p className="text-white/30 text-lg">{plan.name} • {plan.isActive ? "Active" : "Inactive"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleUpdate(plan.id, { isActive: !plan.isActive })} className="px-3 py-1.5 rounded-lg bg-white/5 text-white/50 text-lg hover:bg-white/10">
                    {plan.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button onClick={() => handleDelete(plan.id)} className="p-1.5 rounded-lg text-red-400/50 hover:text-red-400 hover:bg-red-400/10"><Trash2 size={14} /></button>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-4 gap-4">
                <div><p className="text-base text-white/30">Monthly</p><p className="text-white text-lg font-bold">${plan.priceMonthly}</p></div>
                <div><p className="text-base text-white/30">Yearly</p><p className="text-white text-lg font-bold">${plan.priceYearly}</p></div>
                <div><p className="text-base text-white/30">Message Limit</p><p className="text-white text-lg font-bold">{plan.messageLimit === -1 ? "Unlimited" : plan.messageLimit}</p></div>
                <div><p className="text-base text-white/30">Features</p><p className="text-white/50 text-lg">{plan.features ? JSON.parse(plan.features).join(", ") : "—"}</p></div>
              </div>
              {plan.description && <p className="mt-2 text-white/25 text-base">{plan.description}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
