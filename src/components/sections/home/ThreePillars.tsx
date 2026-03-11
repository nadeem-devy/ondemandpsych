import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { Button } from "@/components/ui/Button";

const pillars = [
  {
    num: "01",
    title: "Co-Pilot Psychiatric Decision Support",
    body: "Make faster, more accurate clinical decisions with advanced diagnostic intelligence. Structured assessment guidance, comprehensive differentials, red-flag alerts, and evidence-based next-step recommendations.",
  },
  {
    num: "02",
    title: "Co-Pilot Psychopharmacology Tool",
    body: "212+ medications. Drug interactions, QTc risk, black-box warnings, pregnancy safety \u2014 all checked in real time. Precision dosing and cross-tapering guidance for any scenario.",
  },
  {
    num: "03",
    title: "Psychiatry Documentation Co-Pilot",
    body: "Eliminate hours of charting. Instantly generate H&Ps, progress notes, discharge summaries, consult notes, treatment plans, and patient education handouts.",
  },
];

export function ThreePillars() {
  return (
    <SectionWrapper className="py-24 bg-[#07123A] relative">
      {/* Subtle grid lines */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 60px, rgba(255,255,255,0.3) 60px, rgba(255,255,255,0.3) 61px), repeating-linear-gradient(90deg, transparent, transparent 60px, rgba(255,255,255,0.3) 60px, rgba(255,255,255,0.3) 61px)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <h2 className="font-[var(--font-syne)] text-3xl md:text-4xl lg:text-5xl font-bold text-white">
            Three Tools Transforming Psychiatric Care
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pillars.map((p) => (
            <div
              key={p.num}
              className="group relative bg-gradient-to-b from-[#0D1B4B] to-[#07123A] rounded-2xl border border-white/5 p-8 overflow-hidden transition-all duration-300 hover:border-[#FDB02F]/30"
            >
              {/* Top orange line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FDB02F] to-[#FDAA40] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />

              {/* Watermark number */}
              <span className="absolute top-4 right-6 font-mono text-7xl font-bold text-white/[0.03]">
                {p.num}
              </span>

              <span className="font-mono text-[#FDB02F] text-lg font-bold">
                {p.num}
              </span>
              <h3 className="mt-4 text-xl font-bold text-white mb-4">
                {p.title}
              </h3>
              <p className="text-lg text-white/50 leading-relaxed mb-6">
                {p.body}
              </p>
              <Button
                href="/copilot/login"
               
                variant="outline"
                className="text-lg"
              >
                Get Started &rarr;
              </Button>
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
