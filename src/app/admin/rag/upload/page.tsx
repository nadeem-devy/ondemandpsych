"use client";

import { useState, useRef } from "react";
import { Upload, FileText, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";

export default function UploadDocumentPage() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [pasteText, setPasteText] = useState("");
  const [mode, setMode] = useState<"file" | "paste">("file");
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; error?: string; message?: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload() {
    setUploading(true);
    setResult(null);

    try {
      if (mode === "file" && file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("title", title || file.name);
        if (category) formData.append("category", category);
        if (tags) formData.append("tags", tags);

        const res = await fetch("/api/admin/rag/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (res.ok) {
          setResult({ success: true, message: `Document uploaded and indexed. ${data.chunksCreated ?? 0} chunks created.` });
          setFile(null);
          setTitle("");
          setCategory("");
          setTags("");
          if (fileRef.current) fileRef.current.value = "";
        } else {
          setResult({ error: data.error || data.message || "Upload failed" });
        }
      } else if (mode === "paste" && pasteText.trim()) {
        // Create a text file from pasted content
        const blob = new Blob([pasteText], { type: "text/plain" });
        const textFile = new File([blob], `${title || "pasted-content"}.txt`, { type: "text/plain" });

        const formData = new FormData();
        formData.append("file", textFile);
        formData.append("title", title || "Pasted Content");
        if (category) formData.append("category", category);
        if (tags) formData.append("tags", tags);

        const res = await fetch("/api/admin/rag/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (res.ok) {
          setResult({ success: true, message: `Content indexed. ${data.chunksCreated ?? 0} chunks created.` });
          setPasteText("");
          setTitle("");
          setCategory("");
          setTags("");
        } else {
          setResult({ error: data.error || "Upload failed" });
        }
      }
    } catch {
      setResult({ error: "Network error. Please try again." });
    }
    setUploading(false);
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <a href="/admin/rag" className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </a>
        <div>
          <h1 className="text-2xl font-bold text-white">Upload Document</h1>
          <p className="text-base text-white/50 mt-1">Add documents to the knowledge base for RAG retrieval</p>
        </div>
      </div>

      {/* Result banner */}
      {result && (
        <div className={`flex items-start gap-3 p-4 rounded-xl border ${result.success ? "border-green-500/20 bg-green-500/10" : "border-red-500/20 bg-red-500/10"}`}>
          {result.success ? <CheckCircle2 size={20} className="text-green-400 shrink-0 mt-0.5" /> : <AlertCircle size={20} className="text-red-400 shrink-0 mt-0.5" />}
          <p className={`text-base ${result.success ? "text-green-400" : "text-red-400"}`}>{result.message || result.error}</p>
        </div>
      )}

      {/* Mode toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode("file")}
          className={`px-4 py-2 rounded-lg text-base font-medium transition-colors ${mode === "file" ? "bg-[#FDB02F]/20 text-[#FDB02F] border border-[#FDB02F]/30" : "bg-[#0D1B4B] text-white/50 border border-white/10 hover:text-white"}`}
        >
          Upload File
        </button>
        <button
          onClick={() => setMode("paste")}
          className={`px-4 py-2 rounded-lg text-base font-medium transition-colors ${mode === "paste" ? "bg-[#FDB02F]/20 text-[#FDB02F] border border-[#FDB02F]/30" : "bg-[#0D1B4B] text-white/50 border border-white/10 hover:text-white"}`}
        >
          Paste Text
        </button>
      </div>

      {/* Form */}
      <div className="space-y-4 p-6 rounded-xl border border-white/10 bg-[#0D1B4B]/50">
        <div>
          <label className="block text-base font-medium text-white/70 mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Document title"
            className="w-full px-4 py-2.5 rounded-lg bg-[#0D1B4B] border border-white/10 text-white text-base placeholder:text-white/30 focus:border-[#FDB02F]/50 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-base font-medium text-white/70 mb-1">Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Pharmacology, Diagnostics"
              className="w-full px-4 py-2.5 rounded-lg bg-[#0D1B4B] border border-white/10 text-white text-base placeholder:text-white/30 focus:border-[#FDB02F]/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-base font-medium text-white/70 mb-1">Tags</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="comma-separated tags"
              className="w-full px-4 py-2.5 rounded-lg bg-[#0D1B4B] border border-white/10 text-white text-base placeholder:text-white/30 focus:border-[#FDB02F]/50 focus:outline-none"
            />
          </div>
        </div>

        {mode === "file" ? (
          <div>
            <label className="block text-base font-medium text-white/70 mb-1">File</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="flex flex-col items-center gap-3 p-8 rounded-xl border-2 border-dashed border-white/10 hover:border-[#FDB02F]/30 cursor-pointer transition-colors"
            >
              {file ? (
                <>
                  <FileText size={32} className="text-[#FDB02F]" />
                  <p className="text-base text-white">{file.name}</p>
                  <p className="text-base text-white/40">{(file.size / 1024).toFixed(1)} KB</p>
                </>
              ) : (
                <>
                  <Upload size={32} className="text-white/30" />
                  <p className="text-base text-white/50">Click to select a file</p>
                  <p className="text-base text-white/30">Supported: .txt, .md, .csv, .pdf, .docx</p>
                </>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".txt,.md,.csv,.pdf,.docx"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="hidden"
            />
          </div>
        ) : (
          <div>
            <label className="block text-base font-medium text-white/70 mb-1">Paste Content</label>
            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="Paste your text content here..."
              rows={12}
              className="w-full px-4 py-3 rounded-lg bg-[#0D1B4B] border border-white/10 text-white text-base placeholder:text-white/30 focus:border-[#FDB02F]/50 focus:outline-none resize-y"
            />
            <p className="text-base text-white/30 mt-1">{pasteText.split(/\s+/).filter(Boolean).length} words</p>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={uploading || (mode === "file" ? !file : !pasteText.trim())}
          className="w-full px-4 py-3 rounded-lg bg-[#FDB02F] text-[#07123A] font-bold text-base hover:bg-[#FDB02F]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? "Processing..." : "Upload & Index"}
        </button>
      </div>
    </div>
  );
}
