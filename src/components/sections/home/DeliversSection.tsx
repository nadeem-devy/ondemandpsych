"use client";

import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, Link2Off, ShieldCheck, UserCheck, BrainCircuit } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const capabilities = [
  "Precise psychiatric diagnosis, formulation, and differential reasoning",
  "Safer choices for psychiatric drugs, such as complex psychopharmacology and polypharmacy",
  "Planning for disposition and conducting structured psychiatric risk assessments across care settings",
  "Clinical reasoning and decision-making captured in clear, compliant psychiatric documentation",
];

const trustBadges: { icon: LucideIcon; label: string }[] = [
  { icon: Link2Off, label: "No EMR integration required" },
  { icon: ShieldCheck, label: "HIPAA-aligned clinical workflows" },
  { icon: UserCheck, label: "Clinician remains in control" },
  { icon: BrainCircuit, label: "Clinical judgment supported" },
];

export function DeliversSection() {
  return (
    <SectionWrapper className="py-20 bg-[#07123A]">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — YouTube Video + Trust Pills */}
          <div className="space-y-5">
          <div className="relative rounded-2xl overflow-hidden border border-white/5 bg-[#0D1B4B]/50 aspect-video">
            <iframe
              src="https://www.youtube.com/embed/1AThWUS4ZK0"
              title="Psychiatric Clinical Co-Pilot Demo"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>

          {/* Trust pills under video */}
          <div className="grid grid-cols-2 gap-2.5">
            {trustBadges.map((badge) => (
              <div
                key={badge.label}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-[#FDB02F]/20 bg-gradient-to-r from-[#FDB02F]/8 to-[#FDB02F]/3 backdrop-blur-sm"
              >
                <badge.icon size={16} className="text-[#FDB02F] shrink-0" />
                <span className="text-xl font-medium text-white/75">{badge.label}</span>
              </div>
            ))}
          </div>
          </div>

          {/* Right — Content */}
          <div className="space-y-6">
            <h2 className="font-[var(--font-syne)] text-3xl md:text-4xl font-bold text-white leading-tight">
              Psychiatric Clinical Co-Pilot for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FDB02F] to-[#FDAA40]">
                Real-World Psychiatry
              </span>
            </h2>

            <p className="text-white/55 text-lg leading-relaxed">
              On-Demand Psychiatry is a psychiatry-specific psychiatric clinical co-pilot,
              built with a clinician-in-the-loop design to support clinical reasoning in
              real-world settings rather than to automate care or replace judgment.
            </p>

            <div className="space-y-4 pt-2">
              {capabilities.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-[#FDB02F] shrink-0 mt-0.5" />
                  <p className="text-lg text-white/65 leading-relaxed">{item}</p>
                </div>
              ))}
            </div>

            <Button
              href="/copilot/register"
             
              className="mt-4 text-lg px-7 py-3.5"
            >
              Start Free Trial &rarr;
            </Button>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
