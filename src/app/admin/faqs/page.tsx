"use client";

import { useEffect, useState } from "react";
import { Plus, PenSquare, Trash2, Save, X, GripVertical } from "lucide-react";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  sortOrder: number;
  isActive: boolean;
  updatedAt: string;
}

export default function FAQsAdmin() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ question: "", answer: "", category: "General" });
  const [saving, setSaving] = useState(false);

  function loadFaqs() {
    fetch("/api/admin/faqs")
      .then((r) => r.json())
      .then((data) => { setFaqs(data.faqs || []); setLoading(false); })
      .catch(() => setLoading(false));
  }

  useEffect(() => { loadFaqs(); }, []);

  function startCreate() {
    setCreating(true);
    setEditing(null);
    setForm({ question: "", answer: "", category: "General" });
  }

  function startEdit(faq: FAQ) {
    setEditing(faq.id);
    setCreating(false);
    setForm({ question: faq.question, answer: faq.answer, category: faq.category });
  }

  function cancel() {
    setEditing(null);
    setCreating(false);
    setForm({ question: "", answer: "", category: "General" });
  }

  async function handleSave() {
    if (!form.question || !form.answer) return alert("Question and answer are required");
    setSaving(true);

    if (creating) {
      await fetch("/api/admin/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else if (editing) {
      await fetch(`/api/admin/faqs/${editing}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }

    setSaving(false);
    cancel();
    loadFaqs();
  }

  async function handleDelete(id: string, question: string) {
    if (!confirm(`Delete FAQ "${question.slice(0, 50)}..."?`)) return;
    await fetch(`/api/admin/faqs/${id}`, { method: "DELETE" });
    loadFaqs();
  }

  async function toggleActive(faq: FAQ) {
    await fetch(`/api/admin/faqs/${faq.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !faq.isActive }),
    });
    loadFaqs();
  }

  const categories = [...new Set(faqs.map((f) => f.category))];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">FAQs</h1>
          <p className="text-white/40 text-lg mt-1">Manage frequently asked questions — {faqs.length} total</p>
        </div>
        <button
          onClick={startCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#FDB02F] text-[#07123A] font-bold text-lg hover:bg-[#FDAA40] transition-colors"
        >
          <Plus size={16} /> Add FAQ
        </button>
      </div>

      {/* Create / Edit form */}
      {(creating || editing) && (
        <div className="mb-8 rounded-2xl bg-[#0D1B4B]/60 border border-[#FDB02F]/20 p-6">
          <h2 className="text-lg font-bold text-white mb-4">{creating ? "New FAQ" : "Edit FAQ"}</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-3">
                <label className="block text-white/60 text-sm mb-1">Question</label>
                <input
                  value={form.question}
                  onChange={(e) => setForm({ ...form, question: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:border-[#FDB02F]/50 focus:outline-none"
                  placeholder="What is the question?"
                />
              </div>
              <div>
                <label className="block text-white/60 text-sm mb-1">Category</label>
                <input
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:border-[#FDB02F]/50 focus:outline-none"
                  placeholder="General"
                  list="faq-categories"
                />
                <datalist id="faq-categories">
                  {categories.map((c) => <option key={c} value={c} />)}
                </datalist>
              </div>
            </div>
            <div>
              <label className="block text-white/60 text-sm mb-1">Answer</label>
              <textarea
                value={form.answer}
                onChange={(e) => setForm({ ...form, answer: e.target.value })}
                rows={5}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:border-[#FDB02F]/50 focus:outline-none resize-y"
                placeholder="Answer to the question..."
              />
            </div>
            <div className="flex gap-3">
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#FDB02F] text-[#07123A] font-bold hover:bg-[#FDAA40] disabled:opacity-50">
                <Save size={16} /> {saving ? "Saving..." : "Save"}
              </button>
              <button onClick={cancel} className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/5 text-white/60 hover:bg-white/10">
                <X size={16} /> Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-white/40">Loading...</div>
      ) : faqs.length === 0 ? (
        <div className="text-center py-20 text-white/30">No FAQs yet. Click &quot;Add FAQ&quot; to create one.</div>
      ) : (
        <div className="space-y-3">
          {faqs.map((faq) => (
            <div
              key={faq.id}
              className={`rounded-xl border p-5 transition-colors ${
                faq.isActive ? "bg-[#0D1B4B]/40 border-white/10" : "bg-[#0D1B4B]/20 border-white/5 opacity-60"
              }`}
            >
              <div className="flex items-start gap-3">
                <GripVertical size={16} className="text-white/20 mt-1 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-[#FDB02F]/10 text-[#FDB02F]">
                      {faq.category}
                    </span>
                    {!faq.isActive && (
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-500/20 text-red-400">Hidden</span>
                    )}
                  </div>
                  <h3 className="text-white font-medium mb-1">{faq.question}</h3>
                  <p className="text-white/40 text-sm line-clamp-2">{faq.answer}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => toggleActive(faq)} className="p-2 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 text-xs">
                    {faq.isActive ? "Hide" : "Show"}
                  </button>
                  <button onClick={() => startEdit(faq)} className="p-2 rounded-lg text-white/30 hover:text-[#FDB02F] hover:bg-white/5">
                    <PenSquare size={16} />
                  </button>
                  <button onClick={() => handleDelete(faq.id, faq.question)} className="p-2 rounded-lg text-white/30 hover:text-red-400 hover:bg-white/5">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
