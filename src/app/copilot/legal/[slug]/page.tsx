"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import DOMPurify from "dompurify";

export default function LegalPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [page, setPage] = useState<{ title: string; content: string; updatedAt: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/copilot/legal?slug=${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((data) => { setPage(data); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07123A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#FDB02F]/30 border-t-[#FDB02F] rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen bg-[#07123A] flex flex-col items-center justify-center text-white">
        <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
        <Link href="/copilot/chat" className="text-[#FDB02F] hover:underline">Back to Co-Pilot</Link>
      </div>
    );
  }

  const sanitizedContent = DOMPurify.sanitize(page.content, {
    ALLOWED_TAGS: [
      "h1", "h2", "h3", "h4", "h5", "h6", "p", "br", "hr",
      "strong", "em", "b", "i", "u", "a", "ul", "ol", "li",
      "table", "thead", "tbody", "tr", "th", "td",
      "blockquote", "code", "pre", "span", "div", "img",
    ],
    ALLOWED_ATTR: ["href", "target", "rel", "class", "id", "src", "alt"],
  });

  return (
    <div className="min-h-screen bg-[#07123A]">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link href="/copilot/chat" className="inline-flex items-center gap-2 text-[#FDB02F] hover:underline mb-8 text-sm">
          <ArrowLeft size={16} /> Back to Co-Pilot
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">{page.title}</h1>
          <p className="text-white/30 text-sm">
            Last updated: {new Date(page.updatedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        <div
          className="prose prose-invert max-w-none text-white/70 leading-relaxed
            prose-headings:text-white prose-headings:font-bold
            prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3 prose-h2:border-b prose-h2:border-white/10 prose-h2:pb-2
            prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-2
            prose-strong:text-white/90
            prose-a:text-[#FDB02F] prose-a:no-underline hover:prose-a:underline
            prose-li:text-white/60
            prose-p:mb-4"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />
      </div>
    </div>
  );
}
