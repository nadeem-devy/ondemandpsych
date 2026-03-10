import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { GlassCard } from "@/components/ui/GlassCard";

const outcomes = [
  {
    value: "70\u201390%",
    subtitle: "Documentation time reduced",
    bullets: [
      "Less time on lookups",
      "Faster clinical flow",
      "Less cognitive carryover",
    ],
  },
  {
    value: "30+",
    subtitle: "Psychiatric subspecialties",
    bullets: [
      "Greater clarity in ambiguous situations",
      "Consistency across shifts",
      "Better polypharmacy decisions",
    ],
  },
  {
    value: "<90s",
    subtitle: "Chart-ready note generation",
    bullets: [
      "Captured while fresh",
      "More consistent",
      "Audit-ready",
    ],
  },
];

export function OutcomeCards() {
  return (
    <SectionWrapper className="py-24 bg-[#0D1B4B]">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {outcomes.map((o) => (
            <GlassCard key={o.value} className="p-8 text-center">
              <div className="font-mono text-5xl font-bold text-[#FDB02F] mb-2">
                {o.value}
              </div>
              <p className="text-sm text-white/50 mb-6">{o.subtitle}</p>
              <ul className="space-y-2 text-left">
                {o.bullets.map((b) => (
                  <li
                    key={b}
                    className="flex items-center gap-2 text-sm text-white/60"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FDB02F] shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            </GlassCard>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
