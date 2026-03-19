"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, FileText, CheckCircle2, AlertCircle, ArrowLeft, X, Film, Loader2, ChevronDown } from "lucide-react";

const CATEGORIES = [
  { value: "AdministrativeSupervisoryAndTeaching", label: "Administrative, Supervisory & Teaching" },
  { value: "AppsAndDevices", label: "Apps & Devices" },
  { value: "Assessment", label: "Assessment" },
  { value: "BillingAndCoding", label: "Billing & Coding" },
  { value: "ChildAndAdolescentPsychiatry", label: "Child & Adolescent Psychiatry" },
  { value: "ComplexCases", label: "Complex Cases" },
  { value: "Diagnosis", label: "Diagnosis" },
  { value: "DietaryAndHerbals", label: "Dietary & Herbals" },
  { value: "DischargePlanningANDContinuityofCare", label: "Discharge Planning & Continuity of Care" },
  { value: "Documentation", label: "Documentation" },
  { value: "DrugInteractions", label: "Drug Interactions" },
  { value: "DrugSeekingBehavior", label: "Drug Seeking Behavior" },
  { value: "ERDisposition", label: "ER Disposition" },
  { value: "EducationMaterialsAndLearningResources", label: "Education Materials & Learning Resources" },
  { value: "EmergencyPsychiatry", label: "Emergency Psychiatry" },
  { value: "EthicalAndLegal", label: "Ethical & Legal" },
  { value: "FinalRecommendation", label: "Final Recommendation" },
  { value: "FollowUpAndRelapsePrevention", label: "Follow-Up & Relapse Prevention" },
  { value: "FunctionalImpairmentANDDisabilitySupport", label: "Functional Impairment & Disability Support" },
  { value: "GeneralInformation", label: "General Information" },
  { value: "GeriatricPsychiatry", label: "Geriatric Psychiatry" },
  { value: "Guidelines", label: "Guidelines" },
  { value: "InpatientPsychiatry", label: "Inpatient Psychiatry" },
  { value: "IntegratedCareAndCollaborativePsychiatry", label: "Integrated Care & Collaborative Psychiatry" },
  { value: "IsMyTreatmentRight", label: "Is My Treatment Right?" },
  { value: "LabMonitoring", label: "Lab Monitoring" },
  { value: "Letters", label: "Letters" },
  { value: "Links", label: "Links" },
  { value: "MedicalEmergenciesOnThePsychiatricUnit", label: "Medical Emergencies on the Psychiatric Unit" },
  { value: "Medication", label: "Medication" },
  { value: "MentalStatusExam", label: "Mental Status Exam" },
  { value: "MiscellaneousQuestions", label: "Miscellaneous Questions" },
  { value: "NoFDAApproved", label: "No FDA Approved" },
  { value: "OutpatientPsychiatry", label: "Outpatient Psychiatry" },
  { value: "PatientEducation", label: "Patient Education" },
  { value: "PharmacogenomicsAndPrecisionMedicine", label: "Pharmacogenomics & Precision Medicine" },
  { value: "PreAuthorization", label: "Pre-Authorization" },
  { value: "PsychiatricEvaluations", label: "Psychiatric Evaluations" },
  { value: "PsychiatricRehabilitationAndFunctionalRecovery", label: "Psychiatric Rehabilitation & Functional Recovery" },
  { value: "PsychiatricResearchTrainingAndContinuingEducation", label: "Psychiatric Research, Training & Continuing Education" },
  { value: "Psychotherapy", label: "Psychotherapy" },
  { value: "QualityAssuranceAuditAndPeerReview", label: "Quality Assurance, Audit & Peer Review" },
  { value: "Questions", label: "Questions" },
  { value: "RatingScales", label: "Rating Scales" },
  { value: "References", label: "References" },
  { value: "RiskAssessment", label: "Risk Assessment" },
  { value: "Settings", label: "Settings" },
  { value: "SideEffects", label: "Side Effects" },
  { value: "SomaticORInvasiveInterventions", label: "Somatic or Invasive Interventions" },
  { value: "SubstanceAbuseAndAddictionPsychiatry", label: "Substance Abuse & Addiction Psychiatry" },
  { value: "Summary", label: "Summary" },
  { value: "Tapering", label: "Tapering" },
  { value: "TeachingPoints", label: "Teaching Points" },
  { value: "TelepsychiatryAndDigitalPracticeStandards", label: "Telepsychiatry & Digital Practice Standards" },
  { value: "TreatmentProtocol", label: "Treatment Protocol" },
];

interface UploadResult {
  name: string;
  status: string;
  chunks?: number;
  error?: string;
}

interface JobStatus {
  jobId: string;
  status: string;
  progress: number;
  message: string;
  phase: string;
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
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function pollJobStatus(jobId: string, fileName: string) {
    setJobStatus({ jobId, status: "PENDING", progress: 0, message: "Waiting to process...", phase: "QUEUED" });

    const poll = async (): Promise<void> => {
      try {
        const res = await fetch(`/api/admin/rag/upload?jobId=${jobId}`);
        const data = await res.json();
        setJobStatus({ jobId, status: data.status, progress: data.progress || 0, message: data.message || "", phase: data.phase || "" });

        if (data.status === "COMPLETED" || data.status === "SUCCESS") {
          setResults((prev) => [...prev, { name: fileName, status: "indexed", chunks: data.total_chunks || data.chunks_processed || 0 }]);
          setJobStatus(null);
          return;
        } else if (data.status === "FAILED" || data.status === "ERROR") {
          setResults((prev) => [...prev, { name: fileName, status: "failed", error: data.message || "Processing failed" }]);
          setJobStatus(null);
          return;
        }

        await new Promise((r) => setTimeout(r, 3000));
        return poll();
      } catch {
        setResults((prev) => [...prev, { name: fileName, status: "failed", error: "Failed to check job status" }]);
        setJobStatus(null);
      }
    };

    await poll();
  }

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

    // Upload all files at once as a batch
    setProgress({ current: 0, total: files.length });

    const formData = new FormData();
    for (const file of files) {
      formData.append("file", file);
    }
    if (category) formData.append("category", category);
    if (tags) formData.append("tags", tags);

    try {
      const res = await fetch("/api/admin/rag/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (data.error) {
        setResults([{ name: `${files.length} file(s)`, status: "failed", error: data.error }]);
      } else if (data.jobId) {
        setProgress({ current: files.length, total: files.length });
        const fileNames = files.map((f) => f.name).join(", ");
        await pollJobStatus(data.jobId, fileNames);
      } else if (data.results) {
        setResults(data.results);
      }
    } catch (err) {
      setResults([{ name: `${files.length} file(s)`, status: "failed", error: err instanceof Error ? err.message : "Network error" }]);
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
              <p className="text-base text-white/30">Supported: DOCX files only</p>
              <p className="text-base text-[#FDB02F]/60">Select multiple files for bulk upload</p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".docx"
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

        {/* Upload & processing progress */}
        {uploading && progress.total > 0 && !jobStatus && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-base text-white/50">
              <span className="flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Uploading...</span>
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

        {/* Job processing status */}
        {jobStatus && (
          <div className="space-y-2 p-4 rounded-xl border border-[#FDB02F]/20 bg-[#FDB02F]/5">
            <div className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2 text-[#FDB02F]">
                <Loader2 size={16} className="animate-spin" />
                {jobStatus.phase === "QUEUED" ? "Queued for processing..." : "Processing & chunking documents..."}
              </span>
              <span className="text-white/50">{jobStatus.progress}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-[#FDB02F] rounded-full transition-all duration-500"
                style={{ width: `${Math.max(jobStatus.progress, 5)}%` }}
              />
            </div>
            <p className="text-sm text-white/40">{jobStatus.message}</p>
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
