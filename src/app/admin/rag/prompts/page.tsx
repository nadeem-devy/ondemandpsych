"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Star, Pencil } from "lucide-react";

interface RagPrompt {
  id: string;
  name: string;
  systemPrompt: string;
  temperature: number;
  model: string;
  isActive: boolean;
  createdAt: string;
}

export default function PromptManagerPage() {
  const [prompts, setPrompts] = useState<RagPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", systemPrompt: "", temperature: 0.7, model: "gpt-4", isActive: false });

  useEffect(() => { fetchPrompts(); }, []);

  async function fetchPrompts() {
    const res = await fetch("/api/admin/rag/prompts");
    const data = await res.json();
    setPrompts(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  async function handleSave() {
    if (editId) {
      await fetch(`/api/admin/rag/prompts/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else {
      await fetch("/api/admin/rag/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setShowForm(false);
    setEditId(null);
    setForm({ name: "", systemPrompt: "", temperature: 0.7, model: "gpt-4", isActive: false });
    fetchPrompts();
  }

  async function handleSetActive(id: string) {
    await fetch(`/api/admin/rag/prompts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: true }),
    });
    fetchPrompts();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this prompt?")) return;
    await fetch(`/api/admin/rag/prompts/${id}`, { method: "DELETE" });
    fetchPrompts();
  }

  function startEdit(prompt: RagPrompt) {
    setEditId(prompt.id);
    setForm({
      name: prompt.name,
      systemPrompt: prompt.systemPrompt,
      temperature: prompt.temperature,
      model: prompt.model,
      isActive: prompt.isActive,
    });
    setShowForm(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Prompt Manager</h1>
          <p className="text-base text-white/50 mt-1">Manage system prompts for RAG queries</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm({ name: "", systemPrompt: "", temperature: 0.7, model: "gpt-4", isActive: false }); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FDB02F] text-[#07123A] font-bold text-base hover:bg-[#FDB02F]/90 transition-colors"
        >
          <Plus size={18} /> New Prompt
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="p-6 rounded-xl border border-[#FDB02F]/20 bg-[#0D1B4B]/80 space-y-4">
          <h3 className="text-lg font-bold text-white">{editId ? "Edit Prompt" : "Create Prompt"}</h3>
          <div>
            <label className="block text-base font-medium text-white/70 mb-1">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Psychiatric Co-Pilot v2"
              className="w-full px-4 py-2.5 rounded-lg bg-[#0D1B4B] border border-white/10 text-white text-base placeholder:text-white/30 focus:border-[#FDB02F]/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-base font-medium text-white/70 mb-1">System Prompt</label>
            <textarea
              value={form.systemPrompt}
              onChange={(e) => setForm({ ...form, systemPrompt: e.target.value })}
              rows={8}
              placeholder="You are a psychiatric clinical co-pilot..."
              className="w-full px-4 py-3 rounded-lg bg-[#0D1B4B] border border-white/10 text-white text-base placeholder:text-white/30 focus:border-[#FDB02F]/50 focus:outline-none resize-y"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-base font-medium text-white/70 mb-1">Model</label>
              <select
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg bg-[#0D1B4B] border border-white/10 text-white text-base focus:border-[#FDB02F]/50 focus:outline-none"
              >
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-4o">GPT-4o</option>
                <option value="gpt-4o-mini">GPT-4o Mini</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              </select>
            </div>
            <div>
              <label className="block text-base font-medium text-white/70 mb-1">Temperature ({form.temperature})</label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={form.temperature}
                onChange={(e) => setForm({ ...form, temperature: parseFloat(e.target.value) })}
                className="w-full mt-2"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-base text-white/70">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="rounded"
            />
            Set as active prompt
          </label>
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={!form.name || !form.systemPrompt}
              className="px-4 py-2 rounded-lg bg-[#FDB02F] text-[#07123A] font-bold text-base disabled:opacity-50"
            >
              {editId ? "Update" : "Create"}
            </button>
            <button
              onClick={() => { setShowForm(false); setEditId(null); }}
              className="px-4 py-2 rounded-lg border border-white/10 text-white/50 text-base hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Prompts list */}
      {loading ? (
        <div className="text-center py-12 text-white/40 text-base">Loading...</div>
      ) : prompts.length === 0 ? (
        <div className="text-center py-12 text-white/40 text-base">No prompts yet. Create one to get started.</div>
      ) : (
        <div className="space-y-3">
          {prompts.map((prompt) => (
            <div
              key={prompt.id}
              className={`rounded-xl border p-4 ${prompt.isActive ? "border-[#FDB02F]/30 bg-[#FDB02F]/5" : "border-white/10 bg-[#0D1B4B]/50"}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-white">{prompt.name}</h3>
                  {prompt.isActive && (
                    <span className="px-2 py-0.5 rounded-full bg-[#FDB02F]/20 text-[#FDB02F] text-base font-medium">Active</span>
                  )}
                  <span className="text-base text-white/30">{prompt.model} · temp {prompt.temperature}</span>
                </div>
                <div className="flex items-center gap-2">
                  {!prompt.isActive && (
                    <button
                      onClick={() => handleSetActive(prompt.id)}
                      className="p-1.5 rounded-lg hover:bg-[#FDB02F]/10 text-white/40 hover:text-[#FDB02F] transition-colors"
                      title="Set as active"
                    >
                      <Star size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => startEdit(prompt)}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(prompt.id)}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p className="text-base text-white/50 line-clamp-3 whitespace-pre-wrap">{prompt.systemPrompt}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
