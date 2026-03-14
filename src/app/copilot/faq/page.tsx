"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown } from "lucide-react";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/copilot/faqs")
      .then((r) => r.json())
      .then((data) => { setFaqs(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const categories = [...new Set(faqs.map((f) => f.category))];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07123A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#FDB02F]/30 border-t-[#FDB02F] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07123A]">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link href="/copilot/chat" className="inline-flex items-center gap-2 text-[#FDB02F] hover:underline mb-8 text-sm">
          <ArrowLeft size={16} /> Back to Co-Pilot
        </Link>

        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">Frequently Asked Questions</h1>
          <p className="text-white/40">Find answers about the OnDemandPsych Clinical Co-Pilot</p>
        </div>

        {categories.map((category) => (
          <div key={category} className="mb-10">
            <h2 className="text-lg font-bold text-[#FDB02F] mb-4 border-b border-white/10 pb-2">{category}</h2>
            <div className="space-y-2">
              {faqs
                .filter((f) => f.category === category)
                .map((faq) => (
                  <div
                    key={faq.id}
                    className="rounded-xl border border-white/10 overflow-hidden transition-colors hover:border-white/20"
                  >
                    <button
                      onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left"
                    >
                      <span className="text-white font-medium pr-4">{faq.question}</span>
                      <ChevronDown
                        size={18}
                        className={`text-white/30 shrink-0 transition-transform ${openId === faq.id ? "rotate-180" : ""}`}
                      />
                    </button>
                    {openId === faq.id && (
                      <div className="px-5 pb-5 text-white/60 leading-relaxed whitespace-pre-line">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
