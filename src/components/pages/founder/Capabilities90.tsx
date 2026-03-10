import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { Clock } from "lucide-react";

const capabilities = [
  "Diagnostic clarification",
  "First\u2013third line treatment pathways",
  "Drug interaction & polypharmacy safety",
  "Suicide & violence risk frameworks",
  "ER triage & disposition logic",
  "Automated documentation (SOAP, evals, discharges)",
  "Patient handouts & psychotherapy support",
  "CPT/ICD-10 coding",
  "HIPAA-aligned compliance",
];

export function Capabilities90() {
  return (
    <SectionWrapper className="py-24 bg-[#07123A]">
      <div className="mx-auto max-w-5xl px-6 text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Clock className="text-[#FDB02F]" size={32} />
        </div>
        <h2 className="font-[var(--font-syne)] text-3xl md:text-4xl font-bold text-white">
          Fast, Safe, and Smart Psychiatric Guidance
        </h2>
        <p className="mt-4 text-white/50 text-lg">
          In under 90 seconds, it provides:
        </p>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {capabilities.map((cap) => (
            <div
              key={cap}
              className="glass-card glass-card-hover px-5 py-4 text-sm text-white/70 text-center transition-all"
            >
              {cap}
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
