"use client";

import { useEffect, useState } from "react";
import { Plus, Save, Trash2, Mail } from "lucide-react";

interface Template {
  id: string;
  slug: string;
  name: string;
  subject: string;
  body: string;
  isActive: boolean;
}

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", subject: "", body: "" });
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ slug: "", name: "", subject: "", body: "" });

  useEffect(() => { fetchTemplates(); }, []);

  async function fetchTemplates() {
    const res = await fetch("/api/admin/email-templates");
    const data = await res.json();
    setTemplates(data.templates || []);
    setLoading(false);
  }

  async function handleCreate() {
    await fetch("/api/admin/email-templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(createForm),
    });
    setShowCreate(false);
    setCreateForm({ slug: "", name: "", subject: "", body: "" });
    fetchTemplates();
  }

  async function handleSave(id: string) {
    await fetch(`/api/admin/email-templates/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    setEditing(null);
    fetchTemplates();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this template?")) return;
    await fetch(`/api/admin/email-templates/${id}`, { method: "DELETE" });
    fetchTemplates();
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Email Templates</h1>
          <p className="text-white/40 text-sm mt-1">Manage automated email templates with {"{{variable}}"} placeholders</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FDB02F] text-[#07123A] text-xs font-bold hover:bg-[#FDAA40]">
          <Plus size={14} />
          New Template
        </button>
      </div>

      {showCreate && (
        <div className="rounded-2xl bg-[#0D1B4B]/60 border border-[#FDB02F]/20 p-6 mb-6 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Slug (e.g. welcome)" value={createForm.slug} onChange={(e) => setCreateForm({ ...createForm, slug: e.target.value })} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/20 focus:outline-none" />
            <input placeholder="Name (e.g. Welcome Email)" value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/20 focus:outline-none" />
          </div>
          <input placeholder="Subject line" value={createForm.subject} onChange={(e) => setCreateForm({ ...createForm, subject: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/20 focus:outline-none" />
          <textarea placeholder="HTML body with {{name}}, {{email}}, {{otp}} variables..." value={createForm.body} onChange={(e) => setCreateForm({ ...createForm, body: e.target.value })} rows={6} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/20 focus:outline-none resize-none font-mono" />
          <div className="flex gap-2">
            <button onClick={handleCreate} className="px-4 py-2 rounded-lg bg-[#FDB02F] text-[#07123A] text-xs font-bold">Create</button>
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-lg bg-white/5 text-white/50 text-xs">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {loading ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse" />) :
        templates.length === 0 ? <div className="text-center py-12 text-white/30">No templates. Create default templates to enable automated emails.</div> :
        templates.map((t) => (
          <div key={t.id} className="rounded-2xl bg-[#0D1B4B]/40 border border-white/10 p-5">
            {editing === t.id ? (
              <div className="space-y-3">
                <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none" />
                <input value={editForm.subject} onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none" />
                <textarea value={editForm.body} onChange={(e) => setEditForm({ ...editForm, body: e.target.value })} rows={6} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none resize-none font-mono" />
                <div className="flex gap-2">
                  <button onClick={() => handleSave(t.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#FDB02F] text-[#07123A] text-[11px] font-bold"><Save size={12} />Save</button>
                  <button onClick={() => setEditing(null)} className="px-3 py-1.5 rounded-lg bg-white/5 text-white/50 text-[11px]">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#FDB02F]/10 flex items-center justify-center mt-0.5"><Mail size={14} className="text-[#FDB02F]" /></div>
                  <div>
                    <p className="text-white text-xs font-medium">{t.name}</p>
                    <p className="text-white/30 text-[10px] font-mono">{t.slug}</p>
                    <p className="text-white/40 text-[11px] mt-1">Subject: {t.subject}</p>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => { setEditing(t.id); setEditForm({ name: t.name, subject: t.subject, body: t.body }); }} className="px-2.5 py-1.5 rounded-lg bg-white/5 text-white/50 text-[11px] hover:bg-white/10">Edit</button>
                  <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded-lg text-red-400/50 hover:text-red-400 hover:bg-red-400/10"><Trash2 size={12} /></button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
