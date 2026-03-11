import { SectionWrapper } from "@/components/ui/SectionWrapper";

const steps = [
  {
    num: "01",
    title: "Describe the Patient Case",
    items: [
      "Age & symptoms",
      "Diagnoses & comorbidities",
      "Psychiatric history",
      "Current medications & allergies",
      "Care setting",
    ],
  },
  {
    num: "02",
    title: "Receive Co-Pilot Decision Support",
    items: [
      "DSM-5-TR & ICD-10 diagnostic guidance",
      "Differential comparisons",
      "Psychopharmacology recommendations",
      "Risk frameworks",
      "Disposition guidance",
    ],
  },
  {
    num: "03",
    title: "Generate Clinical Documentation",
    items: [
      "SOAP notes, H&Ps, discharge summaries",
      "ICD-10/CPT auto-coded",
      "Ready in under 90 seconds",
    ],
  },
  {
    num: "04",
    title: "Review, Edit & Apply",
    items: [
      "Clinician reviews all output",
      "Retains full authority",
      "No EMR integration needed",
    ],
  },
];

export function HowItWorks() {
  return (
    <SectionWrapper className="py-24 bg-[#07123A]">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <h2 className="font-[var(--font-syne)] text-3xl md:text-4xl font-bold text-white">
            How It Works
          </h2>
          <p className="mt-4 text-white/50 text-xl">4 simple steps</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div key={step.num} className="relative">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-[#FDB02F]/30 to-transparent z-0" />
              )}

              <div className="glass-card p-6 relative z-10 h-full">
                <div className="w-12 h-12 rounded-xl bg-[#FDB02F]/10 flex items-center justify-center mb-4">
                  <span className="font-mono text-xl font-bold text-[#FDB02F]">
                    {step.num}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-4">
                  {step.title}
                </h3>
                <ul className="space-y-2">
                  {step.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-lg text-white/50"
                    >
                      <span className="w-1 h-1 rounded-full bg-[#FDB02F] shrink-0 mt-2" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
