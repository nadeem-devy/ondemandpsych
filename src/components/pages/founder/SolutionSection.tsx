import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { Button } from "@/components/ui/Button";

const specItems = [
  "25,000\u201350,000 structured real-world cases",
  "212+ psychiatric & addiction medications",
  "Evidence-based textbooks & psychopharmacology curriculum",
  "Thousands of clinical lectures & training modules",
];

export function SolutionSection() {
  return (
    <SectionWrapper className="py-24 bg-[#0D1B4B]">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div className="space-y-6">
            <h2 className="font-[var(--font-syne)] text-3xl md:text-4xl font-bold text-white">
              The Solution: On Demand Psych
            </h2>
            <p className="text-white/60 leading-relaxed">
              On-Demand Psychiatry was designed to bridge the gap between
              clinical need and available support. It delivers real-time
              psychiatric reasoning, medication safety, risk assessment, and
              documentation at the point of care.
            </p>
            <p className="text-white/60 leading-relaxed">
              <strong className="text-white">Built on:</strong>
            </p>
            <ul className="space-y-2">
              {[
                "25+ years of frontline psychiatric experience",
                "100,000+ real-world patient encounters",
                "Evidence-based protocols & guidelines",
                "Clinician-in-the-loop design principles",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-lg text-white/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FDB02F] shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Button href="/copilot/login">
              Try the Co-Pilot &rarr;
            </Button>
          </div>

          {/* Right — Spec sheet */}
          <div className="bg-[#07123A] rounded-2xl border border-[#FDB02F]/20 overflow-hidden">
            {specItems.map((item, i) => (
              <div
                key={item}
                className={`px-8 py-6 ${
                  i < specItems.length - 1 ? "border-b border-white/5" : ""
                }`}
              >
                <p className="text-white/80 text-lg leading-relaxed font-medium">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
