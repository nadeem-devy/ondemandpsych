import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { GlassCard } from "@/components/ui/GlassCard";

const settings = [
  {
    title: "Individual Clinicians",
    audience: "Psychiatrists, PMHNPs, PAs, & other Mental Health Professionals",
    bullets: [
      "Real-time co-pilot for thinking, deciding, and documenting",
      "70\u201390% faster documentation \u2014 2\u20133 hours saved per day",
      "DSM-5-TR / ICD-10 diagnostic reasoning with structured differentials",
      "Medication safety, polypharmacy, cross-tapers, TRD rationale",
      "CMS-compliant notes produced in less than 90 seconds",
      "No EMR integration | Complete clinical independence",
    ],
  },
  {
    title: "Consultation-Liaison (C-L) Psychiatry",
    audience: "Hospital-based psychiatric consultants",
    bullets: [
      "Decision support in complex medical-psychiatric cases",
      "Better psychotropic selections in medically ill patients",
      "Structured capacity, suicide-risk, agitation, and withdrawal reasoning",
      "Fast, clear, defensible consult documentation",
      "Standardized quality across clinicians and shifts",
    ],
  },
  {
    title: "Crisis Stabilization Units (CSU)",
    audience: "Crisis stabilization & short-stay facilities",
    bullets: [
      "Quick rationalization during critical crisis encounters",
      "\u201CDon\u2019t miss\u201D risk signals for pre-disposition decisions",
      "Distinguishes intoxication, withdrawal, and primary illness",
      "Suicide and violence risk reasoning with defensible documentation",
      "Safer drug decisions in brief-stay situations",
    ],
  },
  {
    title: "Detox & Rehab Programs",
    audience: "Addiction medicine & rehabilitation centers",
    bullets: [
      "Reasoning support during intoxication and withdrawal",
      "Differentiates substance-induced vs. primary psychiatric symptoms",
      "Safer management of alcohol, opioids, benzodiazepines, and stimulants",
      "Dual-diagnosis treatment without relapse risk amplification",
      "MAT initiation and continuation support",
    ],
  },
  {
    title: "Emergency Psychiatry / ED",
    audience: "Emergency departments & psychiatric emergency services",
    bullets: [
      "Rapid clinical reasoning under extreme time constraints",
      "Structured triage, risk, and disposition logic",
      "Suicide, violence, capacity, and involuntary hold guidance",
      "Differentiates delirium, intoxication, withdrawal, and psychosis",
      "Documentation ready in 60\u201390 seconds",
    ],
  },
  {
    title: "Inpatient Psychiatry",
    audience: "Psychiatric inpatient units & hospitals",
    bullets: [
      "Bedside decision support for safety and disposition",
      "De-escalation and crisis decision support",
      "Safer dosing, adjustments, switching, and cross-tapering",
      "Real-time monitoring alerts",
      "Minimizes patient information gaps during shift change",
    ],
  },
  {
    title: "Outpatient & Telepsychiatry",
    audience: "Outpatient clinics & telehealth providers",
    bullets: [
      "Structured reasoning during brief visits",
      "DSM-5-TR aligned diagnostics and differentials",
      "Intentional sequencing, augmentation, and deprescribing",
      "Safe switching, tapering, and cross-titration",
      "Crisis-between-visits decision support",
    ],
  },
  {
    title: "Primary Care",
    audience: "Primary care physicians & family medicine",
    bullets: [
      "Point-of-care psychiatric decision support",
      "Distinguishes mood, anxiety, trauma, ADHD, sleep, and substance effects",
      "Identifies bipolar, psychosis, and substance-induced red flags",
      "Safer initiations, titrations, and switches",
      "Unambiguous treat-vs-refer guidance",
    ],
  },
  {
    title: "Psychiatry Residency Programs",
    audience: "Academic training programs",
    bullets: [
      "Integrates daily training with structured reasoning",
      "Lets attendings review resident thinking",
      "Facilitates safe prescribing and risk assessment",
      "Draft documentation for resident editing",
      "Consistent quality throughout rotations",
    ],
  },
  {
    title: "Residential, Group Home & Detention",
    audience: "Residential facilities, group homes, and detention centers",
    bullets: [
      "Structured reasoning in continuous-risk environments",
      "Polypharmacy and medication oversight made safer",
      "De-escalation and crisis guidance prior to transfer",
      "Documentation ready for audits, incidents, and courts",
    ],
  },
];

export function CareSettings() {
  return (
    <SectionWrapper className="py-24 bg-[#0D1B4B]">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <h2 className="font-[var(--font-syne)] text-3xl md:text-4xl font-bold text-white">
            10 Care Settings, One Co-Pilot
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {settings.map((s) => (
            <GlassCard key={s.title} className="p-6">
              <h3 className="text-lg font-bold text-[#FDB02F] mb-1">
                {s.title}
              </h3>
              <p className="text-lg text-white/40 mb-4">({s.audience})</p>
              <ul className="space-y-2">
                {s.bullets.map((b) => (
                  <li
                    key={b}
                    className="flex items-start gap-2 text-sm text-white/60"
                  >
                    <span className="w-1 h-1 rounded-full bg-[#FDB02F] shrink-0 mt-2" />
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
