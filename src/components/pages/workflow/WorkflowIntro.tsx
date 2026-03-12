import { SectionWrapper } from "@/components/ui/SectionWrapper";

interface WorkflowIntroProps {
  content?: Record<string, string>;
}

export function WorkflowIntro({ content }: WorkflowIntroProps) {
  return (
    <SectionWrapper className="py-24 bg-[#07123A]">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <h2 className="font-[var(--font-syne)] text-3xl md:text-4xl font-bold text-white">
              The Psychiatric Clinical Co-Pilot&apos;s Place in Actual Clinical
              Practice
            </h2>
            {content?.content ? (
              <div
                className="text-white/60 leading-relaxed prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: content.content }}
              />
            ) : (
              <>
                <p className="text-white/60 leading-relaxed">
                  There is no one workflow for psychiatric care. Emergency psychiatry
                  makes different decisions than telepsychiatry, inpatient units,
                  outpatient clinics, and collaborative behavioral health settings.
                </p>
                <p className="text-white/60 leading-relaxed">
                  On-Demand Psychiatry supports diagnostic reasoning, medication
                  decisions, risk assessment, and documentation at the point of care
                  rather than imposing strict pathways on clinicians.
                </p>
              </>
            )}
          </div>

          {/* Abstract illustration */}
          <div className="relative aspect-video rounded-2xl bg-gradient-to-br from-[#0D1B4B] to-[#07123A] border border-[#FDB02F]/10 overflow-hidden flex items-center justify-center">
            <div className="absolute top-1/3 left-1/4 w-1/3 h-1/3 orb orb-orange" />
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, transparent, transparent 30px, rgba(253,176,47,0.15) 30px, rgba(253,176,47,0.15) 31px), repeating-linear-gradient(90deg, transparent, transparent 30px, rgba(253,176,47,0.15) 30px, rgba(253,176,47,0.15) 31px)",
              }}
            />
            <div className="relative text-center p-8">
              <div className="font-mono text-3xl font-bold text-[#FDB02F]/20">
                WORKFLOW
              </div>
              <div className="text-base text-white/20 tracking-widest uppercase mt-2">
                Clinical Integration
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
