"use client";

import { useEffect, useState } from "react";
import { Save, CheckCircle2 } from "lucide-react";

interface Settings {
  id: string;
  retrievalLimit: number;
  chunkSize: number;
  chunkOverlap: number;
  similarityThreshold: number;
  embeddingModel: string;
  chatModel: string;
  temperature: number;
  maxTokens: number;
}

export default function RetrievalSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { fetchSettings(); }, []);

  async function fetchSettings() {
    const res = await fetch("/api/admin/rag/settings");
    const data = await res.json();
    setSettings(data);
    setLoading(false);
  }

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    await fetch("/api/admin/rag/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) return <div className="text-center py-12 text-white/40 text-base">Loading settings...</div>;
  if (!settings) return <div className="text-center py-12 text-red-400 text-base">Failed to load settings</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Retrieval Settings</h1>
        <p className="text-base text-white/50 mt-1">Configure RAG retrieval and generation parameters</p>
      </div>

      <div className="space-y-6 p-6 rounded-xl border border-white/10 bg-[#0D1B4B]/50">
        {/* Retrieval */}
        <div>
          <h3 className="text-lg font-bold text-white mb-4">Retrieval</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-base font-medium text-white/70 mb-1">Top K (Retrieval Limit)</label>
              <input
                type="number"
                min={1}
                max={20}
                value={settings.retrievalLimit}
                onChange={(e) => setSettings({ ...settings, retrievalLimit: parseInt(e.target.value) || 5 })}
                className="w-full px-4 py-2.5 rounded-lg bg-[#0D1B4B] border border-white/10 text-white text-base focus:border-[#FDB02F]/50 focus:outline-none"
              />
              <p className="text-base text-white/30 mt-1">Number of chunks to retrieve per query</p>
            </div>
            <div>
              <label className="block text-base font-medium text-white/70 mb-1">Similarity Threshold</label>
              <input
                type="number"
                min={0}
                max={1}
                step={0.05}
                value={settings.similarityThreshold}
                onChange={(e) => setSettings({ ...settings, similarityThreshold: parseFloat(e.target.value) || 0.7 })}
                className="w-full px-4 py-2.5 rounded-lg bg-[#0D1B4B] border border-white/10 text-white text-base focus:border-[#FDB02F]/50 focus:outline-none"
              />
              <p className="text-base text-white/30 mt-1">Minimum cosine similarity (0.0 - 1.0)</p>
            </div>
          </div>
        </div>

        {/* Chunking */}
        <div>
          <h3 className="text-lg font-bold text-white mb-4">Chunking</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-base font-medium text-white/70 mb-1">Chunk Size (tokens)</label>
              <input
                type="number"
                min={100}
                max={2000}
                step={50}
                value={settings.chunkSize}
                onChange={(e) => setSettings({ ...settings, chunkSize: parseInt(e.target.value) || 500 })}
                className="w-full px-4 py-2.5 rounded-lg bg-[#0D1B4B] border border-white/10 text-white text-base focus:border-[#FDB02F]/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-base font-medium text-white/70 mb-1">Chunk Overlap (tokens)</label>
              <input
                type="number"
                min={0}
                max={500}
                step={10}
                value={settings.chunkOverlap}
                onChange={(e) => setSettings({ ...settings, chunkOverlap: parseInt(e.target.value) || 50 })}
                className="w-full px-4 py-2.5 rounded-lg bg-[#0D1B4B] border border-white/10 text-white text-base focus:border-[#FDB02F]/50 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Models */}
        <div>
          <h3 className="text-lg font-bold text-white mb-4">Models</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-base font-medium text-white/70 mb-1">Embedding Model</label>
              <select
                value={settings.embeddingModel}
                onChange={(e) => setSettings({ ...settings, embeddingModel: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg bg-[#0D1B4B] border border-white/10 text-white text-base focus:border-[#FDB02F]/50 focus:outline-none"
              >
                <option value="text-embedding-3-small">text-embedding-3-small</option>
                <option value="text-embedding-3-large">text-embedding-3-large</option>
                <option value="text-embedding-ada-002">text-embedding-ada-002</option>
              </select>
            </div>
            <div>
              <label className="block text-base font-medium text-white/70 mb-1">Chat Model</label>
              <select
                value={settings.chatModel}
                onChange={(e) => setSettings({ ...settings, chatModel: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg bg-[#0D1B4B] border border-white/10 text-white text-base focus:border-[#FDB02F]/50 focus:outline-none"
              >
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-4o">GPT-4o</option>
                <option value="gpt-4o-mini">GPT-4o Mini</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              </select>
            </div>
          </div>
        </div>

        {/* Generation */}
        <div>
          <h3 className="text-lg font-bold text-white mb-4">Generation</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-base font-medium text-white/70 mb-1">Temperature ({settings.temperature})</label>
              <input
                type="range"
                min={0}
                max={2}
                step={0.1}
                value={settings.temperature}
                onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
                className="w-full mt-2"
              />
            </div>
            <div>
              <label className="block text-base font-medium text-white/70 mb-1">Max Tokens</label>
              <input
                type="number"
                min={100}
                max={8000}
                step={100}
                value={settings.maxTokens}
                onChange={(e) => setSettings({ ...settings, maxTokens: parseInt(e.target.value) || 2000 })}
                className="w-full px-4 py-2.5 rounded-lg bg-[#0D1B4B] border border-white/10 text-white text-base focus:border-[#FDB02F]/50 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#FDB02F] text-[#07123A] font-bold text-base hover:bg-[#FDB02F]/90 transition-colors disabled:opacity-50"
        >
          {saved ? <CheckCircle2 size={18} /> : <Save size={18} />}
          {saving ? "Saving..." : saved ? "Saved!" : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
