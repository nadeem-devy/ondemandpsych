"use client";

import { useEffect, useState } from "react";
import { FileText, Trash2, RefreshCw, Search, Eye } from "lucide-react";

interface RagDocument {
  id: string;
  title: string;
  fileType: string;
  fileUrl: string;
  fileSize: number;
  category: string | null;
  tags: string | null;
  status: string;
  pageCount: number | null;
  error: string | null;
  createdAt: string;
  _count: { chunks: number };
}

const statusColors: Record<string, string> = {
  indexed: "bg-green-500/20 text-green-400",
  processing: "bg-yellow-500/20 text-yellow-400",
  pending: "bg-blue-500/20 text-blue-400",
  failed: "bg-red-500/20 text-red-400",
};

export default function KnowledgeBasePage() {
  const [documents, setDocuments] = useState<RagDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [reindexing, setReindexing] = useState<string | null>(null);

  useEffect(() => { fetchDocuments(); }, []);

  async function fetchDocuments() {
    setLoading(true);
    const res = await fetch("/api/admin/rag/documents");
    const data = await res.json();
    setDocuments(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  async function handleReindex(id: string) {
    setReindexing(id);
    await fetch(`/api/admin/rag/documents/${id}`, { method: "POST" });
    setReindexing(null);
    fetchDocuments();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this document and all its chunks?")) return;
    await fetch(`/api/admin/rag/documents/${id}`, { method: "DELETE" });
    fetchDocuments();
  }

  const filtered = documents.filter(
    (d) =>
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      (d.category || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Knowledge Base</h1>
          <p className="text-base text-white/50 mt-1">
            {documents.length} documents indexed
          </p>
        </div>
        <a
          href="/admin/rag/upload"
          className="px-4 py-2 rounded-lg bg-[#FDB02F] text-[#07123A] font-bold text-base hover:bg-[#FDB02F]/90 transition-colors"
        >
          Upload Document
        </a>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          placeholder="Search documents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#0D1B4B] border border-white/10 text-white text-base placeholder:text-white/30 focus:border-[#FDB02F]/50 focus:outline-none"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 bg-[#0D1B4B]/50">
              <th className="text-left px-4 py-3 text-base font-semibold text-white/50">Document</th>
              <th className="text-left px-4 py-3 text-base font-semibold text-white/50">Type</th>
              <th className="text-left px-4 py-3 text-base font-semibold text-white/50">Chunks</th>
              <th className="text-left px-4 py-3 text-base font-semibold text-white/50">Status</th>
              <th className="text-left px-4 py-3 text-base font-semibold text-white/50">Date</th>
              <th className="text-right px-4 py-3 text-base font-semibold text-white/50">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-white/40 text-base">Loading...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-white/40 text-base">
                  No documents found. Upload your first document to get started.
                </td>
              </tr>
            ) : (
              filtered.map((doc) => (
                <tr key={doc.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <FileText size={18} className="text-[#FDB02F] shrink-0" />
                      <div>
                        <p className="text-base font-medium text-white">{doc.title}</p>
                        {doc.category && (
                          <p className="text-base text-white/40">{doc.category}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-base text-white/60 uppercase">{doc.fileType}</td>
                  <td className="px-4 py-3 text-base text-white/60">{doc._count.chunks}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-base font-medium ${statusColors[doc.status] || "bg-white/10 text-white/50"}`}>
                      {doc.status}
                    </span>
                    {doc.error && (
                      <p className="text-base text-red-400 mt-1 max-w-xs truncate" title={doc.error}>{doc.error}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-base text-white/40">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={`/admin/rag/chunks?documentId=${doc.id}`}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                        title="View chunks"
                      >
                        <Eye size={16} />
                      </a>
                      <button
                        onClick={() => handleReindex(doc.id)}
                        disabled={reindexing === doc.id}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-[#FDB02F] transition-colors disabled:opacity-50"
                        title="Reindex"
                      >
                        <RefreshCw size={16} className={reindexing === doc.id ? "animate-spin" : ""} />
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
