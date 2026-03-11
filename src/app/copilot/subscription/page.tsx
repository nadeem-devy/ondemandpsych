"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Crown,
  Zap,
  Building2,
  Sparkles,
} from "lucide-react";

const plans = [
  {
    id: "free",
    name: "FREE TRIAL",
    badge: "FREE",
    monthlyPrice: 0,
    yearlyPrice: 0,
    icon: Sparkles,
    color: "from-white/10 to-white/5",
    borderColor: "border-white/10",
    popular: false,
    features: [
      "5 clinical queries per day",
      "Basic diagnostic support",
      "Standard documentation templates",
      "Community support",
      "14-day trial period",
    ],
    bonus: null,
    bestFor: "Exploring the Co-Pilot before committing to a plan",
  },
  {
    id: "basic",
    name: "BASIC",
    badge: "STARTER",
    monthlyPrice: 149,
    yearlyPrice: 1341,
    icon: Zap,
    color: "from-blue-500/10 to-blue-500/5",
    borderColor: "border-blue-500/20",
    popular: false,
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
    id: "advanced",
    name: "ADVANCED",
    badge: "MOST POPULAR",
    monthlyPrice: 199,
    yearlyPrice: 1791,
    icon: Crown,
    color: "from-[#FDB02F]/10 to-[#FDB02F]/5",
    borderColor: "border-[#FDB02F]/30",
    popular: true,
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
    id: "premium",
    name: "PREMIUM",
    badge: "COMPLETE",
    monthlyPrice: 299,
    yearlyPrice: 2691,
    icon: Sparkles,
    color: "from-purple-500/10 to-purple-500/5",
    borderColor: "border-purple-500/20",
    popular: false,
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
  {
    id: "enterprise",
    name: "ENTERPRISE",
    badge: "INSTITUTIONAL",
    monthlyPrice: 0,
    yearlyPrice: 0,
    icon: Building2,
    color: "from-emerald-500/10 to-emerald-500/5",
    borderColor: "border-emerald-500/20",
    popular: false,
    features: [
      "Everything in Premium, plus:",
      "Multi-user team access",
      "Custom AI model training",
      "API access & EMR integration",
      "Dedicated account manager",
      "HIPAA BAA included",
      "On-premise deployment option",
      "Scalable, secure infrastructure",
    ],
    bonus: null,
    bestFor: "Hospitals, telepsychiatry networks, EMR companies, healthcare systems",
  },
];

export default function SubscriptionPage() {
  const router = useRouter();
  const [currentPlan, setCurrentPlan] = useState("free");
  const [yearly, setYearly] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/copilot/profile")
      .then((r) => {
        if (!r.ok) throw new Error("Unauthorized");
        return r.json();
      })
      .then((data) => {
        setCurrentPlan(data.plan);
        setLoading(false);
      })
      .catch(() => router.push("/copilot/login"));
  }, [router]);

  if (loading) {
    return (
      <div className="h-screen bg-[#07123A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#FDB02F]/30 border-t-[#FDB02F] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07123A]">
      {/* Header */}
      <div className="border-b border-white/5 bg-[#0A1628]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link
            href="/copilot/chat"
            className="p-2 rounded-lg text-white/40 hover:text-white/60 hover:bg-white/5 transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="flex items-center gap-3">
            <img src="/logo.webp" alt="OnDemandPsych" className="h-10 w-auto" />
            <h1 className="text-lg font-bold text-white">Subscription</h1>
            <span className="ml-2 text-base font-semibold uppercase px-2 py-0.5 rounded bg-[#FDB02F]/10 text-[#FDB02F]">
              {currentPlan}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Value banners */}
        <div className="grid md:grid-cols-2 gap-5 mb-12">
          <div className="bg-[#0D1B4B]/60 backdrop-blur-md border border-white/5 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-2">
              Membership Access to the Psychiatric Clinical Co-Pilot
            </h3>
            <p className="text-lg text-white/45 leading-relaxed">
              Full access to real-time decision support, diagnostic reasoning,
              psychopharmacology, risk assessment, and documentation tools.
            </p>
          </div>
          <div className="bg-[#0D1B4B]/60 backdrop-blur-md border border-[#FDB02F]/20 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-[#FDB02F] mb-2">
              Included Free: 360&deg; Psychopharmacology Course
            </h3>
            <p className="text-lg text-white/45 leading-relaxed">
              212+ medications, 12 pharmacologic classes, dosing, titration,
              side-effect management, interactions, high-risk populations —
              included at no extra charge.
            </p>
          </div>
        </div>

        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white font-[var(--font-syne)] mb-3">
            Choose Your Plan
          </h2>
          <p className="text-white/40 text-lg max-w-md mx-auto mb-8">
            Scale your clinical decision support as your practice grows.
            All plans include HIPAA-aligned workflows.
          </p>

          {/* Monthly/Yearly toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={`text-lg font-medium ${!yearly ? "text-white" : "text-white/40"}`}>Monthly</span>
            <button
              onClick={() => setYearly(!yearly)}
              className="relative w-14 h-7 rounded-full bg-[#0D1B4B] border border-white/10 transition-colors"
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
        </div>

        {/* Plan cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {plans.filter((p) => p.id !== "enterprise").map((plan) => {
            const isCurrent = currentPlan === plan.id;
            const Icon = plan.icon;
            const price = yearly ? plan.yearlyPrice : plan.monthlyPrice;

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-7 transition-all duration-300 flex flex-col ${
                  plan.popular
                    ? "bg-[#0D1B4B]/60 backdrop-blur-md border-2 border-[#FDB02F] shadow-[0_0_60px_rgba(253,176,47,0.15)] scale-[1.02]"
                    : "bg-[#0D1B4B]/60 backdrop-blur-md border border-white/10 hover:border-[#FDB02F]/40"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#FDB02F] text-[#07123A] text-base font-bold uppercase tracking-wider">
                    Most Popular
                  </div>
                )}

                {/* Badge */}
                <span className="inline-block w-fit px-3 py-1 rounded-full bg-[#FDB02F]/10 text-[#FDB02F] text-base font-bold mb-4">
                  {plan.badge}
                </span>

                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    plan.popular ? "bg-[#FDB02F]/20" : "bg-white/5"
                  }`}>
                    <Icon size={18} className={plan.popular ? "text-[#FDB02F]" : "text-white/50"} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">{plan.name}</h3>
                    {isCurrent && (
                      <span className="text-base text-[#FDB02F] font-semibold uppercase">Current Plan</span>
                    )}
                  </div>
                </div>

                <div className="mb-5">
                  <span className="font-mono text-4xl font-bold text-[#FDB02F]">
                    {plan.id === "free" ? "Free" : `$${price}`}
                  </span>
                  {plan.id !== "free" && (
                    <span className="text-white/30 text-lg ml-1">/{yearly ? "yr" : "mo"}</span>
                  )}
                  {plan.id === "free" && (
                    <span className="text-white/30 text-lg ml-1">/ 14 days</span>
                  )}
                </div>

                <ul className="space-y-2.5 flex-1 mb-5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <Check size={14} className={`shrink-0 mt-0.5 ${plan.popular ? "text-[#FDB02F]" : "text-white/30"}`} />
                      <span className="text-white/55 text-base leading-relaxed">{f}</span>
                    </li>
                  ))}
                </ul>

                {plan.bonus && (
                  <div className="mb-4 p-3 rounded-lg bg-[#FDB02F]/5 border border-[#FDB02F]/10">
                    <p className="text-base text-[#FDB02F]">{plan.bonus}</p>
                  </div>
                )}

                <p className="mb-5 text-lg text-white/30 italic">Best for: {plan.bestFor}</p>

                <button
                  disabled={isCurrent}
                  className={`w-full py-3 rounded-xl text-lg font-bold transition-all ${
                    isCurrent
                      ? "bg-white/5 text-white/30 cursor-not-allowed"
                      : plan.popular
                        ? "bg-[#FDB02F] text-[#07123A] hover:bg-[#FDAA40] hover:shadow-lg hover:shadow-[#FDB02F]/20"
                        : "bg-white/10 text-white hover:bg-white/15"
                  }`}
                >
                  {isCurrent ? "Current Plan" : "Get Started"}
                </button>
              </div>
            );
          })}
        </div>

        {/* Enterprise card */}
        <div className="bg-[#0D1B4B]/60 backdrop-blur-md border border-emerald-500/20 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <span className="inline-block px-3 py-1 rounded-full bg-[#FDB02F]/10 text-[#FDB02F] text-base font-bold mb-3">
              ENTERPRISE & INSTITUTIONAL
            </span>
            <h3 className="text-xl font-bold text-white mb-2">Custom Pricing</h3>
            <p className="text-lg text-white/45 leading-relaxed mb-3">
              For hospitals, telepsychiatry networks, EMR companies, and healthcare systems
              seeking scalable, secure, fully integrated Co-Pilot psychiatry infrastructure.
            </p>
            <ul className="grid grid-cols-2 gap-2">
              {plans.find((p) => p.id === "enterprise")!.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check size={12} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-white/50 text-base">{f}</span>
                </li>
              ))}
            </ul>
          </div>
          <Link
            href="/contact-us"
            className="shrink-0 px-8 py-3 rounded-xl border border-white/10 text-white text-lg font-bold hover:bg-white/5 transition-colors"
          >
            Contact Us for Pricing
          </Link>
        </div>

        <div className="mt-10 text-center">
          <p className="text-white/20 text-base">
            All plans include HIPAA-aligned workflows. Payment processing is handled securely via Stripe.
          </p>
        </div>
      </div>
    </div>
  );
}
