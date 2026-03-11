"use client";

import { useEffect, useState } from "react";
import { Plus, FileText, Film, Image, File, Trash2, Search } from "lucide-react";

interface ContentItem {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  tags: string | null;
  category: string | null;
  version: number;
  accessPlans: string;
  uploadedBy: string;
  createdAt: string;
}

const typeIcons: Record<string, typeof FileText> = { pdf: FileText, docx: FileText, video: Film, image: Image };

export default function ContentLibraryPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", fileUrl: "", fileType: "pdf", tags: "", category: "", accessPlans: "all" });

  useEffect(() => { fetchItems(); }, []);

  async function fetchItems() {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    const res = await fetch(`/api/admin/content-library?${params}`);
    const data = await res.json();
    setItems(data.items || []);
    setLoading(false);
  }

  async function handleCreate() {
    await fetch("/api/admin/content-library", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setShowCreate(false);
    setForm({ title: "", description: "", fileUrl: "", fileType: "pdf", tags: "", category: "", accessPlans: "all" });
    fetchItems();
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this content?")) return;
    await fetch(`/api/admin/content-library/${id}`, { method: "DELETE" });
    fetchItems();
  }

  useEffect(() => { if (!loading) fetchItems(); }, [search]);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Content Library</h1>
          <p className="text-white/40 text-sm mt-1">Manage PDFs, documents, videos, and resources</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FDB02F] text-[#07123A] text-lg font-bold hover:bg-[#FDAA40]">
          <Plus size={14} />
          Add Content
        </button>
      </div>

      {showCreate && (
        <div className="rounded-2xl bg-[#0D1B4B]/60 border border-[#FDB02F]/20 p-6 mb-6 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-lg placeholder:text-white/20 focus:outline-none" />
            <input placeholder="File URL" value={form.fileUrl} onChange={(e) => setForm({ ...form, fileUrl: e.target.value })} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-lg placeholder:text-white/20 focus:outline-none" />
            <select value={form.fileType} onChange={(e) => setForm({ ...form, fileType: e.target.value })} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 text-lg focus:outline-none">
              <option value="pdf">PDF</option><option value="docx">Word Doc</option><option value="video">Video</option><option value="image">Image</option>
            </select>
            <input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-lg placeholder:text-white/20 focus:outline-none" />
            <input placeholder="Tags (comma-separated)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-lg placeholder:text-white/20 focus:outline-none" />
            <select value={form.accessPlans} onChange={(e) => setForm({ ...form, accessPlans: e.target.value })} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 text-lg focus:outline-none">
              <option value="all">All Plans</option><option value="basic,professional,enterprise">Basic+</option><option value="professional,enterprise">Professional+</option><option value="enterprise">Enterprise Only</option>
            </select>
          </div>
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-lg placeholder:text-white/20 focus:outline-none resize-none" />
          <div className="flex gap-2">
            <button onClick={handleCreate} className="px-4 py-2 rounded-lg bg-[#FDB02F] text-[#07123A] text-lg font-bold">Add</button>
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-lg bg-white/5 text-white/50 text-lg">Cancel</button>
          </div>
        </div>
      )}

      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input type="text" placeholder="Search content..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-lg placeholder:text-white/25 focus:outline-none" />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse" />) :
        items.length === 0 ? <div className="col-span-3 text-center py-12 text-white/30">No content. Click "Add Content" to upload.</div> :
        items.map((item) => {
          const Icon = typeIcons[item.fileType] || File;
          return (
            <div key={item.id} className="rounded-2xl bg-[#0D1B4B]/40 border border-white/10 p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FDB02F]/10 flex items-center justify-center"><Icon size={16} className="text-[#FDB02F]" /></div>
                  <div>
                    <p className="text-white text-lg font-medium">{item.title}</p>
                    <p className="text-white/25 text-base">{item.fileType.toUpperCase()} • v{item.version} • {item.accessPlans}</p>
                  </div>
                </div>
                <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg text-red-400/40 hover:text-red-400 hover:bg-red-400/10"><Trash2 size={12} /></button>
              </div>
              {item.description && <p className="text-white/30 text-lg mt-2">{item.description}</p>}
              {item.tags && <div className="flex flex-wrap gap-1 mt-2">{item.tags.split(",").map((t) => <span key={t} className="px-1.5 py-0.5 rounded text-base bg-white/5 text-white/30">{t.trim()}</span>)}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
