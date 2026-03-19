"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, FileText, CheckCircle2, AlertCircle, ArrowLeft, X, Film, Loader2, ChevronDown } from "lucide-react";

const CATEGORIES = [
  { value: "appsanddevices", label: "Apps & Devices" },
  { value: "assessment", label: "Assessment" },
  { value: "billingandcoding", label: "Billing & Coding" },
  { value: "childandadolescentpsychiatry", label: "Child & Adolescent Psychiatry" },
  { value: "complexcases", label: "Complex Cases" },
  { value: "diagnosis", label: "Diagnosis" },
  { value: "dietaryandherbals", label: "Dietary & Herbals" },
  { value: "dischargeplanningandcontinuityofcare", label: "Discharge Planning & Continuity of Care" },
  { value: "documentation", label: "Documentation" },
  { value: "druginteractions", label: "Drug Interactions" },
  { value: "drugseekingbehavior", label: "Drug Seeking Behavior" },
  { value: "educationmaterialsandlearningresources", label: "Education Materials & Learning Resources" },
  { value: "emergencypsychiatry", label: "Emergency Psychiatry" },
  { value: "erdisposition", label: "ER Disposition" },
  { value: "ethicalandlegal", label: "Ethical & Legal" },
  { value: "finalrecommendation", label: "Final Recommendation" },
  { value: "followupandrelapseprevention", label: "Follow-Up & Relapse Prevention" },
  { value: "functionalimpairmentanddisabilitysupport", label: "Functional Impairment & Disability Support" },
  { value: "generalinformation", label: "General Information" },
  { value: "geriatricpsychiatry", label: "Geriatric Psychiatry" },
  { value: "guidelines", label: "Guidelines" },
  { value: "inpatientpsychiatry", label: "Inpatient Psychiatry" },
  { value: "integratedcareandcollaborativepsychiatry", label: "Integrated Care & Collaborative Psychiatry" },
  { value: "ismytreatmentright", label: "Is My Treatment Right?" },
  { value: "labmonitoring", label: "Lab Monitoring" },
  { value: "letters", label: "Letters" },
  { value: "medicalemergenciesonthepsychiatricunit", label: "Medical Emergencies on the Psychiatric Unit" },
  { value: "medication", label: "Medication" },
  { value: "mentalstatusexam", label: "Mental Status Exam" },
  { value: "miscellaneousquestions", label: "Miscellaneous Questions" },
  { value: "nofdaapproved", label: "No FDA Approved" },
  { value: "outpatientpsychiatry", label: "Outpatient Psychiatry" },
  { value: "patienteducation", label: "Patient Education" },
  { value: "pharmacogenomicsandprecisionmedicine", label: "Pharmacogenomics & Precision Medicine" },
  { value: "preauthorization", label: "Pre-Authorization" },
  { value: "psychiatricevaluations", label: "Psychiatric Evaluations" },
  { value: "psychiatricrehabilitationandfunctionalrecovery", label: "Psychiatric Rehabilitation & Functional Recovery" },
  { value: "psychiatricresearchtrainingandcontinuingeducation", label: "Psychiatric Research, Training & Continuing Education" },
  { value: "psychotherapy", label: "Psychotherapy" },
  { value: "qualityassuranceauditandpeerreview", label: "Quality Assurance, Audit & Peer Review" },
  { value: "questions", label: "Questions" },
  { value: "ratingscales", label: "Rating Scales" },
  { value: "references", label: "References" },
  { value: "riskassessment", label: "Risk Assessment" },
  { value: "settings", label: "Settings" },
  { value: "sideeffects", label: "Side Effects" },
  { value: "somaticorinvasiveinterventions", label: "Somatic or Invasive Interventions" },
  { value: "substanceabuseandaddictionpsychiatry", label: "Substance Abuse & Addiction Psychiatry" },
  { value: "summary", label: "Summary" },
  { value: "tapering", label: "Tapering" },
  { value: "teachingpoints", label: "Teaching Points" },
  { value: "telepsychiatryanddigitalpracticestandards", label: "Telepsychiatry & Digital Practice Standards" },
  { value: "treatmentprotocol", label: "Treatment Protocol" },
  { value: "administrativesupervisoryandteaching", label: "Administrative, Supervisory & Teaching" },
  { value: "links", label: "Links" },
];

interface UploadResult {
  name: string;
  status: string;
  chunks?: number;
  error?: string;
}

export default function UploadDocumentPage() {
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [mode, setMode] = useState<"file" | "paste" | "video">("file");
  const [pasteTitle, setPasteTitle] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [videoTranscript, setVideoTranscript] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState<UploadResult[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...droppedFiles]);
  }, []);

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  async function handleUpload() {
    setUploading(true);
    setResults([]);

    if (mode === "video") {
      const formData = new FormData();
      formData.append("videoUrl", videoUrl);
      formData.append("videoTitle", videoTitle);
      formData.append("videoTranscript", videoTranscript);
      if (category) formData.append("category", category);
      if (tags) formData.append("tags", tags);

      const res = await fetch("/api/admin/rag/upload", { method: "POST", body: formData });
      const data = await res.json();
      setResults([{ name: videoTitle || videoUrl, status: res.ok ? "indexed" : "failed", chunks: data.chunksCreated, error: data.error }]);
      if (res.ok) { setVideoUrl(""); setVideoTitle(""); setVideoTranscript(""); }
      setUploading(false);
      return;
    }

    if (mode === "paste") {
      const blob = new Blob([pasteText], { type: "text/plain" });
      const textFile = new File([blob], `${pasteTitle || "pasted-content"}.txt`, { type: "text/plain" });
      const formData = new FormData();
      formData.append("file", textFile);
      formData.append("title", pasteTitle || "Pasted Content");
      if (category) formData.append("category", category);
      if (tags) formData.append("tags", tags);

      const res = await fetch("/api/admin/rag/upload", { method: "POST", body: formData });
      const data = await res.json();
      setResults(data.results || [{ name: pasteTitle, status: res.ok ? "indexed" : "failed", error: data.error }]);
      if (res.ok) { setPasteText(""); setPasteTitle(""); }
      setUploading(false);
      return;
    }

    // Upload files one at a time to avoid timeouts on serverless
    const allResults: UploadResult[] = [];
    setProgress({ current: 0, total: files.length });

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append("file", file);
      if (category) formData.append("category", category);
      if (tags) formData.append("tags", tags);

      try {
        const res = await fetch("/api/admin/rag/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (data.results) {
          allResults.push(...data.results);
        } else if (data.error) {
          allResults.push({ name: file.name, status: "failed", error: data.error });
        }
      } catch (err) {
        allResults.push({ name: file.name, status: "failed", error: err instanceof Error ? err.message : "Network error — function may have timed out" });
      }
      setProgress({ current: i + 1, total: files.length });
      setResults([...allResults]);
    }

    setFiles([]);
    if (fileRef.current) fileRef.current.value = "";
    setUploading(false);
  }

  const indexed = results.filter((r) => r.status === "indexed").length;
  const failed = results.filter((r) => r.status === "failed").length;
  const totalChunks = results.reduce((sum, r) => sum + (r.chunks || 0), 0);

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <a href="/admin/rag" className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </a>
        <div>
          <h1 className="text-2xl font-bold text-white">Upload Documents</h1>
          <p className="text-base text-white/50 mt-1">Upload PDFs, PPTs, DOCX, TXT, or video transcripts to the knowledge base</p>
        </div>
      </div>

      {/* Results summary */}
      {results.length > 0 && (
        <div className={`p-4 rounded-xl border ${failed > 0 && indexed === 0 ? "border-red-500/20 bg-red-500/10" : "border-green-500/20 bg-green-500/10"}`}>
          <div className="flex items-center gap-3 mb-2">
            {indexed > 0 ? <CheckCircle2 size={20} className="text-green-400" /> : <AlertCircle size={20} className="text-red-400" />}
            <p className="text-base font-bold text-white">
              {indexed} indexed, {failed} failed — {totalChunks} chunks created
            </p>
          </div>
          <div className="max-h-40 overflow-y-auto space-y-1">
            {results.map((r, i) => (
              <div key={i} className="flex items-center gap-2 text-base">
                <span className={r.status === "indexed" ? "text-green-400" : "text-red-400"}>
                  {r.status === "indexed" ? "✓" : "✗"}
                </span>
                <span className="text-white/70 truncate">{r.name}</span>
                {r.chunks && <span className="text-white/30">({r.chunks} chunks)</span>}
                {r.error && <span className="text-red-400/70 truncate">{r.error}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mode toggle */}
      <div className="flex gap-2">
        {(["file", "paste", "video"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-4 py-2 rounded-lg text-base font-medium transition-colors flex items-center gap-2 ${
              mode === m
                ? "bg-[#FDB02F]/20 text-[#FDB02F] border border-[#FDB02F]/30"
                : "bg-[#0D1B4B] text-white/50 border border-white/10 hover:text-white"
            }`}
          >
            {m === "file" && <><Upload size={16} /> Upload Files</>}
            {m === "paste" && <><FileText size={16} /> Paste Text</>}
            {m === "video" && <><Film size={16} /> Video Transcript</>}
          </button>
        ))}
      </div>

      {/* Form */}
      <div className="space-y-4 p-6 rounded-xl border border-white/10 bg-[#0D1B4B]/50">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-base font-medium text-white/70 mb-1">Category <span className="text-red-400">*</span></label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-[#0D1B4B] border border-white/10 text-white text-base focus:border-[#FDB02F]/50 focus:outline-none appearance-none cursor-pointer"
              >
                <option value="" className="bg-[#0D1B4B] text-white/30">Select a category...</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value} className="bg-[#0D1B4B] text-white">
                    {cat.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
            </div>
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

        {mode === "file" && (
          <>
            {/* Drop zone */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileRef.current?.click()}
              className={`flex flex-col items-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
                dragOver ? "border-[#FDB02F] bg-[#FDB02F]/5" : "border-white/10 hover:border-[#FDB02F]/30"
              }`}
            >
              <Upload size={32} className={dragOver ? "text-[#FDB02F]" : "text-white/30"} />
              <p className="text-base text-white/50">Drag & drop files here, or click to select</p>
              <p className="text-base text-white/30">Supported: PDF, PPTX, PPT, DOCX, DOC, XLSX, TXT, MD, CSV</p>
              <p className="text-base text-[#FDB02F]/60">Select multiple files for bulk upload</p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".txt,.md,.csv,.pdf,.docx,.doc,.pptx,.ppt,.xlsx"
              multiple
              onChange={(e) => {
                const selected = Array.from(e.target.files || []);
                setFiles((prev) => [...prev, ...selected]);
              }}
              className="hidden"
            />

            {/* File list */}
            {files.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-base font-medium text-white/70">{files.length} file(s) selected</p>
                  <button onClick={() => { setFiles([]); if (fileRef.current) fileRef.current.value = ""; }} className="text-base text-red-400 hover:text-red-300">
                    Clear all
                  </button>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-1 rounded-lg border border-white/5 p-2">
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-1.5 rounded-lg hover:bg-white/[0.03]">
                      <FileText size={14} className="text-[#FDB02F] shrink-0" />
                      <span className="text-base text-white/70 flex-1 truncate">{f.name}</span>
                      <span className="text-base text-white/30">{(f.size / 1024).toFixed(0)} KB</span>
                      <button onClick={() => removeFile(i)} className="text-white/30 hover:text-red-400">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {mode === "paste" && (
          <>
            <div>
              <label className="block text-base font-medium text-white/70 mb-1">Title</label>
              <input
                type="text"
                value={pasteTitle}
                onChange={(e) => setPasteTitle(e.target.value)}
                placeholder="Document title"
                className="w-full px-4 py-2.5 rounded-lg bg-[#0D1B4B] border border-white/10 text-white text-base placeholder:text-white/30 focus:border-[#FDB02F]/50 focus:outline-none"
              />
            </div>
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
          </>
        )}

        {mode === "video" && (
          <>
            <div>
              <label className="block text-base font-medium text-white/70 mb-1">Video Title</label>
              <input
                type="text"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                placeholder="e.g. Lecture 01 - Introduction to Psychopharmacology"
                className="w-full px-4 py-2.5 rounded-lg bg-[#0D1B4B] border border-white/10 text-white text-base placeholder:text-white/30 focus:border-[#FDB02F]/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-base font-medium text-white/70 mb-1">Video URL</label>
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-4 py-2.5 rounded-lg bg-[#0D1B4B] border border-white/10 text-white text-base placeholder:text-white/30 focus:border-[#FDB02F]/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-base font-medium text-white/70 mb-1">Video Transcript</label>
              <textarea
                value={videoTranscript}
                onChange={(e) => setVideoTranscript(e.target.value)}
                placeholder="Paste the video transcript here. You can get transcripts from YouTube (click ... → Show Transcript) or use a transcription service."
                rows={12}
                className="w-full px-4 py-3 rounded-lg bg-[#0D1B4B] border border-white/10 text-white text-base placeholder:text-white/30 focus:border-[#FDB02F]/50 focus:outline-none resize-y"
              />
              <p className="text-base text-white/30 mt-1">{videoTranscript.split(/\s+/).filter(Boolean).length} words</p>
            </div>
          </>
        )}

        {/* Upload progress */}
        {uploading && progress.total > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-base text-white/50">
              <span className="flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Processing...</span>
              <span>{progress.current} / {progress.total}</span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-[#FDB02F] rounded-full transition-all duration-300"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={
            uploading || !category ||
            (mode === "file" ? files.length === 0 : mode === "paste" ? !pasteText.trim() : !videoTranscript.trim())
          }
          className="w-full px-4 py-3 rounded-lg bg-[#FDB02F] text-[#07123A] font-bold text-base hover:bg-[#FDB02F]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {uploading ? (
            <><Loader2 size={18} className="animate-spin" /> Processing {progress.current}/{progress.total || "..."}...</>
          ) : mode === "file" ? (
            `Upload & Index ${files.length} File${files.length !== 1 ? "s" : ""}`
          ) : mode === "video" ? (
            "Index Video Transcript"
          ) : (
            "Upload & Index"
          )}
        </button>
      </div>
    </div>
  );
}
