import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { GlassCard } from "@/components/ui/GlassCard";

const benefits = [
  { value: "90%", label: "Reduction in Documentation Time" },
  { value: "70%", label: "Reduction in Provider Burnout & Mental Load" },
  { value: "2\u20133", label: "More Patients Per Day" },
  { value: "24/7", label: "Automated Clinical Monitoring for Patient Safety" },
  { value: "99%", label: "Enhanced Diagnostic Accuracy & Cleaner Billing" },
  { value: "100%", label: "More Effective, Personalized Treatment Strategies" },
];

export function Benefits() {
  return (
    <SectionWrapper className="py-24 bg-[#07123A]">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <h2 className="font-[var(--font-syne)] text-3xl md:text-4xl font-bold text-white">
            6 Key Benefits
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((b, i) => (
            <GlassCard key={b.label} className="p-8 text-center">
              <span className="font-mono text-xs text-[#FDB02F]/40 mb-2 block">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="font-mono text-4xl font-bold text-[#FDB02F] mb-3">
                {b.value}
              </div>
              <p className="text-sm text-white/60">{b.label}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
