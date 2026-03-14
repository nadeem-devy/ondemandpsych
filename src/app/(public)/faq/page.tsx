"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

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
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="mb-12 border-b border-[#FDB02F]/20 pb-6">
          <h1 className="text-4xl font-bold text-[#FDB02F] mb-3">Frequently Asked Questions</h1>
          <p className="text-white/40">Find answers about the OnDemandPsych Clinical Co-Pilot</p>
        </div>

        {categories.map((category) => (
          <div key={category} className="mb-12">
            <h2 className="text-xl font-bold text-[#FDB02F] mb-5 border-b border-white/10 pb-3">{category}</h2>
            <div className="space-y-3">
              {faqs
                .filter((f) => f.category === category)
                .map((faq) => (
                  <div
                    key={faq.id}
                    className="rounded-xl border border-white/10 overflow-hidden transition-colors hover:border-[#FDB02F]/30"
                  >
                    <button
                      onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                      className="w-full flex items-center justify-between px-6 py-5 text-left"
                    >
                      <span className="text-white font-medium pr-4">{faq.question}</span>
                      <ChevronDown
                        size={18}
                        className={`text-[#FDB02F]/50 shrink-0 transition-transform ${openId === faq.id ? "rotate-180" : ""}`}
                      />
                    </button>
                    {openId === faq.id && (
                      <div className="px-6 pb-6 text-white/60 leading-7 whitespace-pre-line border-t border-white/5 pt-4">
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
