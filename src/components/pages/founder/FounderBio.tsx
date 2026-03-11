import { SectionWrapper } from "@/components/ui/SectionWrapper";
import {
  Award,
  BookOpen,
  GraduationCap,
  Users,
  Brain,
  Sparkles,
  Newspaper,
  Stethoscope,
  HeartPulse,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Credential {
  icon: LucideIcon;
  label: string;
  highlight?: string;
}

const credentials: Credential[] = [
  { icon: Award, label: "Most Impactful Psychiatry Leaders", highlight: "2025" },
  { icon: Newspaper, label: "Featured Cover Story", highlight: "Innovations in Mental Health" },
  { icon: Stethoscope, label: "25+ Years Clinical Leadership", highlight: "All Psychiatric Settings" },
  { icon: HeartPulse, label: "100,000+ Patient Encounters", highlight: "ER, Inpatient, Outpatient, Detox, Rehab, RTCs" },
  { icon: BookOpen, label: "Author: The Practical Guide to Psychiatric Medications", highlight: "Top 10 Globally" },
  { icon: GraduationCap, label: "Creator: 360° Psychiatry Mastery Program", highlight: "Training Clinicians Worldwide" },
  { icon: Users, label: "Global Educator", highlight: "NPs, PAs, Residents, Psychiatrists" },
  { icon: Brain, label: "Expert: Complex Psychopharmacology", highlight: "Treatment-Resistant Disorders" },
  { icon: Sparkles, label: "Visionary", highlight: "World's First AI-Powered Psychiatry Co-Pilot" },
];

export function FounderBio() {
  return (
    <SectionWrapper className="py-24 bg-[#07123A]">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-stretch">
          {/* Founder photo */}
          <div className="relative">
            <div className="h-full rounded-2xl bg-gradient-to-b from-[#0D1B4B] to-[#07123A] border border-[#FDB02F]/20 overflow-hidden flex flex-col items-center justify-center p-8">
              <img src="/Dr Padder (1).webp" alt="Dr. Tanveer A. Padder, MD" className="w-full h-auto rounded-xl object-cover" />
              <p className="text-white/60 text-lg mt-4">Dr. Tanveer A. Padder, MD</p>
              <p className="text-[#FDB02F] text-sm font-medium">
                Triple Board-Certified Psychiatrist
              </p>
            </div>
          </div>

          {/* Credentials — redesigned */}
          <div className="space-y-8">
            <div>
              <p className="text-[#FDB02F] text-xs font-semibold tracking-widest uppercase mb-3">
                Founder & Clinical Architect
              </p>
              <h2 className="font-[var(--font-syne)] text-3xl md:text-4xl font-bold text-white">
                Dr. Tanveer A. Padder, MD
              </h2>
            </div>

            {/* Credential cards */}
            <div className="grid gap-3">
              {credentials.map((cred, i) => (
                <div
                  key={cred.label}
                  className="group flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-[#0D1B4B]/80 to-[#0D1B4B]/40 border border-white/5 hover:border-[#FDB02F]/25 transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#FDB02F]/8 border border-[#FDB02F]/15 flex items-center justify-center shrink-0 group-hover:bg-[#FDB02F]/15 transition-colors">
                    <cred.icon size={18} className="text-[#FDB02F]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white/85 leading-snug">
                      {cred.label}
                    </p>
                    {cred.highlight && (
                      <p className="text-xs text-[#FDB02F]/70 mt-0.5">
                        {cred.highlight}
                      </p>
                    )}
                  </div>
                  <span className="ml-auto text-[10px] font-mono text-white/15 shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
              ))}
            </div>

            {/* Quote */}
            <div className="relative mt-6 p-6 rounded-2xl bg-gradient-to-br from-[#FDB02F]/8 to-transparent border border-[#FDB02F]/15">
              <svg className="absolute top-4 left-5 text-[#FDB02F]/20" width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
              </svg>
              <blockquote className="pl-8">
                <p className="text-base text-white/65 italic leading-relaxed">
                  Decades of frontline psychiatric decision-making &mdash; where
                  high-risk judgments, complicated medications, and time
                  constraints collide &mdash; formed the foundation of On-Demand
                  Psychiatry.
                </p>
              </blockquote>
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
