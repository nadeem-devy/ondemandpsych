"use client";

import { useState } from "react";
import { Save, FileText, ChevronRight } from "lucide-react";
import { RichTextEditor } from "@/components/admin/RichTextEditor";

const pages = [
  {
    slug: "home",
    name: "Home",
    sections: [
      { id: "hero", label: "Hero Section", fields: [
        { name: "badge", type: "text", label: "Badge Text" },
        { name: "title", type: "text", label: "Title" },
        { name: "subtitle", type: "rich", label: "Subtitle" },
        { name: "ctaText", type: "text", label: "CTA Button Text" },
        { name: "ctaLink", type: "text", label: "CTA Button Link" },
      ]},
      { id: "stats", label: "Stats Bar", fields: [
        { name: "content", type: "rich", label: "Stats Content" },
      ]},
      { id: "delivers", label: "What It Delivers", fields: [
        { name: "heading", type: "text", label: "Heading" },
        { name: "description", type: "rich", label: "Description" },
        { name: "videoUrl", type: "text", label: "YouTube Video URL" },
        { name: "content", type: "rich", label: "Capabilities & Content" },
      ]},
      { id: "features", label: "Feature Grid", fields: [
        { name: "heading", type: "text", label: "Heading" },
        { name: "subtitle", type: "rich", label: "Subtitle" },
        { name: "content", type: "rich", label: "Features Content" },
      ]},
      { id: "settings-ticker", label: "Clinical Settings", fields: [
        { name: "heading", type: "text", label: "Heading" },
        { name: "content", type: "rich", label: "Settings Content" },
      ]},
      { id: "founder-spotlight", label: "Founder Spotlight", fields: [
        { name: "name", type: "text", label: "Name" },
        { name: "title", type: "text", label: "Title" },
        { name: "quote", type: "rich", label: "Quote" },
      ]},
      { id: "who-its-for", label: "Who It's For", fields: [
        { name: "heading", type: "text", label: "Heading" },
        { name: "content", type: "rich", label: "Personas Content" },
      ]},
      { id: "three-pillars", label: "Three Pillars", fields: [
        { name: "heading", type: "text", label: "Heading" },
        { name: "content", type: "rich", label: "Pillars Content" },
      ]},
      { id: "trust", label: "Trust Section", fields: [
        { name: "heading", type: "text", label: "Heading" },
        { name: "content", type: "rich", label: "Trust Items Content" },
      ]},
      { id: "closing-cta", label: "Closing CTA", fields: [
        { name: "heading", type: "text", label: "Heading" },
        { name: "subtitle", type: "rich", label: "Subtitle" },
        { name: "content", type: "rich", label: "Stats & Content" },
      ]},
    ],
  },
  {
    slug: "founder",
    name: "Founder",
    sections: [
      { id: "hero", label: "Page Hero", fields: [
        { name: "title", type: "text", label: "Title" },
        { name: "subtitle", type: "text", label: "Subtitle" },
      ]},
      { id: "bio", label: "Founder Bio", fields: [
        { name: "name", type: "text", label: "Name" },
        { name: "title", type: "text", label: "Title" },
        { name: "content", type: "rich", label: "Bio & Credentials" },
        { name: "quote", type: "rich", label: "Quote" },
      ]},
      { id: "clinical-gaps", label: "Clinical Gaps", fields: [
        { name: "heading", type: "text", label: "Heading" },
        { name: "content", type: "rich", label: "Content" },
      ]},
      { id: "clinical-urgency", label: "Clinical Urgency", fields: [
        { name: "heading", type: "text", label: "Heading" },
        { name: "content", type: "rich", label: "Content" },
      ]},
      { id: "solution", label: "Solution Section", fields: [
        { name: "heading", type: "text", label: "Heading" },
        { name: "content", type: "rich", label: "Content" },
      ]},
      { id: "capabilities", label: "Capabilities", fields: [
        { name: "heading", type: "text", label: "Heading" },
        { name: "content", type: "rich", label: "Capabilities Content" },
      ]},
    ],
  },
  {
    slug: "features-benefits",
    name: "Features & Benefits",
    sections: [
      { id: "hero", label: "Page Hero", fields: [
        { name: "title", type: "text", label: "Title" },
        { name: "subtitle", type: "text", label: "Subtitle" },
      ]},
      { id: "features", label: "Features List", fields: [
        { name: "content", type: "rich", label: "Features Content" },
      ]},
      { id: "benefits", label: "Benefits", fields: [
        { name: "heading", type: "text", label: "Heading" },
        { name: "content", type: "rich", label: "Benefits Content" },
      ]},
    ],
  },
  {
    slug: "pricing",
    name: "Pricing",
    sections: [
      { id: "hero", label: "Page Hero", fields: [
        { name: "title", type: "text", label: "Title" },
        { name: "subtitle", type: "text", label: "Subtitle" },
      ]},
      { id: "plans", label: "Pricing Plans", fields: [
        { name: "content", type: "rich", label: "Plans Content" },
      ]},
      { id: "faq", label: "FAQ", fields: [
        { name: "content", type: "rich", label: "FAQ Content" },
      ]},
    ],
  },
  {
    slug: "our-unique-approach-workflow",
    name: "Our Approach",
    sections: [
      { id: "hero", label: "Page Hero", fields: [
        { name: "title", type: "text", label: "Title" },
        { name: "subtitle", type: "text", label: "Subtitle" },
      ]},
      { id: "content", label: "Page Content", fields: [
        { name: "content", type: "rich", label: "Content" },
      ]},
    ],
  },
  {
    slug: "contact-us",
    name: "Contact Us",
    sections: [
      { id: "hero", label: "Page Hero", fields: [
        { name: "title", type: "text", label: "Title" },
        { name: "subtitle", type: "text", label: "Subtitle" },
      ]},
      { id: "form", label: "Contact Form", fields: [
        { name: "heading", type: "text", label: "Heading" },
        { name: "description", type: "rich", label: "Description" },
      ]},
    ],
  },
];

type Field = { name: string; type: string; label: string };
type Section = { id: string; label: string; fields: Field[] };
type Page = { slug: string; name: string; sections: Section[] };

interface SectionData {
  [key: string]: string;
}

export default function PagesEditor() {
  const [activePage, setActivePage] = useState<Page>(pages[0]);
  const [activeSection, setActiveSection] = useState<Section>(pages[0].sections[0]);
  const [formData, setFormData] = useState<SectionData>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function selectSection(page: Page, section: Section) {
    setActivePage(page);
    setActiveSection(section);
    setFormData({});
    setSaved(false);

    fetch(`/api/admin/content?page=${page.slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const existing = data.find(
            (s: { sectionId: string }) => s.sectionId === section.id
          );
          if (existing) setFormData(existing.content);
        }
      })
      .catch(() => {});
  }

  async function handleSave() {
    setSaving(true);
    try {
      await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageSlug: activePage.slug,
          sectionId: activeSection.id,
          content: formData,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      alert("Failed to save");
    }
    setSaving(false);
  }

  function updateField(name: string, value: string) {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  return (
    <div className="flex h-screen">
      {/* Page/Section sidebar */}
      <div className="w-72 border-r border-white/10 bg-[#07123A]/50 overflow-y-auto p-4">
        <h2 className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-4">
          Pages & Sections
        </h2>
        {pages.map((page) => (
          <div key={page.slug} className="mb-4">
            <div className="flex items-center gap-2 text-white/60 text-sm font-medium mb-1 px-2">
              <FileText size={14} />
              {page.name}
            </div>
            {page.sections.map((section) => (
              <button
                key={`${page.slug}-${section.id}`}
                onClick={() => selectSection(page, section)}
                className={`w-full text-left flex items-center gap-2 px-4 py-2 rounded-lg text-xs transition-colors ${
                  activePage.slug === page.slug &&
                  activeSection.id === section.id
                    ? "bg-[#FDB02F]/15 text-[#FDB02F]"
                    : "text-white/40 hover:text-white/60 hover:bg-white/5"
                }`}
              >
                <ChevronRight size={12} />
                {section.label}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Editor */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-3xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold text-white">
                {activeSection.label}
              </h1>
              <p className="text-white/40 text-xs mt-1">
                {activePage.name} &rarr; {activeSection.label}
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
                saved
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-[#FDB02F] text-[#07123A] hover:bg-[#FDAA40]"
              } disabled:opacity-50`}
            >
              <Save size={16} />
              {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
            </button>
          </div>

          {/* Dynamic fields */}
          <div className="space-y-6">
            {activeSection.fields.map((field) => (
              <div key={field.name}>
                <label className="block text-white/60 text-xs font-medium mb-2">
                  {field.label}
                </label>
                {field.type === "rich" ? (
                  <RichTextEditor
                    content={formData[field.name] || ""}
                    onChange={(html) => updateField(field.name, html)}
                    placeholder={`Enter ${field.label.toLowerCase()}...`}
                  />
                ) : (
                  <input
                    type="text"
                    value={formData[field.name] || ""}
                    onChange={(e) => updateField(field.name, e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#FDB02F]/50 transition-colors"
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
