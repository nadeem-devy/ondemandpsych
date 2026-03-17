"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Trash2,
  MessageSquare,
  Clock,
  Shield,
  CreditCard,
  ScrollText,
} from "lucide-react";

interface UserDetail {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  organization: string | null;
  role: string | null;
  status: string;
  plan: string;
  planExpiresAt: string | null;
  subscriptionStatus: string;
  trialMessageCount: number;
  trialMessageLimit: number;
  trialExpiresAt: string | null;
  jurisdiction: string | null;
  licenseNumber: string | null;
  licenseVerified: boolean;
  consentVersion: string | null;
  tags: string | null;
  notes: string | null;
  lastLoginAt: string | null;
  emailVerified: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  chats: { id: string; title: string; createdAt: string; updatedAt: string; _count: { messages: number } }[];
  transactions: { id: string; type: string; amount: number; currency: string; status: string; planName: string | null; createdAt: string }[];
}

interface AuditEntry {
  id: string;
  actorEmail: string;
  actorType: string;
  action: string;
  details: string | null;
  createdAt: string;
}

const statusOptions = ["active", "suspended", "deactivated"];
const planOptions = ["free", "basic", "advanced", "premium"];

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"details" | "chats" | "audit">("details");

  // Editable fields
  const [form, setForm] = useState({
    name: "",
    status: "",
    plan: "",
    role: "",
    organization: "",
    phone: "",
    trialMessageLimit: 10,
    tags: "",
    notes: "",
    jurisdiction: "",
    licenseNumber: "",
    licenseVerified: false,
    subscriptionStatus: "",
  });

  useEffect(() => {
    fetch(`/api/admin/users/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setUser(data.user);
        setAuditLogs(data.auditLogs || []);
        if (data.user) {
          setForm({
            name: data.user.name || "",
            status: data.user.status || "active",
            plan: data.user.plan || "free",
            role: data.user.role || "",
            organization: data.user.organization || "",
            phone: data.user.phone || "",
            trialMessageLimit: data.user.trialMessageLimit || 10,
            tags: data.user.tags || "",
            notes: data.user.notes || "",
            jurisdiction: data.user.jurisdiction || "",
            licenseNumber: data.user.licenseNumber || "",
            licenseVerified: data.user.licenseVerified || false,
            subscriptionStatus: data.user.subscriptionStatus || "trialing",
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser((prev) => prev ? { ...prev, ...data.user } : prev);
      }
    } catch { /* ignore */ }
    setSaving(false);
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to deactivate this user? This is a soft delete.")) return;
    try {
      await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      router.push("/admin/users");
    } catch { /* ignore */ }
  }

  async function handleAction(action: string) {
    const labels: Record<string, string> = {
      reset_password: "Reset password and send email?",
      resend_welcome: "Resend welcome email?",
      send_verification: "Send verification email?",
      reset_trial: "Reset trial message count to 0?",
      suspend: "Suspend this user?",
      activate: "Activate this user?",
    };
    if (!confirm(labels[action] || `Perform ${action}?`)) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.message) alert(data.message);
      // Refresh user data
      const r = await fetch(`/api/admin/users/${id}`);
      const d = await r.json();
      if (d.user) setUser(d.user);
      if (d.auditLogs) setAuditLogs(d.auditLogs);
    } catch { /* ignore */ }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="h-8 w-48 bg-white/5 rounded animate-pulse mb-4" />
        <div className="h-96 bg-white/5 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return <div className="p-8 text-white/40">User not found</div>;
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/users" className="p-2 rounded-lg bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-colors">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">{user.name}</h1>
            <p className="text-white/40 text-base">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => handleAction("reset_password")} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/50 text-lg hover:bg-white/10">Reset Password</button>
          <button onClick={() => handleAction("resend_welcome")} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/50 text-lg hover:bg-white/10">Resend Welcome</button>
          <button onClick={() => handleAction("send_verification")} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/50 text-lg hover:bg-white/10">Send Verification</button>
          <button onClick={() => handleAction("reset_trial")} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/50 text-lg hover:bg-white/10">Reset Trial</button>
          {user.status === "active" ? (
            <button onClick={() => handleAction("suspend")} className="px-3 py-2 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 text-lg hover:bg-orange-500/20">Suspend</button>
          ) : (
            <button onClick={() => handleAction("activate")} className="px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-lg hover:bg-green-500/20">Activate</button>
          )}
          <button onClick={handleDelete} className="flex items-center gap-1 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-lg hover:bg-red-500/20">
            <Trash2 size={11} />
            Deactivate
          </button>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-1 px-4 py-2 rounded-lg bg-[#FDB02F] text-[#07123A] text-lg font-bold hover:bg-[#FDAA40] disabled:opacity-50">
            <Save size={11} />
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6">
        {([
          { key: "details", label: "Details", icon: Shield },
          { key: "chats", label: `Chats (${user.chats.length})`, icon: MessageSquare },
          { key: "audit", label: `Audit Log (${auditLogs.length})`, icon: ScrollText },
        ] as const).map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-base font-medium transition-colors ${tab === t.key ? "bg-[#FDB02F]/15 text-[#FDB02F]" : "text-white/40 hover:text-white/60 hover:bg-white/5"}`}>
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Details Tab */}
      {tab === "details" && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Profile */}
          <div className="rounded-2xl bg-[#0D1B4B]/40 border border-white/10 p-6 space-y-4">
            <h2 className="text-white font-semibold text-lg mb-2">Profile</h2>
            <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
            <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
            <Field label="Organization" value={form.organization} onChange={(v) => setForm({ ...form, organization: v })} />
            <Field label="Role" value={form.role} onChange={(v) => setForm({ ...form, role: v })} placeholder="e.g. Psychiatrist" />
            <Field label="Tags" value={form.tags} onChange={(v) => setForm({ ...form, tags: v })} placeholder="comma-separated" />
          </div>

          {/* Plan & Status */}
          <div className="rounded-2xl bg-[#0D1B4B]/40 border border-white/10 p-6 space-y-4">
            <h2 className="text-white font-semibold text-lg mb-2">Plan & Status</h2>
            <SelectField label="Status" value={form.status} options={statusOptions} onChange={(v) => setForm({ ...form, status: v })} />
            <SelectField label="Plan" value={form.plan} options={planOptions} onChange={(v) => setForm({ ...form, plan: v })} />
            <SelectField label="Subscription" value={form.subscriptionStatus} options={["trialing", "active", "past_due", "cancelled"]} onChange={(v) => setForm({ ...form, subscriptionStatus: v })} />
            {form.plan === "free" ? (
              <>
                <div>
                  <label className="text-lg text-white/40 mb-1 block">Trial Message Limit</label>
                  <input type="number" value={form.trialMessageLimit} onChange={(e) => setForm({ ...form, trialMessageLimit: parseInt(e.target.value) || 10 })} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-base focus:outline-none focus:border-[#FDB02F]/30" />
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <div className="text-lg text-white/40">Trial Used:</div>
                  <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-[#FDB02F]/50 rounded-full" style={{ width: `${Math.min(100, (user.trialMessageCount / user.trialMessageLimit) * 100)}%` }} />
                  </div>
                  <div className="text-lg text-white/30">{user.trialMessageCount}/{user.trialMessageLimit}</div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3 pt-2">
                <div className="text-lg text-white/40">Messages:</div>
                <div className="text-lg text-green-400 font-semibold">Unlimited</div>
              </div>
            )}
          </div>

          {/* Compliance */}
          <div className="rounded-2xl bg-[#0D1B4B]/40 border border-white/10 p-6 space-y-4">
            <h2 className="text-white font-semibold text-lg mb-2">Compliance</h2>
            <Field label="Jurisdiction" value={form.jurisdiction} onChange={(v) => setForm({ ...form, jurisdiction: v })} />
            <Field label="License Number" value={form.licenseNumber} onChange={(v) => setForm({ ...form, licenseNumber: v })} />
            <div className="flex items-center gap-3">
              <label className="text-lg text-white/40">License Verified</label>
              <button onClick={() => setForm({ ...form, licenseVerified: !form.licenseVerified })} className={`w-10 h-5 rounded-full transition-colors relative ${form.licenseVerified ? "bg-green-500" : "bg-white/10"}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${form.licenseVerified ? "left-5" : "left-0.5"}`} />
              </button>
            </div>
          </div>

          {/* Notes */}
          <div className="rounded-2xl bg-[#0D1B4B]/40 border border-white/10 p-6 space-y-4">
            <h2 className="text-white font-semibold text-lg mb-2">Admin Notes</h2>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={6}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-base placeholder:text-white/20 focus:outline-none focus:border-[#FDB02F]/30 resize-none"
              placeholder="Internal admin notes..."
            />
            <div className="flex items-center gap-4 text-base text-white/20">
              <span>Created: {new Date(user.createdAt).toLocaleDateString()}</span>
              <span>Last Login: {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : "Never"}</span>
              <span>Email Verified: {user.emailVerified ? "Yes" : "No"}</span>
            </div>
          </div>
        </div>
      )}

      {/* Chats Tab */}
      {tab === "chats" && (
        <div className="rounded-2xl bg-[#0D1B4B]/40 border border-white/10 overflow-hidden">
          {user.chats.length === 0 ? (
            <div className="p-12 text-center text-white/30 text-lg">No chats yet</div>
          ) : (
            <table className="w-full text-base">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-4 py-3 text-white/30 font-medium">Title</th>
                  <th className="text-left px-4 py-3 text-white/30 font-medium">Messages</th>
                  <th className="text-left px-4 py-3 text-white/30 font-medium">Created</th>
                  <th className="text-left px-4 py-3 text-white/30 font-medium">Last Activity</th>
                </tr>
              </thead>
              <tbody>
                {user.chats.map((chat) => (
                  <tr key={chat.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-white/70">{chat.title}</td>
                    <td className="px-4 py-3 text-white/40">{chat._count.messages}</td>
                    <td className="px-4 py-3 text-white/30">{new Date(chat.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-white/30">{new Date(chat.updatedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Audit Tab */}
      {tab === "audit" && (
        <div className="rounded-2xl bg-[#0D1B4B]/40 border border-white/10 overflow-hidden">
          {auditLogs.length === 0 ? (
            <div className="p-12 text-center text-white/30 text-lg">No audit logs yet</div>
          ) : (
            <div className="divide-y divide-white/5">
              {auditLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 px-4 py-3">
                  <Clock size={12} className="text-white/20 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white/60 text-base">
                      <span className="font-medium text-white/80">{log.actorEmail}</span>
                      {" "}<span className="text-[#FDB02F]">{log.action}</span>
                    </p>
                    {log.details && (
                      <p className="text-white/20 text-base mt-0.5 truncate">{log.details}</p>
                    )}
                  </div>
                  <span className="text-base text-white/20 shrink-0">{new Date(log.createdAt).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="text-lg text-white/40 mb-1 block">{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-base placeholder:text-white/20 focus:outline-none focus:border-[#FDB02F]/30" />
    </div>
  );
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-lg text-white/40 mb-1 block">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-base focus:outline-none capitalize">
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-[#07123A] capitalize">{opt}</option>
        ))}
      </select>
    </div>
  );
}
