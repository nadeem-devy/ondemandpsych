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
  Mic,
  MicOff,
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
}

const promptSuggestions = [
  {
    icon: Stethoscope,
    title: "Diagnostic Reasoning",
    prompt: "Help me with differential diagnosis for a patient presenting with...",
  },
  {
    icon: Pill,
    title: "Medication Review",
    prompt: "Review medication interactions for a patient currently taking...",
  },
  {
    icon: Shield,
    title: "Risk Assessment",
    prompt: "Guide me through a structured psychiatric risk assessment for...",
  },
  {
    icon: FileText,
    title: "Documentation",
    prompt: "Help me create chart-ready documentation for...",
  },
];

export function ChatInterface({ chatId, messages, onSendMessage, loading }: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + "px";
    }
  }, [input]);

  async function handleSend() {
    if (!input.trim() || loading) return;
    const msg = input.trim();
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

  function renderSafeHtml(text: string) {
    const html = markdownToHtml(text);
    const clean = DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        "strong", "em", "ul", "ol", "li", "p", "br", "h1", "h2", "h3",
        "table", "thead", "tbody", "tr", "th", "td", "blockquote", "hr",
        "span", "div", "code",
      ],
      ALLOWED_ATTR: ["class"],
    });
    return { __html: clean };
  }

  // Empty state
  if (!chatId || messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#FDB02F]/20 to-[#FDB02F]/5 flex items-center justify-center mb-4 sm:mb-6">
            <BrainCircuit size={24} className="text-[#FDB02F] sm:hidden" />
            <BrainCircuit size={28} className="text-[#FDB02F] hidden sm:block" />
          </div>
          <h2 className={`text-xl sm:text-2xl font-bold font-[var(--font-syne)] mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
            Clinical Co-Pilot
          </h2>
          <p className={`text-xs sm:text-sm text-center max-w-md mb-6 sm:mb-10 ${isDark ? "text-white/40" : "text-gray-500"}`}>
            Your psychiatry-specific clinical decision support. Ask about diagnosis,
            medication management, risk assessment, or documentation.
          </p>

          <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full max-w-lg">
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
                <p className={`text-xs sm:text-sm font-medium ${isDark ? "text-white/70" : "text-gray-700"}`}>{s.title}</p>
                <p className={`text-[10px] sm:text-xs mt-1 line-clamp-2 ${isDark ? "text-white/25" : "text-gray-400"}`}>{s.prompt}</p>
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
        />
      </div>
    );
  }

  // Messages view
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="max-w-4xl mx-auto py-4 sm:py-6 px-3 sm:px-4 space-y-4 sm:space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-2 sm:gap-4 ${msg.role === "user" ? "justify-end" : ""}`}>
              {msg.role === "assistant" && (
                <div className="shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-[#FDB02F]/20 to-[#FDB02F]/5 flex items-center justify-center mt-1">
                  <Sparkles size={14} className="text-[#FDB02F]" />
                </div>
              )}
              <div className={`flex-1 min-w-0 ${msg.role === "user" ? "max-w-[85%] sm:max-w-[75%]" : ""}`}>
                <div
                  className={`rounded-2xl px-3 py-3 sm:px-5 sm:py-4 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[#FDB02F] text-[#07123A]"
                      : isDark
                        ? "bg-white/[0.03] text-white/80 border border-white/5"
                        : "bg-white text-gray-700 border border-gray-200 shadow-sm"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div
                      className="copilot-message"
                      dangerouslySetInnerHTML={renderSafeHtml(msg.content)}
                    />
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>

                {/* Action buttons for assistant messages */}
                {msg.role === "assistant" && (
                  <div className="flex items-center gap-1 mt-1.5 sm:mt-2 ml-1">
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] transition-colors ${
                        isDark ? "text-white/30 hover:text-white/60 hover:bg-white/5" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check size={12} className="text-green-500" />
                          <span className="text-green-500">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          Copy
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleExport(msg.content, "md")}
                      className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] transition-colors ${
                        isDark ? "text-white/30 hover:text-white/60 hover:bg-white/5" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <Download size={12} />
                      Export .md
                    </button>
                    <button
                      onClick={() => handleExport(msg.content, "txt")}
                      className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] transition-colors ${
                        isDark ? "text-white/30 hover:text-white/60 hover:bg-white/5" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <Download size={12} />
                      Export .txt
                    </button>
                  </div>
                )}
              </div>
              {msg.role === "user" && (
                <div className={`shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center mt-1 ${isDark ? "bg-white/10" : "bg-gray-100"}`}>
                  <User size={14} className={isDark ? "text-white/50" : "text-gray-500"} />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-4">
              <div className="shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-[#FDB02F]/20 to-[#FDB02F]/5 flex items-center justify-center mt-1">
                <Sparkles size={14} className="text-[#FDB02F]" />
              </div>
              <div className={`rounded-2xl px-5 py-4 ${isDark ? "bg-white/[0.04] border border-white/5" : "bg-white border border-gray-200 shadow-sm"}`}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#FDB02F]/40 animate-pulse" />
                  <div className="w-2 h-2 rounded-full bg-[#FDB02F]/40 animate-pulse" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 rounded-full bg-[#FDB02F]/40 animate-pulse" style={{ animationDelay: "300ms" }} />
                  <span className={`text-xs ml-2 ${isDark ? "text-white/20" : "text-gray-400"}`}>Generating clinical response...</span>
                </div>
              </div>
            </div>
          )}

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
      />
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
  }
>(function ChatInput({ input, setInput, onKeyDown, onSend, loading, placeholder }, ref) {
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

  return (
    <div className={`shrink-0 p-3 sm:p-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pb-4 border-t ${isDark ? "border-white/5" : "border-gray-200"}`}>
      <div className="max-w-4xl mx-auto">
        <div className={`relative flex items-end rounded-2xl focus-within:border-[#FDB02F]/30 transition-colors ${
          isDark
            ? "bg-white/[0.04] border border-white/10"
            : "bg-white border border-gray-200 shadow-sm"
        }`}>
          <textarea
            ref={ref}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={isRecording ? "Listening..." : placeholder}
            rows={1}
            className={`flex-1 bg-transparent px-3 py-3 sm:px-5 sm:py-4 text-sm focus:outline-none resize-none max-h-40 ${
              isDark ? "text-white placeholder:text-white/20" : "text-gray-800 placeholder:text-gray-400"
            }`}
          />
          <div className="flex items-center gap-1 m-1.5 sm:m-2">
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
              disabled={!input.trim() || loading}
              className="p-2 sm:p-2.5 rounded-xl bg-[#FDB02F] text-[#07123A] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#FDAA40] transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
        <p className={`text-center text-[10px] sm:text-xs mt-2 sm:mt-2.5 ${isDark ? "text-white/30" : "text-gray-500"}`}>
          For licensed healthcare providers only. Educational use only. Not medical advice. Clinician remains in control.
        </p>
      </div>
    </div>
  );
});

// Markdown to HTML converter with tables, headers, blockquotes
function markdownToHtml(text: string): string {
  let html = text;

  // Blockquotes (> text)
  html = html.replace(/^> (.+)$/gm, '<blockquote class="copilot-blockquote">$1</blockquote>');

  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3 class="copilot-h3">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="copilot-h2">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 class="copilot-h1">$1</h1>');

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

  // Unordered lists
  html = html.replace(/^- (.+)$/gm, '<li class="copilot-uli">$1</li>');
  html = html.replace(/((?:<li class="copilot-uli">.*<\/li>\n?)+)/g, '<ul class="copilot-ul">$1</ul>');

  // Inline formatting
  html = inlineFormat(html);

  // Paragraphs
  html = html.replace(/\n\n/g, '</p><p class="copilot-p">');
  html = html.replace(/\n/g, "<br/>");

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
    .replace(/⏱/g, '<span class="copilot-emoji">⏱</span>')
    .replace(/📚/g, '<span class="copilot-emoji">📚</span>')
    .replace(/☐/g, '<span class="copilot-checkbox">☐</span>');
}
