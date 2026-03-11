"use client";

import { useState } from "react";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { ChevronDown } from "lucide-react";

const tabs = [
  {
    title: "Core Psychiatric Assessment & Reasoning",
    items: ["Assessment", "Psychiatric Evaluation", "Diagnosis", "MSE", "Rating Scales", "Risk Assessment", "Psychiatric Emergencies & Medical Clearance", "Final Recommendation"],
  },
  {
    title: "Medication, Polypharmacy & Precision Treatment",
    items: ["Medication Management & Polypharmacy Strategies", "Drug Interactions", "Side Effects", "Lab Monitoring", "Off-Label Medications", "Tapering Protocol", "Pharmacogenomics"],
  },
  {
    title: "Specialty Psychiatry & Complex Conditions",
    items: ["Child & Adolescent", "Geriatric", "Personality Disorders", "Neuropsychiatric & Cognitive", "Sleep Disorders & Insomnia", "Special Populations", "Complex Cases"],
  },
  {
    title: "Addiction, Trauma & High-Risk Presentations",
    items: ["Substance Abuse & Addiction", "Dual Diagnosis", "Trauma, PTSD & Stress-Related", "Drug-Seeking Behavior", "Acute Risk Assessment", "Emergency Psychiatry & Crisis", "ER Disposition"],
  },
  {
    title: "Care Settings & Continuum of Treatment",
    items: ["Outpatient", "Inpatient", "PHP", "Residential", "Telepsychiatry", "Integrated Care", "Other Settings"],
  },
  {
    title: "Documentation & Clinical Outputs",
    items: ["SOAP Notes", "Progress Notes", "Psychotherapy Notes", "Discharge Summary", "Discharge Planning", "Letters", "Summaries"],
  },
  {
    title: "Psychotherapy, Recovery & Prevention",
    items: ["Psychotherapy Support", "Psychiatric Rehabilitation", "Follow-Up & Relapse Prevention", "Preventive Psychiatry", "Patient Education", "Treatment Review"],
  },
  {
    title: "Compliance, Ethics & Revenue Integrity",
    items: ["Billing & Coding", "Insurance & Preauthorization", "Revenue Cycle", "Ethical & Legal", "Quality Assurance, Audit & Peer Review", "Disability Evaluation"],
  },
  {
    title: "Education, Training & Supervision",
    items: ["Educational Materials", "Teaching Points", "Administrative & Supervisory Tools", "Psychiatric Research & Training", "Guidelines", "References"],
  },
  {
    title: "Clinical Utilities & System Tools",
    items: ["Apps & Devices", "Dietary & Herbals", "Somatic & Invasive Interventions", "Miscellaneous Clinical Questions"],
  },
];

export function CoreCapabilities() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <SectionWrapper className="py-24 bg-[#07123A]">
      <div className="mx-auto max-w-4xl px-6">
        <div className="text-center mb-16">
          <h2 className="font-[var(--font-syne)] text-3xl md:text-4xl font-bold text-white">
            Core Capabilities
          </h2>
          <p className="mt-4 text-white/50">
            10 domains of psychiatric clinical support
          </p>
        </div>

        <div className="space-y-3">
          {tabs.map((tab, i) => (
            <div key={tab.title} className="glass-card overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left cursor-pointer"
              >
                <span className="flex items-center gap-3">
                  <span className="font-mono text-[#FDB02F] text-xl font-bold">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-lg font-semibold text-white">
                    {tab.title}
                  </span>
                </span>
                <ChevronDown
                  size={18}
                  className={`text-white/40 transition-transform duration-200 ${
                    openIndex === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`grid transition-all duration-200 ${
                  openIndex === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="px-6 pb-4">
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
                      {tab.items.map((item) => (
                        <span
                          key={item}
                          className="px-3 py-1.5 rounded-full bg-[#FDB02F]/5 border border-[#FDB02F]/10 text-xl text-white/60"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
