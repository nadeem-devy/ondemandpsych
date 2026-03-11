import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export function FounderSpotlight() {
  return (
    <SectionWrapper className="py-24 bg-[#07123A] relative overflow-hidden">
      {/* Faint silhouette bg */}
      <div className="absolute inset-0 flex items-center justify-end pr-20 opacity-[0.03]">
        <div className="w-[500px] h-[500px] rounded-full bg-gradient-to-b from-white/20 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — Founder photo */}
          <div className="relative">
            <div className="aspect-[4/5] rounded-2xl bg-gradient-to-b from-[#0D1B4B] to-[#07123A] border border-[#FDB02F]/20 overflow-hidden">
              <img src="/Dr Padder (1).webp" alt="Dr. Tanveer A. Padder, MD" className="w-full h-full object-cover" />
            </div>
            {/* Badge */}
            <div className="absolute bottom-6 left-6 bg-[#07123A]/90 backdrop-blur-md border border-[#FDB02F]/20 rounded-xl px-4 py-2">
              <span className="text-xs font-semibold text-[#FDB02F]">
                Triple Board-Certified Psychiatrist
              </span>
            </div>
          </div>

          {/* Right — Content */}
          <div className="space-y-6">
            <SectionLabel>THE VISIONARY</SectionLabel>
            <h2 className="font-[var(--font-syne)] text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
              A Clinician&apos;s Vision for Safer Psychiatry
            </h2>
            <p className="text-white/50 text-sm">
              Triple board-certified psychiatrist &middot; 25+ years &middot; 100,000+ patient
              encounters
            </p>

            {/* Credential blocks */}
            <div className="space-y-4">
              <div className="flex gap-4">
                <span className="font-mono text-[#FDB02F] font-bold text-sm shrink-0">
                  01
                </span>
                <p className="text-white/60 text-sm leading-relaxed">
                  With more than 25 years of clinical leadership experience in
                  emergency, inpatient, outpatient, and addiction psychiatry, Dr.
                  Tanveer A. Padder is a triple board-certified psychiatrist,
                  well-known for his contributions to practical psychiatric
                  decision-making.
                </p>
              </div>
              <div className="flex gap-4">
                <span className="font-mono text-[#FDB02F] font-bold text-sm shrink-0">
                  02
                </span>
                <p className="text-white/60 text-sm leading-relaxed">
                  Dr. Padder is the visionary behind the world&apos;s first Psychiatric
                  Clinical Co-Pilot. On-Demand Psychiatry was developed to assist
                  clinicians in making critical decisions in real-world
                  psychiatric care without replacing clinical judgment.
                </p>
              </div>
            </div>

            {/* Pull quote */}
            <blockquote className="border-l-4 border-[#FDB02F] pl-6 py-2">
              <p className="italic text-white/70 text-sm leading-relaxed">
                &ldquo;One thing became clear after years in emergency rooms,
                inpatient units, and outpatient clinics: physicians are forced to
                make important psychiatric choices under duress, often without
                the necessary support. On-Demand Psychiatry was created to
                change that.&rdquo;
              </p>
              <cite className="text-xs text-[#FDB02F] mt-2 block not-italic">
                — Dr. Tanveer A. Padder, MD
              </cite>
            </blockquote>

            <Link href="/founder">
              <Button variant="outline">Meet the Founder &rarr;</Button>
            </Link>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
