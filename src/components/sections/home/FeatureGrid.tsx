import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { GlassCard } from "@/components/ui/GlassCard";

const subspecialties = [
  "General Adult Psychiatry",
  "Child & Adolescent Psychiatry",
  "Geriatric Psychiatry",
  "Addiction Psychiatry",
  "Forensic Psychiatry",
  "Consultation-Liaison Psychiatry",
  "Emergency Psychiatry",
  "Neuropsychiatry",
  "Sleep Psychiatry",
];

export function FeatureGrid() {
  return (
    <SectionWrapper className="py-24 bg-[#0D1B4B]">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <SectionLabel>CAPABILITIES</SectionLabel>
          <h2 className="mt-4 font-[var(--font-syne)] text-3xl md:text-4xl lg:text-5xl font-bold text-white">
            Think Like 30+ Psychiatric Specialists
          </h2>
          <p className="mt-4 text-white/50 text-lg">
            Evidence-based psychiatric reasoning in real time
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-auto">
          {/* Large card — subspecialty coverage */}
          <GlassCard className="lg:col-span-2 lg:row-span-2 relative overflow-hidden p-8">
            <div className="absolute -top-20 -right-20 orb orb-orange w-[200px] h-[200px]" />
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-white mb-4">
                Subspecialty Coverage
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {subspecialties.map((s) => (
                  <div
                    key={s}
                    className="flex items-center gap-2 text-lg text-white/70"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FDB02F] shrink-0" />
                    {s}
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>

          {/* Smaller cards */}
          <GlassCard className="p-6">
            <h3 className="text-base font-bold text-white mb-2">
              Safer Medication Decisions
            </h3>
            <p className="text-lg text-white/50">
              Interactions &middot; QTc Risk &middot; Labs &middot; Pregnancy &middot; Polypharmacy
            </p>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-base font-bold text-white mb-2">
              Risk & Disposition
            </h3>
            <p className="text-lg text-white/50">
              Suicide Risk &middot; Agitation &middot; Capacity &middot; Admission &middot; Discharge
            </p>
          </GlassCard>

          {/* Medium card */}
          <GlassCard className="lg:col-span-2 p-6">
            <div className="flex items-center gap-6">
              <span className="font-mono text-5xl font-bold text-[#FDB02F]">
                70-90%
              </span>
              <div>
                <h3 className="text-base font-bold text-white mb-1">
                  Documentation Co-Pilot
                </h3>
                <p className="text-lg text-white/50">
                  Clear, audit-ready notes reducing documentation time
                  dramatically
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-base font-bold text-white mb-2">
              ICD-10 & DSM-5-TR
            </h3>
            <p className="text-lg text-white/50">
              Accuracy &middot; Continuity &middot; Compliance
            </p>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-base font-bold text-white mb-2">
              50% Higher Throughput
            </h3>
            <p className="text-lg text-white/50">
              Reduced cognitive burden &middot; Faster notes &middot; Clearer pathways
            </p>
          </GlassCard>
        </div>
      </div>
    </SectionWrapper>
  );
}
