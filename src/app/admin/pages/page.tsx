"use client";

import { useState, useEffect } from "react";
import { Save, FileText, ChevronRight } from "lucide-react";
import { RichTextEditor } from "@/components/admin/RichTextEditor";

// Default content extracted from current hardcoded page components
const defaultContent: Record<string, Record<string, Record<string, string>>> = {
  home: {
    hero: {
      badge: "Built by Psychiatrists. Trusted in Real Clinical Settings.",
      title: "Psychiatric Clinical Co-Pilot",
      subtitle: "Real-time clinical decision support delivering diagnostic reasoning, safer prescribing, and chart-ready documentation in under 90 seconds.",
      ctaText: "Try the Clinical Co-Pilot →",
      ctaLink: "/copilot/register",
    },
    delivers: {
      heading: "Psychiatric Clinical Co-Pilot for Real-World Psychiatry",
      description: "On-Demand Psychiatry is a psychiatry-specific psychiatric clinical co-pilot, built with a clinician-in-the-loop design to support clinical reasoning in real-world settings rather than to automate care or replace judgment.",
    },
    features: {
      heading: "Think Like 30+ Psychiatric Specialists",
      subtitle: "Evidence-based psychiatric reasoning in real time",
    },
    "founder-spotlight": {
      name: "Dr. Tanveer A. Padder, MD",
      title: "A Clinician's Vision for Safer Psychiatry",
      quote: "One thing became clear after years in emergency rooms, inpatient units, and outpatient clinics: physicians are forced to make important psychiatric choices under duress, often without the necessary support. On-Demand Psychiatry was created to change that.",
    },
    "three-pillars": {
      heading: "Three Tools Transforming Psychiatric Care",
    },
    trust: {
      heading: "Clinical Impact & Efficiency",
    },
    "closing-cta": {
      heading: "Psychiatry Clinical Co-Pilot for High-Risk Clinical Decisions",
      subtitle: "High-risk decisions shouldn't be made alone. On-Demand Psychiatry is here to support clinicians with real-time reasoning, safer decisions, and documentation that keeps pace.",
    },
  },
  founder: {
    hero: {
      title: "Meet the Founder",
      subtitle: "Dr. Tanveer A. Padder, MD",
    },
    bio: {
      name: "Dr. Tanveer A. Padder, MD",
      title: "Triple Board-Certified Psychiatrist",
      quote: "Decades of frontline psychiatric decision-making — where high-risk judgments, complicated medications, and time constraints collide — formed the foundation of On-Demand Psychiatry.",
    },
  },
  "features-benefits": {
    hero: {
      title: "Features & Benefits",
      subtitle: "Every feature engineered for real-world psychiatric practice",
    },
    features: {
      content: "<p>Designed for real-world psychiatric practice, the Co-Pilot supports clinicians in actual clinical situations — from diagnostic reasoning and medication decisions to risk assessment and documentation.</p><p>Every feature is built to reduce cognitive burden, improve clinical safety, and give you more time for your patients.</p>",
    },
  },
  pricing: {
    hero: {
      title: "Simple, Transparent Pricing",
      subtitle: "Full access to the Psychiatric Clinical Co-Pilot — no hidden fees, no EMR lock-in.",
    },
  },
  "our-unique-approach-workflow": {
    hero: {
      title: "Approach & Workflow",
      subtitle: "How the Psychiatric Clinical Co-Pilot Fits Into Every Clinical Visit",
    },
  },
  "contact-us": {
    hero: {
      title: "Contact Us",
      subtitle: "Reach the On-Demand Psychiatry team",
    },
    form: {
      heading: "Contact Us",
      description: "Have questions? We'd love to hear from you. Fill out the form and our team will get back to you promptly.",
    },
  },
};

function getDefaultContent(pageSlug: string, sectionId: string): Record<string, string> {
  return defaultContent[pageSlug]?.[sectionId] || {};
}

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
  const [loading, setLoading] = useState(false);

  // Load initial section on mount
  useEffect(() => {
    selectSection(pages[0], pages[0].sections[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function selectSection(page: Page, section: Section) {
    setActivePage(page);
    setActiveSection(section);
    setSaved(false);
    setLoading(true);

    // Start with default content
    const defaults = getDefaultContent(page.slug, section.id);
    setFormData({ ...defaults });

    fetch(`/api/admin/content?page=${page.slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const existing = data.find(
            (s: { sectionId: string }) => s.sectionId === section.id
          );
          if (existing) {
            // Merge: saved content overrides defaults
            setFormData({ ...defaults, ...existing.content });
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
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
        <h2 className="text-white/40 text-lg font-semibold uppercase tracking-wider mb-4">
          Pages & Sections
        </h2>
        {pages.map((page) => (
          <div key={page.slug} className="mb-4">
            <div className="flex items-center gap-2 text-white/60 text-lg font-medium mb-1 px-2">
              <FileText size={16} />
              {page.name}
            </div>
            {page.sections.map((section) => (
              <button
                key={`${page.slug}-${section.id}`}
                onClick={() => selectSection(page, section)}
                className={`w-full text-left flex items-center gap-2 px-4 py-2.5 rounded-lg text-lg transition-colors ${
                  activePage.slug === page.slug &&
                  activeSection.id === section.id
                    ? "bg-[#FDB02F]/15 text-[#FDB02F]"
                    : "text-white/40 hover:text-white/60 hover:bg-white/5"
                }`}
              >
                <ChevronRight size={14} />
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
              <h1 className="text-2xl font-bold text-white">
                {activeSection.label}
              </h1>
              <p className="text-white/40 text-lg mt-1">
                {activePage.name} &rarr; {activeSection.label}
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg text-lg font-bold transition-all ${
                saved
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-[#FDB02F] text-[#07123A] hover:bg-[#FDAA40]"
              } disabled:opacity-50`}
            >
              <Save size={18} />
              {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
            </button>
          </div>

          {loading ? (
            <div className="space-y-6">
              {activeSection.fields.map((field) => (
                <div key={field.name} className="animate-pulse">
                  <div className="h-4 w-32 bg-white/10 rounded mb-2" />
                  <div className="h-12 bg-white/5 rounded-lg border border-white/10" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {activeSection.fields.map((field) => (
                <div key={field.name}>
                  <label className="block text-white/60 text-lg font-medium mb-2">
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
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white text-lg focus:outline-none focus:border-[#FDB02F]/50 transition-colors"
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
