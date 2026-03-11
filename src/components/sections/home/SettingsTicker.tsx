"use client";

import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  User,
  Activity,
  Building,
  Stethoscope,
  Shield,
  Heart,
} from "lucide-react";

const tickerItems = [
  "Emergency Psychiatry",
  "Inpatient Units",
  "Outpatient Clinics",
  "Crisis Stabilization (CSU)",
  "Primary Care",
  "Detox & Rehab",
  "Telepsychiatry",
  "Consultation-Liaison",
  "Residential",
  "Group Homes",
];

const settingsCards = [
  {
    icon: User,
    title: "Individual Clinicians",
    body: "Real-time co-pilot for thinking, deciding, and documenting. 2\u20133 hours saved daily. 70\u201390% faster documentation.",
  },
  {
    icon: Activity,
    title: "Emergency Psychiatry",
    body: "Rapid clinical reasoning under time pressure. Structured triage, risk, and disposition logic. Chart-ready in 60\u201390 seconds.",
  },
  {
    icon: Building,
    title: "Inpatient Psychiatry",
    body: "Bedside decision support for safety, disposition, de-escalation. Safer dosing, switching, and cross-tapering guidance.",
  },
  {
    icon: Stethoscope,
    title: "Primary Care",
    body: "Point-of-care psychiatric support. Distinguishes mood, anxiety, ADHD, bipolar, psychosis. Clear treat-vs-refer guidance.",
  },
  {
    icon: Shield,
    title: "Crisis Stabilization",
    body: "Quick rationalization during critical crisis meetings. Risk signals, safer short-stay medication strategy, precision disposition planning.",
  },
  {
    icon: Heart,
    title: "Detox & Residential",
    body: "Withdrawal management, dual-diagnosis treatment, MAT initiation. Consistent documentation across coverage levels.",
  },
];

export function SettingsTicker() {
  return (
    <SectionWrapper className="py-24 bg-[#07123A]">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-12">
          <h2 className="font-[var(--font-syne)] text-3xl md:text-4xl lg:text-5xl font-bold text-white">
            Workflow Support Across Every Psychiatric Setting
          </h2>
          <p className="mt-4 text-white/50 text-lg">
            Fits your existing workflow. No integration required.
          </p>
        </div>

        {/* Marquee ticker */}
        <div className="overflow-hidden mb-16 border-y border-[#FDB02F]/10 py-4">
          <div className="flex animate-marquee whitespace-nowrap">
            {[...tickerItems, ...tickerItems].map((item, i) => (
              <span
                key={i}
                className="mx-6 text-lg font-medium text-white/40"
              >
                {item}
                <span className="ml-6 text-[#FDB02F]/30">&middot;</span>
              </span>
            ))}
          </div>
        </div>

        {/* Settings cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {settingsCards.map((card) => (
            <GlassCard key={card.title} className="p-6">
              <div className="w-12 h-12 rounded-xl bg-[#FDB02F]/10 flex items-center justify-center mb-4">
                <card.icon className="text-[#FDB02F]" size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                {card.title}
              </h3>
              <p className="text-lg text-white/50 leading-relaxed">
                {card.body}
              </p>
            </GlassCard>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
