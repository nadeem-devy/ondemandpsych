"use client";

import { useEffect, useState } from "react";
import { Plus, PenSquare, Trash2, Save, X, Eye, EyeOff } from "lucide-react";

interface LegalPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  isActive: boolean;
  sortOrder: number;
  updatedAt: string;
}

export default function LegalPagesAdmin() {
  const [pages, setPages] = useState<LegalPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<LegalPage | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: "", slug: "", content: "" });
  const [saving, setSaving] = useState(false);

  function loadPages() {
    fetch("/api/admin/legal")
      .then((r) => r.json())
      .then((data) => { setPages(data.pages || []); setLoading(false); })
      .catch(() => setLoading(false));
  }

  useEffect(() => { loadPages(); }, []);

  function startCreate() {
    setCreating(true);
    setEditing(null);
    setForm({ title: "", slug: "", content: "" });
  }

  function startEdit(page: LegalPage) {
    setEditing(page);
    setCreating(false);
    setForm({ title: page.title, slug: page.slug, content: page.content });
  }

  function cancel() {
    setEditing(null);
    setCreating(false);
    setForm({ title: "", slug: "", content: "" });
  }

  async function handleSave() {
    if (!form.title || !form.slug || !form.content) return alert("All fields required");
    setSaving(true);

    if (creating) {
      await fetch("/api/admin/legal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else if (editing) {
      await fetch(`/api/admin/legal/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }

    setSaving(false);
    cancel();
    loadPages();
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    await fetch(`/api/admin/legal/${id}`, { method: "DELETE" });
    loadPages();
  }

  async function toggleActive(page: LegalPage) {
    await fetch(`/api/admin/legal/${page.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !page.isActive }),
    });
    loadPages();
  }

  function generateSlug(title: string) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  if (editing || creating) {
    return (
      <div className="">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">
            {creating ? "New Legal Page" : `Edit: ${editing?.title}`}
          </h1>
          <button onClick={cancel} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-white/60 hover:bg-white/10">
            <X size={16} /> Cancel
          </button>
        </div>

        <div className="space-y-6 max-w-5xl">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/60 text-sm mb-1">Title</label>
              <input
                value={form.title}
                onChange={(e) => {
                  setForm({ ...form, title: e.target.value, ...(creating ? { slug: generateSlug(e.target.value) } : {}) });
                }}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:border-[#FDB02F]/50 focus:outline-none"
                placeholder="Page title"
              />
            </div>
            <div>
              <label className="block text-white/60 text-sm mb-1">Slug</label>
              <input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:border-[#FDB02F]/50 focus:outline-none"
                placeholder="url-slug"
              />
            </div>
          </div>

          <div>
            <label className="block text-white/60 text-sm mb-1">Content (HTML)</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={25}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-sm focus:border-[#FDB02F]/50 focus:outline-none resize-y"
              placeholder="Page content (HTML supported)"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#FDB02F] text-[#07123A] font-bold hover:bg-[#FDAA40] disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? "Saving..." : "Save Page"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Legal Pages</h1>
          <p className="text-white/40 text-lg mt-1">Manage disclaimer, privacy, terms, and other legal pages</p>
        </div>
        <button
          onClick={startCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#FDB02F] text-[#07123A] font-bold text-lg hover:bg-[#FDAA40] transition-colors"
        >
          <Plus size={16} /> New Page
        </button>
      </div>

      {loading ? (
        <div className="text-white/40">Loading...</div>
      ) : pages.length === 0 ? (
        <div className="text-center py-20 text-white/30">No legal pages yet. Click &quot;New Page&quot; to create one.</div>
      ) : (
        <div className="rounded-2xl bg-[#0D1B4B]/40 border border-white/10 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-6 py-4 text-white/40 text-sm font-medium">Title</th>
                <th className="text-left px-6 py-4 text-white/40 text-sm font-medium">Slug</th>
                <th className="text-left px-6 py-4 text-white/40 text-sm font-medium">Status</th>
                <th className="text-left px-6 py-4 text-white/40 text-sm font-medium">Updated</th>
                <th className="text-right px-6 py-4 text-white/40 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr key={page.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-6 py-4 text-white font-medium">{page.title}</td>
                  <td className="px-6 py-4 text-white/50 text-sm font-mono">/copilot/legal/{page.slug}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${page.isActive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                      {page.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-white/40 text-sm">{new Date(page.updatedAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => toggleActive(page)} className="p-2 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5" title={page.isActive ? "Deactivate" : "Activate"}>
                        {page.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button onClick={() => startEdit(page)} className="p-2 rounded-lg text-white/30 hover:text-[#FDB02F] hover:bg-white/5">
                        <PenSquare size={16} />
                      </button>
                      <button onClick={() => handleDelete(page.id, page.title)} className="p-2 rounded-lg text-white/30 hover:text-red-400 hover:bg-white/5">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
