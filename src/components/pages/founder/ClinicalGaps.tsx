import { SectionWrapper } from "@/components/ui/SectionWrapper";

const gaps = [
  { challenge: "Lack of evidence-based decision support", solution: "Real-time guideline recommendations" },
  { challenge: "High-risk polypharmacy", solution: "Instant medication interaction checks" },
  { challenge: "Missed or delayed lab monitoring", solution: "Automated lab monitoring prompts" },
  { challenge: "Diagnostic uncertainty", solution: "DSM-5-TR & ICD-10 verification" },
  { challenge: "Time lost to documentation", solution: "Chart-ready notes in under 90 seconds" },
  { challenge: "Treatment-resistant conditions", solution: "Stepwise clinical protocols" },
  { challenge: "Clinician burnout", solution: "Faster decisions, reduced cognitive load" },
  { challenge: "Unsafe or outdated prescribing", solution: "24/7 psychopharmacology guidance" },
  { challenge: "No safe medication alternatives", solution: "Structured substitution pathways" },
  { challenge: "Fragmented psychiatric care", solution: "Coverage across all psychiatric settings" },
  { challenge: "Lack of cross-taper logic", solution: "Guided medication switching and tapering" },
  { challenge: "Limited patient education tools", solution: "Simple, clinician-ready handouts" },
  { challenge: "Inconsistent risk assessment", solution: "SAFE-T & C-SSRS integration" },
  { challenge: "Inefficient telepsychiatry workflows", solution: "Real-time Clinical Co-Pilot support" },
  { challenge: "EMRs lack psychiatric reasoning", solution: "Psychiatry-specific reasoning engine" },
];

export function ClinicalGaps() {
  return (
    <SectionWrapper className="py-24 bg-[#0D1B4B]">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-12">
          <h2 className="font-[var(--font-syne)] text-3xl md:text-4xl font-bold text-white">
            Clinical Gaps & How We Address Them
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="bg-[#FDB02F] text-[#07123A]">
                <th className="text-left px-6 py-4 text-lg font-bold rounded-tl-xl">
                  Clinical Challenge
                </th>
                <th className="text-left px-6 py-4 text-lg font-bold rounded-tr-xl">
                  On-Demand Psychiatry Support
                </th>
              </tr>
            </thead>
            <tbody>
              {gaps.map((gap, i) => (
                <tr
                  key={gap.challenge}
                  className={`group border-b border-white/5 transition-all hover:border-l-4 hover:border-l-[#FDB02F] ${
                    i % 2 === 0 ? "bg-[#07123A]/40" : "bg-[#07123A]/20"
                  }`}
                >
                  <td className="px-6 py-4 text-lg text-white/70">
                    {gap.challenge}
                  </td>
                  <td className="px-6 py-4 text-lg text-white/70">
                    {gap.solution}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SectionWrapper>
  );
}
