import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  Stethoscope,
  ClipboardPlus,
  MessageSquareText,
  HeartPulse,
  Users,
} from "lucide-react";

const clinicians = [
  {
    icon: Stethoscope,
    title: "Psychiatrists & Specialists",
    body: "Support high-acuity cases with real-time decision support, medication safety checks, clozapine/lithium monitoring, and instant documentation tools.",
  },
  {
    icon: ClipboardPlus,
    title: "Psychiatric Nurse Practitioners",
    body: "Enhance independent practice with dosing support, safe prescribing guidance, lab monitoring, and after-hours clinical decision tools.",
  },
  {
    icon: MessageSquareText,
    title: "Therapists & Counselors",
    body: "Simplify documentation with Co-Pilot generated therapy notes, CBT/DBT templates, and patient progress summaries for better continuity of care.",
  },
  {
    icon: HeartPulse,
    title: "Primary Care & Family Clinicians",
    body: "Manage depression, anxiety, ADHD, bipolar, and substance use more confidently with point-of-care psychiatric guidance and risk alerts.",
  },
  {
    icon: Users,
    title: "Allied Health & Behavioral Teams",
    body: "Generate care summaries, safety plans, and behavior strategies for group homes, RTCs, schools, and community behavioral programs.",
  },
];

export function WhoItsFor() {
  return (
    <SectionWrapper className="py-24 bg-[#0D1B4B]">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="font-[var(--font-syne)] text-3xl md:text-4xl lg:text-5xl font-bold text-white">
            Built for Every Type of Clinician
          </h2>
          <p className="mt-4 text-white/50 text-lg">
            On-Demand Psychiatry adapts to real-world workflows without adding
            complexity
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 overflow-x-auto">
          {clinicians.map((c) => (
            <GlassCard
              key={c.title}
              className="p-6 text-center hover:border-b-2 hover:border-b-[#FDB02F] transition-all"
            >
              <div className="w-14 h-14 rounded-full bg-[#FDB02F]/10 flex items-center justify-center mx-auto mb-4">
                <c.icon className="text-[#FDB02F]" size={24} />
              </div>
              <h3 className="text-sm font-bold text-white mb-3">{c.title}</h3>
              <p className="text-xs text-white/50 leading-relaxed">{c.body}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
