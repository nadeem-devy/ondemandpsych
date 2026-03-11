import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { Button } from "@/components/ui/Button";

export function FeaturesIntro() {
  return (
    <SectionWrapper className="py-24 bg-[#07123A]">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <h2 className="font-[var(--font-syne)] text-3xl md:text-4xl font-bold text-white">
              On-Demand Psychiatry: A Psychiatric Clinical Co-Pilot
            </h2>
            <p className="text-white/60 leading-relaxed">
              Designed for real-world psychiatric practice, the Co-Pilot supports
              clinicians in actual clinical situations — from diagnostic
              reasoning and medication decisions to risk assessment and
              documentation.
            </p>
            <p className="text-white/60 leading-relaxed">
              Every feature is built to reduce cognitive burden, improve clinical
              safety, and give you more time for your patients.
            </p>
            <Button href="/copilot/login">
              Try the Co-Pilot &rarr;
            </Button>
          </div>

          {/* Abstract illustration */}
          <div className="relative aspect-square max-w-md mx-auto">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#0D1B4B] to-[#07123A] border border-[#FDB02F]/10 overflow-hidden">
              <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 orb orb-orange" />
              <div className="absolute bottom-1/3 right-1/4 w-1/3 h-1/3 orb orb-blue" />
              {/* Abstract grid pattern */}
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(253,176,47,0.2) 40px, rgba(253,176,47,0.2) 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(253,176,47,0.2) 40px, rgba(253,176,47,0.2) 41px)",
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-2">
                  <div className="font-mono text-5xl font-bold text-[#FDB02F]/30">
                    AI
                  </div>
                  <div className="text-base text-white/20 tracking-widest uppercase">
                    Clinical Intelligence
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
