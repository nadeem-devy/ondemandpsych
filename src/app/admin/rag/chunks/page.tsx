"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Trash2, Save, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";

interface Chunk {
  id: string;
  documentId: string;
  content: string;
  chunkIndex: number;
  tokenCount: number;
  createdAt: string;
  document: { title: string };
}

export default function ChunkManagerPageWrapper() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-white/40 text-base">Loading...</div>}>
      <ChunkManagerPage />
    </Suspense>
  );
}

function ChunkManagerPage() {
  const searchParams = useSearchParams();
  const documentId = searchParams.get("documentId");

  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchChunks(); }, [page, documentId]);

  async function fetchChunks() {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (documentId) params.set("documentId", documentId);
    const res = await fetch(`/api/admin/rag/chunks?${params}`);
    const data = await res.json();
    setChunks(data.chunks || []);
    setTotal(data.total || 0);
    setTotalPages(data.totalPages || 1);
    setLoading(false);
  }

  async function handleSave(id: string) {
    setSaving(true);
    await fetch("/api/admin/rag/chunks", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, content: editContent }),
    });
    setSaving(false);
    setEditingId(null);
    fetchChunks();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this chunk?")) return;
    await fetch("/api/admin/rag/chunks", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchChunks();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <a href="/admin/rag" className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </a>
        <div>
          <h1 className="text-2xl font-bold text-white">Chunk Manager</h1>
          <p className="text-base text-white/50 mt-1">
            {total} chunks {documentId ? "(filtered by document)" : "total"}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-white/40 text-base">Loading chunks...</div>
      ) : chunks.length === 0 ? (
        <div className="text-center py-12 text-white/40 text-base">No chunks found. Upload documents first.</div>
      ) : (
        <div className="space-y-3">
          {chunks.map((chunk) => (
            <div key={chunk.id} className="rounded-xl border border-white/10 bg-[#0D1B4B]/50 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-base font-mono text-[#FDB02F]">#{chunk.chunkIndex}</span>
                  <span className="text-base text-white/40">{chunk.document.title}</span>
                  <span className="text-base text-white/30">{chunk.tokenCount} tokens</span>
                </div>
                <div className="flex items-center gap-2">
                  {editingId === chunk.id ? (
                    <button
                      onClick={() => handleSave(chunk.id)}
                      disabled={saving}
                      className="p-1.5 rounded-lg hover:bg-green-500/10 text-green-400 transition-colors disabled:opacity-50"
                      title="Save & re-embed"
                    >
                      <Save size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={() => { setEditingId(chunk.id); setEditContent(chunk.content); }}
                      className="px-2 py-1 rounded text-base text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(chunk.id)}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              {editingId === chunk.id ? (
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 rounded-lg bg-[#07123A] border border-[#FDB02F]/30 text-white text-base focus:outline-none resize-y"
                />
              ) : (
                <p className="text-base text-white/60 leading-relaxed whitespace-pre-wrap line-clamp-4">
                  {chunk.content}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="p-2 rounded-lg hover:bg-white/10 text-white/40 disabled:opacity-30"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-base text-white/50">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="p-2 rounded-lg hover:bg-white/10 text-white/40 disabled:opacity-30"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
