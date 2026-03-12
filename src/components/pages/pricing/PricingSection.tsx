"use client";

import { useState } from "react";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { Button } from "@/components/ui/Button";
import { Check } from "lucide-react";

const plans = [
  {
    name: "BASIC",
    badge: "STARTER",
    monthlyPrice: 149,
    yearlyPrice: 1341,
    featured: false,
    features: [
      "Apps & Devices",
      "Treatment Protocols",
      "Drug Information, Dosing & Tapering Guidance",
      "Side Effects & Lab Monitoring",
      "Child & Adolescent Psychiatry",
      "Geriatric Psychiatry",
      "Outpatient Psychiatry",
      "Emergency Psychiatry",
      "Psychiatric Evaluation & MSE",
      "Psychotherapy Basics",
      "Rating Scales (RS)",
      "Patient Education",
      "Ethics, Professional Conduct & References",
    ],
    bonus: "150 Psychiatry Lectures \u00B7 30,000 Exam Questions \u00B7 212 PowerPoints & Videos",
    bestFor: "Foundational training, treatment planning, mastering evidence-based psychiatry",
  },
  {
    name: "ADVANCED",
    badge: "MOST POPULAR",
    monthlyPrice: 199,
    yearlyPrice: 1791,
    featured: true,
    features: [
      "Everything in Basic, plus:",
      "Billing Optimization & Revenue Tools",
      "Cognitive Enhancement & Neurostimulation",
      "Complex Case Management",
      "Consultation-Liaison (C/L) Psychiatry",
      "Disability & Functional Impairment Evaluation",
      "Documentation & Compliance Tools",
      "Drug Interactions & Cross-Titration",
      "Emergency Psychiatry (Advanced Tools)",
      "Geriatric Psychiatry (Expanded Protocols)",
      "Guideline Integration (APA, NICE, Maudsley)",
      "Inpatient Psychiatry",
      "Neuropsychiatry & Cognition",
      "Quality Assurance, Audit & Peer Review",
    ],
    bonus: null,
    bestFor: "Practicing clinicians managing complex/treatment-resistant cases",
  },
  {
    name: "PREMIUM",
    badge: "COMPLETE",
    monthlyPrice: 299,
    yearlyPrice: 2691,
    featured: false,
    features: [
      "Everything in Basic + Advanced, plus:",
      "Administrative, Supervisory & Teaching Tools",
      "Discharge Planning & Continuity of Care",
      "Ethics, Professionalism & Clinical Leadership",
      "Insurance & Preauthorization Tools",
      "Integrated Care & Collaborative Psychiatry",
      "Pharmacogenomics & Precision Medicine",
      "Psychiatric Rehabilitation & Recovery",
      "Dual Diagnosis & Substance Use Disorders",
      "Continuity of Care & Relapse Prevention",
      "Translational Neuroscience & Future Directions",
    ],
    bonus: null,
    bestFor: "Physicians, clinical leaders, healthcare organizations",
  },
];

interface PricingSectionProps {
  content?: Record<string, string>;
}

export function PricingSection({ content }: PricingSectionProps) {
  const [yearly, setYearly] = useState(false);

  return (
    <SectionWrapper className="py-24 bg-[#07123A]">
      <div className="mx-auto max-w-7xl px-6">
        {/* Value banner */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          <div className="glass-card p-8">
            <h3 className="text-xl font-bold text-white mb-3">
              {content?.heading || "Membership Access to the Psychiatric Clinical Co-Pilot"}
            </h3>
            {content?.content ? (
              <div
                className="text-lg text-white/50 leading-relaxed prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: content.content }}
              />
            ) : (
              <p className="text-lg text-white/50 leading-relaxed">
                Full access to real-time decision support, diagnostic reasoning,
                psychopharmacology, risk assessment, and documentation tools.
              </p>
            )}
          </div>
          <div className="glass-card p-8 border-[#FDB02F]/30">
            <h3 className="text-xl font-bold text-[#FDB02F] mb-3">
              Included Free: 360&deg; Psychopharmacology Course
            </h3>
            <p className="text-lg text-white/50 leading-relaxed">
              212+ medications, 12 pharmacologic classes, dosing, titration,
              side-effect management, interactions, high-risk populations —
              included at no extra charge.
            </p>
          </div>
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-4 mb-16">
          <span className={`text-lg font-medium ${!yearly ? "text-white" : "text-white/40"}`}>
            Monthly
          </span>
          <button
            onClick={() => setYearly(!yearly)}
            className="relative w-14 h-7 rounded-full bg-[#0D1B4B] border border-white/10 transition-colors"
            aria-label="Toggle pricing period"
          >
            <div
              className={`absolute top-0.5 w-6 h-6 rounded-full bg-[#FDB02F] transition-transform ${
                yearly ? "translate-x-7" : "translate-x-0.5"
              }`}
            />
          </button>
          <span className={`text-lg font-medium ${yearly ? "text-white" : "text-white/40"}`}>
            Yearly <span className="text-[#FDB02F] text-base">(Save 25%)</span>
          </span>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 transition-all duration-300 ${
                plan.featured
                  ? "bg-[#0D1B4B]/60 backdrop-blur-md border-2 border-[#FDB02F] shadow-[0_0_60px_rgba(253,176,47,0.15)] scale-[1.02]"
                  : "bg-[#0D1B4B]/60 backdrop-blur-md border border-[#FDB02F]/10 hover:border-[#FDB02F]/40"
              }`}
            >
              {/* Badge */}
              <span className="inline-block px-3 py-1 rounded-full bg-[#FDB02F]/10 text-[#FDB02F] text-base font-bold mb-4">
                {plan.badge}
              </span>

              <h3 className="text-2xl font-bold text-white">{plan.name}</h3>

              {/* Price */}
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-mono text-4xl font-bold text-[#FDB02F]">
                  ${yearly ? plan.yearlyPrice : plan.monthlyPrice}
                </span>
                <span className="text-lg text-white/40">
                  /{yearly ? "yr" : "mo"}
                </span>
              </div>

              {/* Features */}
              <ul className="mt-6 space-y-2.5">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-lg text-white/60"
                  >
                    <Check
                      size={16}
                      className="text-[#FDB02F] shrink-0 mt-0.5"
                    />
                    {f}
                  </li>
                ))}
              </ul>

              {plan.bonus && (
                <div className="mt-4 p-3 rounded-lg bg-[#FDB02F]/5 border border-[#FDB02F]/10">
                  <p className="text-base text-[#FDB02F]">{plan.bonus}</p>
                </div>
              )}

              <p className="mt-4 text-base text-white/40 italic">
                Best for: {plan.bestFor}
              </p>

              <div className="mt-6">
                <Button
                  href="/copilot/register"
                 
                  variant={plan.featured ? "primary" : "outline"}
                  className="w-full"
                >
                  Get Started
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Enterprise */}
        <div className="glass-card p-8 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <span className="inline-block px-3 py-1 rounded-full bg-[#FDB02F]/10 text-[#FDB02F] text-base font-bold mb-3">
              ENTERPRISE & INSTITUTIONAL
            </span>
            <h3 className="text-xl font-bold text-white mb-2">
              Custom Pricing
            </h3>
            <p className="text-lg text-white/50 leading-relaxed">
              For hospitals, telepsychiatry networks, EMR companies, and
              healthcare systems seeking scalable, secure, fully integrated
              Co-Pilot psychiatry infrastructure.
            </p>
          </div>
          <Button href="/contact-us" variant="outline" className="shrink-0">
            Contact Us for Pricing
          </Button>
        </div>
      </div>
    </SectionWrapper>
  );
}
