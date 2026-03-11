import { SectionWrapper } from "@/components/ui/SectionWrapper";
import {
  Clock,
  AlertTriangle,
  Pill,
  FileText,
  BookCheck,
  Users,
  Shield,
  Layers,
  Beaker,
  Lock,
} from "lucide-react";

const features = [
  {
    num: "01",
    icon: Clock,
    title: "24/7 Co-Pilot Clinical Decision Support",
    body: "Get instant, evidence-based diagnostic and treatment recommendations. Functions as a virtual senior consultant, improving accuracy and speed.",
  },
  {
    num: "02",
    icon: AlertTriangle,
    title: "Advanced Drug Interaction & Safety Intelligence",
    body: "Real-time scanning: interactions, contraindications, black-box warnings, QTc risks, pregnancy safety. Precise, compliant prescribing.",
  },
  {
    num: "03",
    icon: Pill,
    title: "Precision Dosing, Titration & Cross-Tapering",
    body: "Personalized algorithms for age, comorbidities, organ function, current meds. Clear, stepwise titration and cross-tapering recommendations.",
  },
  {
    num: "04",
    icon: FileText,
    title: "Intelligent Auto-Documentation in Under 90 Seconds",
    body: "Complete H&Ps, consults, progress notes, discharges \u2014 in minutes. Auto-applies accurate ICD-10 and CPT codes.",
  },
  {
    num: "05",
    icon: BookCheck,
    title: "Verified DSM-5-TR & ICD-10 Diagnostic Support",
    body: "Gold-standard diagnostic criteria built in. Sharper billing, better compliance.",
  },
  {
    num: "06",
    icon: Users,
    title: "Patient Education & Safety Summaries",
    body: "Instantly create easy-to-understand summaries of diagnoses, medications, side effects, and follow-up. Better shared decision-making.",
  },
  {
    num: "07",
    icon: Shield,
    title: "AI-Based Risk Assessment & Disposition Support",
    body: "Validated suicide, violence, and relapse-risk tools. Defensible disposition planning across inpatient, outpatient, and emergency settings.",
  },
  {
    num: "08",
    icon: Layers,
    title: "Multi-Setting Adaptability",
    body: "Optimized for inpatient, outpatient, EDs, detox, addiction programs, telepsychiatry. One platform, every workflow.",
  },
  {
    num: "09",
    icon: Beaker,
    title: "Evidence-Based Off-Label & Comorbidity Recommendations",
    body: "Evaluates complex psychiatric, medical, and substance-use overlap. Precision care even in multi-diagnostic, high-complexity cases.",
  },
  {
    num: "10",
    icon: Lock,
    title: "HIPAA-Compliant Security With Integration-Ready Design",
    body: "Fully encrypted, multi-layer authentication. EMR/EHR interoperability ready. No forced integration \u2014 works standalone today.",
  },
];

export function KeyFeatures() {
  return (
    <SectionWrapper className="py-24 bg-[#0D1B4B]">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <h2 className="font-[var(--font-syne)] text-3xl md:text-4xl font-bold text-white">
            10 Key Features
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((f) => (
            <div
              key={f.num}
              className="flex gap-5 glass-card glass-card-hover p-6 transition-all"
            >
              <div className="shrink-0">
                <span className="font-mono text-2xl font-bold text-[#FDB02F]/30">
                  {f.num}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <f.icon className="text-[#FDB02F]" size={18} />
                  <h3 className="text-sm font-bold text-white">{f.title}</h3>
                </div>
                <p className="text-sm text-white/50 leading-relaxed">
                  {f.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
