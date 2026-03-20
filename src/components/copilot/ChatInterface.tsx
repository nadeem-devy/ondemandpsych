"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import DOMPurify from "dompurify";
import { useTheme } from "@/components/copilot/ThemeProvider";
import {
  Send,
  BrainCircuit,
  Stethoscope,
  Shield,
  FileText,
  Pill,
  Sparkles,
  User,
  Copy,
  Check,
  Download,
  HelpCircle,
  Mic,
  MicOff,
  Paperclip,
  X,
  Loader2,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

interface ChatInterfaceProps {
  chatId: string | null;
  messages: Message[];
  onSendMessage: (content: string) => Promise<void>;
  loading: boolean;
  userName?: string;
  userAvatar?: string | null;
}

const promptSuggestions = [
  {
    icon: Stethoscope,
    title: "Diagnostic Reasoning",
    prompt: "Help me with differential diagnosis for a patient presenting with auditory hallucinations, social withdrawal, and flat affect.",
  },
  {
    icon: Pill,
    title: "Medication Review",
    prompt: "Review medication interactions for a patient currently taking lithium 900mg, sertraline 100mg, and clonazepam 0.5mg BID.",
  },
  {
    icon: Shield,
    title: "Risk Assessment",
    prompt: "Guide me through a structured psychiatric risk assessment for a 17-year-old with suicidal ideation and recent self-harm.",
  },
  {
    icon: FileText,
    title: "ER Disposition",
    prompt: "Generate an ER disposition report for a 34-year-old male brought in by police with acute psychosis, agitation, and methamphetamine use.",
  },
  {
    icon: BrainCircuit,
    title: "Treatment Plan",
    prompt: "Create a comprehensive treatment plan for a 12-year-old with treatment-resistant OCD (Y-BOCS 28) and comorbid ADHD.",
  },
  {
    icon: Pill,
    title: "Drug Interactions",
    prompt: "Evaluate potential drug interactions and safety concerns for combining clozapine with valproate and metformin in a 45-year-old patient.",
  },
];

export function ChatInterface({ chatId, messages, onSendMessage, loading, userName, userAvatar }: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [refsOpenId, setRefsOpenId] = useState<string | null>(null);
  const [attachedFile, setAttachedFile] = useState<{ name: string; text: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Track new assistant messages synchronously during render (not in useEffect)
  const hasMountedRef = useRef(false);
  const seenIdsRef = useRef<Set<string>>(new Set());
  const animateIds = new Set<string>();

  if (hasMountedRef.current) {
    const last = messages[messages.length - 1];
    if (last?.role === "assistant" && !seenIdsRef.current.has(last.id)) {
      animateIds.add(last.id);
    }
  }

  useEffect(() => {
    messages.forEach((m) => seenIdsRef.current.add(m.id));
    hasMountedRef.current = true;
  }, [messages]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
    // Also scroll after a short delay for long content that renders after layout
    const t = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(t);
  }, [messages, loading, scrollToBottom]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + "px";
    }
  }, [input]);

  async function handleAttachFile(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/copilot/extract", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to extract text");
        return;
      }
      setAttachedFile({ name: data.fileName, text: data.text });
    } catch {
      alert("Failed to upload document");
    } finally {
      setUploading(false);
    }
  }

  async function handleSend() {
    if ((!input.trim() && !attachedFile) || loading) return;
    let msg = input.trim();
    if (attachedFile) {
      const docContext = `[UPLOADED DOCUMENT: "${attachedFile.name}"]\n\n${attachedFile.text}\n\n[END OF DOCUMENT]\n\n`;
      msg = msg ? docContext + msg : docContext + "Please analyze and summarize this document.";
      setAttachedFile(null);
    }
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    await onSendMessage(msg);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const handleCopy = useCallback((id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const handleExport = useCallback((content: string, format: "txt" | "md") => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clinical-report-${new Date().toISOString().slice(0, 10)}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const handleExportPdf = useCallback(async (content: string) => {
    // Sanitize content first with DOMPurify (same as renderSafeHtml)
    const rawHtml = markdownToHtml(content);
    const sanitizedHtml = DOMPurify.sanitize(rawHtml, {
      ALLOWED_TAGS: [
        "strong", "em", "ul", "ol", "li", "p", "br", "h1", "h2", "h3", "h4",
        "table", "thead", "tbody", "tr", "th", "td", "blockquote", "hr",
        "span", "div", "code", "a",
      ],
      ALLOWED_ATTR: ["class", "href", "target", "rel"],
    });

    // Convert logo to base64 data URI so it works in Blob URL context
    let logoDataUri = "";
    try {
      const logoRes = await fetch("/logo.webp");
      const logoBlob = await logoRes.blob();
      logoDataUri = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(logoBlob);
      });
    } catch { /* fallback: no logo */ }

    // Build PDF-ready HTML string (all content is DOMPurify-sanitized)
    const dateStr = new Date().toISOString().slice(0, 10);
    const fullDateStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

    const pdfHtml = [
      "<!DOCTYPE html><html><head>",
      `<title>Clinical Report - ${dateStr}</title>`,
      "<style>",
      "@page { margin: 0.75in; size: letter; }",
      "* { box-sizing: border-box; }",
      "body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1a1a2e; line-height: 1.6; padding: 0; margin: 0; }",
      ".pdf-header { background: linear-gradient(135deg, #07123A, #0d1f5c); color: white; padding: 24px 32px; margin-bottom: 24px; }",
      ".pdf-header-title { margin: 0 0 4px 0; font-size: 22px; letter-spacing: 0.5px; }",
      ".pdf-header-sub { margin: 0; font-size: 12px; opacity: 0.8; }",
      ".gold { color: #FDB02F; }",
      ".pdf-content { padding: 0 8px; }",
      "h1, h2, h3, h4 { color: #07123A; margin-top: 20px; margin-bottom: 8px; }",
      "h1 { font-size: 20px; border-bottom: 2px solid #FDB02F; padding-bottom: 6px; }",
      "h2 { font-size: 17px; background: linear-gradient(90deg, #f0f4ff, transparent); padding: 8px 12px; border-left: 3px solid #FDB02F; border-radius: 4px; }",
      "h3 { font-size: 15px; color: #2d3a6e; }",
      "h4 { font-size: 14px; color: #3d4a7e; font-weight: 600; }",
      "p, li { font-size: 13px; margin: 4px 0; }",
      "ul, ol { padding-left: 20px; margin: 6px 0; }",
      "table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 12px; }",
      "th { background: #07123A; color: white; padding: 8px 10px; text-align: left; font-weight: 600; }",
      "td { padding: 7px 10px; border-bottom: 1px solid #e0e0e0; }",
      "tr:nth-child(even) td { background: #f8f9fc; }",
      "blockquote { margin: 12px 0; padding: 10px 16px; background: #fff3f3; border-left: 3px solid #e74c3c; font-size: 12px; color: #7a1a1a; border-radius: 4px; }",
      "hr { border: none; height: 1px; background: linear-gradient(90deg, #FDB02F33, #FDB02F, #FDB02F33); margin: 16px 0; }",
      "code { background: #f0f0f0; padding: 1px 5px; border-radius: 3px; font-size: 12px; }",
      ".copilot-disclaimer { background: #fff3f3; border-left: 3px solid #e74c3c; padding: 10px 14px; margin: 12px 0; border-radius: 4px; font-size: 12px; color: #7a1a1a; }",
      ".copilot-time-note { background: #f0fdf4; border-left: 3px solid #22c55e; padding: 10px 14px; margin: 12px 0; border-radius: 4px; font-size: 12px; }",
      ".copilot-resources { background: #f5f3ff; border-left: 3px solid #7c3aed; padding: 10px 14px; margin: 12px 0; border-radius: 4px; font-size: 12px; }",
      ".copilot-prompts { background: #fffbeb; border-left: 3px solid #FDB02F; padding: 10px 14px; margin: 12px 0; border-radius: 4px; font-size: 12px; }",
      ".pdf-footer { margin-top: 32px; padding: 16px 0; border-top: 1px solid #e0e0e0; font-size: 11px; color: #888; text-align: center; }",
      "@media print { .no-print { display: none !important; } }",
      "</style></head><body>",
      '<div class="no-print" style="text-align:center;padding:20px;">',
      '<button onclick="window.print()" style="background:#07123A;color:white;border:none;padding:12px 32px;border-radius:8px;font-size:15px;cursor:pointer;">Save as PDF</button>',
      "</div>",
      '<div class="pdf-header">',
      '<div style="display:flex;align-items:center;gap:16px;">',
      `<img src="${logoDataUri}" alt="OnDemandPsych" style="width:50px;height:50px;border-radius:10px;" />`,
      '<div>',
      '<h1 class="pdf-header-title">OnDemand<span class="gold">Psych</span> Clinical Co-Pilot</h1>',
      '<p class="pdf-header-sub">Clinical Decision Support Report</p>',
      '</div></div>',
      "</div>",
      '<div class="pdf-content">',
      sanitizedHtml,
      "</div>",
      '<div class="pdf-footer">',
      `Generated by OnDemandPsych Clinical Co-Pilot | ${fullDateStr} | For licensed healthcare providers only. Not medical advice.`,
      "</div>",
      "</body></html>",
    ].join("\n");

    // Open new window and write the PDF-ready page using Blob URL (avoids document.write)
    const blob = new Blob([pdfHtml], { type: "text/html" });
    const blobUrl = URL.createObjectURL(blob);
    const printWindow = window.open(blobUrl, "_blank");
    if (printWindow) {
      printWindow.onload = () => {
        URL.revokeObjectURL(blobUrl);
        setTimeout(() => printWindow.print(), 300);
      };
    }
  }, []);

  // Extract optional prompts/follow-up questions from message content
  function extractPrompts(text: string): { content: string; prompts: string[]; references: string[] } {
    const prompts: string[] = [];
    const references: string[] = [];

    // Extract Knowledge Base References section (handle optional newlines before ---)
    let cleanText = text.replace(
      /\n*---\n+📄\s*\*\*Knowledge Base References:\*\*\n((?:\d+\.\s*.+\n?)*)/g,
      (_match, items: string) => {
        items.trim().split("\n").forEach((line: string) => {
          const ref = line.replace(/^\d+\.\s*/, "").trim();
          if (ref) references.push(ref);
        });
        return "";
      }
    );

    // Match "OPTIONAL PROMPTS" section
    const optionalSection = cleanText.match(/\*\*OPTIONAL PROMPTS\*\*\n((?:[-•]\s*.+\n?)*)/);
    if (optionalSection) {
      const items = optionalSection[1].trim().split("\n")
        .map((line) => line.replace(/^[-•]\s*/, "").trim())
        .filter(Boolean);
      prompts.push(...items);
      cleanText = cleanText.replace(optionalSection[0], "");
    }

    // Catch standalone follow-up question lines at the end
    const lines = cleanText.split("\n");
    const mainLines: string[] = [];
    let foundPrompts = false;
    for (let i = lines.length - 1; i >= 0; i--) {
      // Strip bullets, numbers, bold markers, and whitespace from start/end
      const trimmed = lines[i].replace(/^[-•*\d.)\s]+/, "").replace(/\*+\s*$/g, "").replace(/\s{2,}$/g, "").trim();
      if (
        trimmed.startsWith("Would you like") ||
        trimmed.startsWith("Do you want") ||
        trimmed.startsWith("What additional") ||
        trimmed.startsWith("Do you need") ||
        trimmed.startsWith("Shall I") ||
        trimmed.startsWith("Can I") ||
        trimmed.startsWith("Should I") ||
        (trimmed.endsWith("?") && prompts.length > 0)
      ) {
        prompts.unshift(trimmed);
        foundPrompts = true;
      } else if (foundPrompts && (trimmed === "" || trimmed === "---")) {
        // Skip blank lines and horizontal rules between content and questions
        continue;
      } else {
        mainLines.unshift(...lines.slice(0, i + 1));
        break;
      }
    }
    return { content: mainLines.join("\n"), prompts, references };
  }

  function renderSafeHtml(text: string) {
    const html = markdownToHtml(text);
    const clean = DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        "strong", "em", "ul", "ol", "li", "p", "br", "h1", "h2", "h3", "h4",
        "table", "thead", "tbody", "tr", "th", "td", "blockquote", "hr",
        "span", "div", "code", "a",
      ],
      ALLOWED_ATTR: ["class", "href", "target", "rel"],
    });
    return { __html: clean };
  }

  // Empty state
  if (!chatId || messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden mb-4 sm:mb-6">
            <img src="/logo.webp" alt="OnDemandPsych" className="w-full h-full object-cover" />
          </div>
          <h2 className={`text-xl sm:text-2xl font-bold font-[var(--font-syne)] mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
            Clinical Co-Pilot
          </h2>
          <p className={`text-base sm:text-lg text-center max-w-md mb-6 sm:mb-10 ${isDark ? "text-white/40" : "text-gray-500"}`}>
            Your psychiatry-specific clinical decision support. Ask about diagnosis,
            medication management, risk assessment, or documentation.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 w-full max-w-3xl">
            {promptSuggestions.map((s) => (
              <button
                key={s.title}
                onClick={() => {
                  setInput(s.prompt);
                  textareaRef.current?.focus();
                }}
                className={`text-left p-3 sm:p-4 rounded-xl border transition-all group ${
                  isDark
                    ? "border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10"
                    : "border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300"
                }`}
              >
                <s.icon size={18} className="text-[#FDB02F]/60 mb-1.5 sm:mb-2 group-hover:text-[#FDB02F] transition-colors" />
                <p className={`text-base sm:text-lg font-medium ${isDark ? "text-white/70" : "text-gray-700"}`}>{s.title}</p>
                <p className={`text-base sm:text-base mt-1 line-clamp-2 ${isDark ? "text-white/25" : "text-gray-400"}`}>{s.prompt}</p>
              </button>
            ))}
          </div>
        </div>

        <ChatInput
          ref={textareaRef}
          input={input}
          setInput={setInput}
          onKeyDown={handleKeyDown}
          onSend={handleSend}
          loading={loading}
          placeholder="Describe your clinical question..."
          attachedFile={attachedFile}
          onAttachFile={handleAttachFile}
          onRemoveFile={() => setAttachedFile(null)}
          uploading={uploading}
        />
      </div>
    );
  }

  // Messages view
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="max-w-6xl mx-auto py-4 sm:py-6 px-3 sm:px-4 space-y-4 sm:space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-2 sm:gap-4 ${msg.role === "user" ? "justify-end" : ""}`}>
              {msg.role === "assistant" && (
                <div className="shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-xl overflow-hidden mt-1">
                  <img src="/logo.webp" alt="Co-Pilot" className="w-full h-full object-cover" />
                </div>
              )}
              <div className={`flex-1 min-w-0 ${msg.role === "user" ? "max-w-[85%] sm:max-w-[75%]" : ""}`}>
                <div
                  className={`rounded-2xl px-3 py-3 sm:px-5 sm:py-4 leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[#FDB02F] text-[#07123A]"
                      : "bg-[#fae5d0] text-[#1a1a2e] shadow-sm"
                  }`}
                  style={{ fontSize: "var(--copilot-font-size, 16px)" }}
                >
                  {msg.role === "assistant" ? (
                    (() => {
                      const { content: mainContent, prompts, references } = extractPrompts(msg.content);
                      return (
                        <>
                          <TypingMessage
                            content={mainContent}
                            renderHtml={renderSafeHtml}
                            isNew={animateIds.has(msg.id)}
                            onScroll={scrollToBottom}
                          />

                          {/* References hidden */}

                          {/* Follow-up Questions — Animated Tiles */}
                          {prompts.length > 0 && (
                            <div className="mt-5 space-y-3">
                              <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-white/30" : "text-gray-400"}`}>
                                Suggested Follow-ups
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {prompts.map((prompt, i) => (
                                  <button
                                    key={i}
                                    onClick={() => {
                                      onSendMessage(prompt);
                                    }}
                                    className="group relative text-left rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                                    style={{ animationDelay: `${i * 80}ms` }}
                                  >
                                    {/* Animated gradient border */}
                                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#FDB02F]/40 via-[#FDB02F]/10 to-[#FDB02F]/40 opacity-60 group-hover:opacity-100 transition-opacity duration-300 animate-[borderShimmer_3s_ease-in-out_infinite]" />
                                    <div className={`relative m-[1.5px] rounded-[10px] px-4 py-3 flex items-start gap-3 ${
                                      isDark
                                        ? "bg-[#1a1520] group-hover:bg-[#221d28]"
                                        : "bg-white group-hover:bg-[#fffdf8]"
                                    }`}>
                                      <div className="shrink-0 mt-0.5 w-6 h-6 rounded-lg bg-gradient-to-br from-[#FDB02F]/20 to-[#FDB02F]/5 flex items-center justify-center group-hover:from-[#FDB02F]/30 group-hover:to-[#FDB02F]/15 transition-all duration-300">
                                        <Sparkles size={12} className="text-[#FDB02F]/70 group-hover:text-[#FDB02F] transition-colors duration-300" />
                                      </div>
                                      <span className={`text-sm leading-snug ${
                                        isDark
                                          ? "text-white/60 group-hover:text-white/90"
                                          : "text-gray-600 group-hover:text-gray-900"
                                      } transition-colors duration-300`}>
                                        {prompt}
                                      </span>
                                      <Send size={12} className={`shrink-0 mt-1 opacity-0 group-hover:opacity-60 transition-all duration-300 translate-x-[-4px] group-hover:translate-x-0 ${
                                        isDark ? "text-[#FDB02F]" : "text-[#FDB02F]"
                                      }`} />
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>

                {/* Action buttons for assistant messages — right aligned */}
                {msg.role === "assistant" && (
                  <div className="flex items-center justify-end gap-1 mt-1.5 sm:mt-2 relative">
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors text-gray-400 hover:text-gray-600 hover:bg-gray-200/50"
                      title="Copy"
                    >
                      {copiedId === msg.id ? (
                        <Check size={14} className="text-green-500" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                    {(() => {
                      const { references: msgRefs } = extractPrompts(msg.content);
                      return msgRefs.length > 0 ? (
                        <div className="relative">
                          <button
                            onClick={() => setRefsOpenId(refsOpenId === msg.id ? null : msg.id)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors text-gray-400 hover:text-gray-600 hover:bg-gray-200/50"
                            title="View References"
                          >
                            <HelpCircle size={14} />
                          </button>
                          {refsOpenId === msg.id && (
                            <div className="absolute bottom-full right-0 mb-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                              <div className="flex items-center justify-between mb-3">
                                <p className="text-sm font-bold text-[#1a1a2e]">Knowledge Base References</p>
                                <button
                                  onClick={() => setRefsOpenId(null)}
                                  className="text-gray-400 hover:text-gray-600 p-0.5 rounded"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                              <ul className="space-y-2">
                                {msgRefs.map((ref, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                    <FileText size={14} className="shrink-0 mt-0.5 text-[#FDB02F]" />
                                    <span>{ref.replace(/\.docx$/i, "").replace(/_/g, " ")}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}
              </div>
              {msg.role === "user" && (
                <div className="shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-xl overflow-hidden mt-1">
                  {userAvatar ? (
                    <img src={userAvatar} alt={userName || "User"} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <div className={`w-full h-full rounded-xl flex items-center justify-center text-xs font-bold ${
                      isDark ? "bg-[#FDB02F]/20 text-[#FDB02F]" : "bg-[#07123A]/10 text-[#07123A]"
                    }`}>
                      {userName ? userName.charAt(0).toUpperCase() : "U"}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {loading && <ClinicalLoadingIndicator isDark={isDark} />}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <ChatInput
        ref={textareaRef}
        input={input}
        setInput={setInput}
        onKeyDown={handleKeyDown}
        onSend={handleSend}
        loading={loading}
        placeholder="Ask a follow-up question..."
        attachedFile={attachedFile}
        onAttachFile={handleAttachFile}
        onRemoveFile={() => setAttachedFile(null)}
        uploading={uploading}
      />
    </div>
  );
}

// Typing effect for assistant messages
function TypingMessage({
  content,
  renderHtml,
  isNew,
  onScroll,
}: {
  content: string;
  renderHtml: (text: string) => { __html: string };
  isNew: boolean;
  onScroll?: () => void;
}) {
  const [displayedContent, setDisplayedContent] = useState(isNew ? "" : content);
  const [isTyping, setIsTyping] = useState(isNew);
  const hasAnimated = useRef(!isNew);

  useEffect(() => {
    if (hasAnimated.current) {
      setDisplayedContent(content);
      return;
    }

    hasAnimated.current = true;
    let charIndex = 0;
    const totalChars = content.length;
    // Reveal speed: ~2 seconds for the whole message
    const charsPerTick = Math.max(8, Math.floor(totalChars / 100));

    let scrollTick = 0;
    const interval = setInterval(() => {
      charIndex += charsPerTick;
      if (charIndex >= totalChars) {
        setDisplayedContent(content);
        setIsTyping(false);
        clearInterval(interval);
        onScroll?.();
      } else {
        setDisplayedContent(content.slice(0, charIndex));
        // Scroll every ~10 ticks to follow the typing
        if (++scrollTick % 10 === 0) onScroll?.();
      }
    }, 16);

    return () => clearInterval(interval);
  }, [content]);

  return (
    <div
      className={`copilot-message ${isTyping ? "typing-active" : ""}`}
      dangerouslySetInnerHTML={renderHtml(displayedContent)}
    />
  );
}

// Clinical loading indicator with rotating medical status words
const clinicalLoadingSteps = [
  { text: "Receiving query...", icon: "🔍" },
  { text: "Searching knowledge base...", icon: "📚" },
  { text: "Retrieving clinical evidence...", icon: "🧬" },
  { text: "Analyzing differential diagnosis...", icon: "🧠" },
  { text: "Reviewing pharmacotherapy...", icon: "💊" },
  { text: "Assessing risk factors...", icon: "🛡️" },
  { text: "Cross-referencing DSM-5-TR...", icon: "📋" },
  { text: "Formulating treatment plan...", icon: "📝" },
  { text: "Compiling clinical report...", icon: "📊" },
  { text: "Finalizing recommendations...", icon: "✅" },
];

function ClinicalLoadingIndicator({ isDark }: { isDark: boolean }) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % clinicalLoadingSteps.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const step = clinicalLoadingSteps[stepIndex];

  return (
    <div className="flex gap-3 sm:gap-4">
      <div className="shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-xl overflow-hidden mt-1 animate-pulse">
        <img src="/logo.webp" alt="Co-Pilot" className="w-full h-full object-cover" />
      </div>
      <div className={`flex-1 rounded-2xl px-4 py-3 sm:px-5 sm:py-4 ${isDark ? "bg-white/[0.04] border border-white/5" : "bg-[#fae5d0] border border-[#d9c4a8] shadow-sm"}`}>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#FDB02F] animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-1.5 h-1.5 rounded-full bg-[#FDB02F] animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-1.5 h-1.5 rounded-full bg-[#FDB02F] animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
          <span
            key={stepIndex}
            className={`text-sm font-medium transition-opacity duration-300 ${isDark ? "text-white/50" : "text-gray-500"}`}
            style={{ animation: "fadeInUp 0.4s ease-out" }}
          >
            {step.icon} {step.text}
          </span>
        </div>
        <div className={`mt-2 h-1 rounded-full overflow-hidden ${isDark ? "bg-white/5" : "bg-gray-100"}`}>
          <div
            className="h-full bg-gradient-to-r from-[#FDB02F]/60 to-[#FDB02F] rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${((stepIndex + 1) / clinicalLoadingSteps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// Extracted input component
import { forwardRef } from "react";

const ChatInput = forwardRef<
  HTMLTextAreaElement,
  {
    input: string;
    setInput: (v: string) => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
    onSend: () => void;
    loading: boolean;
    placeholder: string;
    attachedFile: { name: string; text: string } | null;
    onAttachFile: (file: File) => void;
    onRemoveFile: () => void;
    uploading: boolean;
  }
>(function ChatInput({ input, setInput, onKeyDown, onSend, loading, placeholder, attachedFile, onAttachFile, onRemoveFile, uploading }, ref) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  function toggleTranscribe() {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    let finalTranscript = input ? input + " " : "";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interim = transcript;
        }
      }
      const text = (finalTranscript + interim).trim();
      setInput(text);
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  }

  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onAttachFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className={`shrink-0 p-3 sm:p-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pb-4 border-t ${isDark ? "border-white/5 bg-[#0a1628]" : "bg-[#fdf6e3] border-[#d9c4a8]"}`}>
      <div className="max-w-4xl mx-auto">
        {/* Attached file indicator */}
        {(attachedFile || uploading) && (
          <div className={`flex items-center gap-2 mb-2 px-3 py-2 rounded-xl text-sm ${
            isDark ? "bg-white/[0.06] text-white/70" : "bg-gray-100 text-gray-600"
          }`}>
            {uploading ? (
              <>
                <Loader2 size={14} className="animate-spin text-[#FDB02F]" />
                <span>Extracting text from document...</span>
              </>
            ) : attachedFile ? (
              <>
                <FileText size={14} className="text-[#FDB02F]" />
                <span className="flex-1 truncate">{attachedFile.name}</span>
                <span className={`text-xs ${isDark ? "text-white/30" : "text-gray-400"}`}>
                  {(attachedFile.text.length / 1000).toFixed(1)}k chars
                </span>
                <button onClick={onRemoveFile} className="p-0.5 rounded hover:bg-white/10">
                  <X size={14} />
                </button>
              </>
            ) : null}
          </div>
        )}
        <div className={`relative flex items-end rounded-2xl focus-within:border-[#FDB02F]/30 transition-colors ${
          isDark
            ? "bg-white/[0.04] border border-white/10"
            : "bg-[#fdf0e2] border border-[#d9c4a8] shadow-sm"
        }`}>
          <textarea
            ref={ref}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={isRecording ? "Listening..." : (attachedFile ? "Ask a question about the document..." : placeholder)}
            rows={1}
            className={`flex-1 px-3 py-3 sm:px-5 sm:py-4 text-lg focus:outline-none resize-none max-h-40 rounded-2xl ${
              isDark ? "bg-[#2a2520] text-white placeholder:text-white/20" : "bg-[#f5f0d0] text-gray-800 placeholder:text-gray-400"
            }`}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.pptx,.ppt,.txt"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="flex items-center gap-1 m-1.5 sm:m-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className={`p-2 sm:p-2.5 rounded-xl transition-all ${
                isDark
                  ? "text-white/30 hover:text-white/60 hover:bg-white/5"
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              } ${uploading ? "opacity-30 cursor-not-allowed" : ""}`}
              title="Attach document (PDF, DOCX, PPTX, TXT)"
            >
              <Paperclip size={16} />
            </button>
            <button
              onClick={toggleTranscribe}
              className={`p-2 sm:p-2.5 rounded-xl transition-all ${
                isRecording
                  ? "bg-red-500 text-white animate-pulse"
                  : isDark
                    ? "text-white/30 hover:text-white/60 hover:bg-white/5"
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              }`}
              title={isRecording ? "Stop recording" : "Transcribe voice"}
            >
              {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
            <button
              onClick={onSend}
              disabled={(!input.trim() && !attachedFile) || loading}
              className="p-2 sm:p-2.5 rounded-xl bg-[#FDB02F] text-[#07123A] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#FDAA40] transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
        <p className={`text-center text-base sm:text-base mt-2 sm:mt-2.5 ${isDark ? "text-white/30" : "text-gray-500"}`}>
          For licensed healthcare providers only. Educational use only. Not medical advice. Clinician remains in control.
        </p>
      </div>
    </div>
  );
});

// Markdown to HTML converter with tables, headers, blockquotes, and clinical report sections
function markdownToHtml(text: string): string {
  let html = text;

  // Disclaimer block — detect both "> **Disclaimer:**" and "**Disclaimer:**" formats
  html = html.replace(
    /^>?\s*\*\*Disclaimer:\*\*\s*(.+)$/gm,
    '<div class="copilot-disclaimer"><strong>Disclaimer:</strong> $1</div>'
  );

  // Remaining blockquotes
  html = html.replace(/^> (.+)$/gm, '<blockquote class="copilot-blockquote">$1</blockquote>');

  // Time-saving note — detect the ⏱ pattern
  html = html.replace(
    /⏱\s*\*\*Time-Saving Note\*\*\n?"?([^"]*)"?/gm,
    '<div class="copilot-time-note">⏱ <strong>Time-Saving Note</strong><br/>$1</div>'
  );

  // Educational resources section — detect 📚 pattern
  html = html.replace(
    /📚\s*\*\*Educational Resources:?\*\*\n((?:[-•]\s*.+\n?)*)/gm,
    (_match: string, items: string) => {
      const listItems = items.trim().split('\n')
        .map((item: string) => item.replace(/^[-•]\s*/, '').trim())
        .filter(Boolean)
        .map((item: string) => `<li class="copilot-uli">${inlineFormat(item)}</li>`)
        .join('');
      return `<div class="copilot-resources">📚 <strong>Educational Resources</strong><ul class="copilot-ul">${listItems}</ul></div>`;
    }
  );

  // Optional prompts section
  html = html.replace(
    /\*\*OPTIONAL PROMPTS\*\*\n((?:[-•]\s*.+\n?)*)/gm,
    (_match: string, items: string) => {
      const listItems = items.trim().split('\n')
        .map((item: string) => item.replace(/^[-•]\s*/, '').trim())
        .filter(Boolean)
        .map((item: string) => `<li class="copilot-uli">${inlineFormat(item)}</li>`)
        .join('');
      return `<div class="copilot-prompts"><strong>Optional Prompts</strong><ul class="copilot-ul">${listItems}</ul></div>`;
    }
  );

  // Headers (order matters — match longer prefixes first, allow optional leading whitespace)
  html = html.replace(/^\s*###### (.+)$/gm, '<h4 class="copilot-h4">$1</h4>');
  html = html.replace(/^\s*##### (.+)$/gm, '<h4 class="copilot-h4">$1</h4>');
  html = html.replace(/^\s*#### (.+)$/gm, '<h4 class="copilot-h4">$1</h4>');
  html = html.replace(/^\s*### (.+)$/gm, '<h3 class="copilot-h3">$1</h3>');
  html = html.replace(/^\s*## (.+)$/gm, '<h2 class="copilot-h2">$1</h2>');
  html = html.replace(/^\s*# (.+)$/gm, '<h1 class="copilot-h1">$1</h1>');

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr class="copilot-hr"/>');

  // Tables
  html = html.replace(
    /(?:^(\|.+\|)\n(\|[-| :]+\|)\n((?:\|.+\|\n?)*))/gm,
    (_match, headerRow: string, _separator: string, bodyRows: string) => {
      const headers = headerRow.split("|").filter((c: string) => c.trim()).map((c: string) => c.trim());
      const rows = bodyRows.trim().split("\n").map((row: string) =>
        row.split("|").filter((c: string) => c.trim()).map((c: string) => c.trim())
      );

      let table = '<div class="copilot-table-wrap"><table class="copilot-table"><thead><tr>';
      headers.forEach((h: string) => { table += `<th>${inlineFormat(h)}</th>`; });
      table += "</tr></thead><tbody>";
      rows.forEach((row: string[]) => {
        table += "<tr>";
        row.forEach((cell: string) => { table += `<td>${inlineFormat(cell)}</td>`; });
        table += "</tr>";
      });
      table += "</tbody></table></div>";
      return table;
    }
  );

  // Ordered lists
  html = html.replace(/^(\d+)\. (.+)$/gm, '<li class="copilot-oli">$2</li>');
  html = html.replace(/((?:<li class="copilot-oli">.*<\/li>\n?)+)/g, '<ol class="copilot-ol">$1</ol>');

  // Unordered lists — match -, •, and * bullets
  html = html.replace(/^[-•\*] (.+)$/gm, '<li class="copilot-uli">$1</li>');
  html = html.replace(/((?:<li class="copilot-uli">.*<\/li>\n?)+)/g, '<ul class="copilot-ul">$1</ul>');

  // Inline formatting
  html = inlineFormat(html);

  // Strip ALL newlines inside list containers
  html = html.replace(/(<ul class="copilot-ul">)([\s\S]*?)(<\/ul>)/g, (_m, open, inner, close) => {
    return open + inner.replace(/\n/g, '') + close;
  });
  html = html.replace(/(<ol class="copilot-ol">)([\s\S]*?)(<\/ol>)/g, (_m, open, inner, close) => {
    return open + inner.replace(/\n/g, '') + close;
  });

  // Strip newlines around block elements BEFORE paragraph conversion
  html = html.replace(/\n+(<h[1-4] )/g, '$1');
  html = html.replace(/(<\/h[1-4]>)\n+/g, '$1');
  html = html.replace(/\n+(<div )/g, '$1');
  html = html.replace(/(<\/div>)\n+/g, '$1');
  html = html.replace(/\n+(<ul )/g, '$1');
  html = html.replace(/(<\/ul>)\n+/g, '$1');
  html = html.replace(/\n+(<ol )/g, '$1');
  html = html.replace(/(<\/ol>)\n+/g, '$1');
  html = html.replace(/\n+(<hr )/g, '$1');
  html = html.replace(/(<hr[^>]*\/>)\n+/g, '$1');
  html = html.replace(/\n+(<blockquote )/g, '$1');
  html = html.replace(/(<\/blockquote>)\n+/g, '$1');
  html = html.replace(/\n+(<table )/g, '$1');
  html = html.replace(/(<\/table><\/div>)\n+/g, '$1');

  // Collapse 3+ newlines to 2
  html = html.replace(/\n{3,}/g, '\n\n');

  // Convert remaining double newlines to paragraph breaks
  html = html.replace(/\n\n/g, '</p><p class="copilot-p">');
  // Convert single newlines to <br/> only between inline content
  html = html.replace(/\n/g, "<br/>");

  // Remove empty paragraphs and clean up
  html = html.replace(/<p class="copilot-p">\s*<\/p>/g, '');
  html = html.replace(/<p class="copilot-p">(<br\/>)*<\/p>/g, '');
  html = html.replace(/<p class="copilot-p"><br\/>/g, '<p class="copilot-p">');
  html = html.replace(/<br\/><\/p>/g, '</p>');

  // Wrap in paragraph if not starting with block element
  if (!html.startsWith("<")) {
    html = `<p class="copilot-p">${html}</p>`;
  }

  return html;
}

function inlineFormat(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="copilot-code">$1</code>')
    // Markdown links: [text](url) → clickable <a>
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="copilot-link">$1</a>')
    .replace(/⏱/g, '<span class="copilot-emoji">⏱</span>')
    .replace(/📚/g, '<span class="copilot-emoji">📚</span>')
    .replace(/☐/g, '<span class="copilot-checkbox">☐</span>');
}
