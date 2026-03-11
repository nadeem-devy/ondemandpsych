import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { Button } from "@/components/ui/Button";

const stats = [
  { value: "70\u201390%", label: "Faster docs" },
  { value: "2\u20133 hrs", label: "Saved daily" },
  { value: "100,000+", label: "Case foundation" },
  { value: "\u221E", label: "Clinician-in-the-loop" },
];

export function ClosingCTA() {
  return (
    <SectionWrapper className="bg-gradient-to-r from-[#FDB02F] to-[#FDAA40] py-12">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="font-[var(--font-syne)] text-2xl md:text-3xl lg:text-4xl font-bold text-[#07123A] leading-tight">
          Psychiatry Clinical Co-Pilot for High-Risk Clinical Decisions
        </h2>
        <p className="mt-4 text-base text-[#07123A]/70 max-w-2xl mx-auto leading-relaxed">
          High-risk decisions shouldn&apos;t be made alone. On-Demand Psychiatry is
          here to support clinicians with real-time reasoning, safer decisions,
          and documentation that keeps pace.
        </p>

        {/* Stats row */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="font-mono text-xl md:text-2xl font-bold text-[#07123A]">
                {s.value}
              </div>
              <div className="text-lg text-[#07123A]/60 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            href="/copilot/register"
           
            variant="dark"
            className="px-7 py-3 text-sm"
          >
            Start Free Trial
          </Button>
          <a
            href="/contact-us"
            className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-lg text-sm font-bold transition-all duration-300 cursor-pointer border-2 border-[#07123A]/50 text-[#07123A] hover:bg-[#07123A]/10"
          >
            Request a Demo
          </a>
        </div>
      </div>
    </SectionWrapper>
  );
}
