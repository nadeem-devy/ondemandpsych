import { ChevronDown, Play, Brain, FileText, Shield, Pill, AlertTriangle, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { NeuralBackground } from "@/components/ui/NeuralBackground";

const trustItems = [
  "No EMR integration required",
  "HIPAA-aligned workflows",
  "Clinician always in control",
  "Clinical judgment supported",
];

export function HeroSection() {
  return (
    <section className="relative flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <div className="orb orb-orange w-[600px] h-[600px] -top-20 right-[-100px]" />
        <div className="orb orb-blue w-[400px] h-[400px] bottom-[-50px] left-[-100px]" />
        <NeuralBackground />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 pt-24 pb-10 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — Content */}
          <div className="hero-animate">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#FDB02F]/30 bg-[#FDB02F]/5 mb-6">
              <span className="text-base text-[#FDB02F] font-medium">
                Built by Psychiatrists. Trusted in Real Clinical Settings.
              </span>
            </div>

            <h1 className="font-[var(--font-syne)] text-4xl sm:text-5xl lg:text-[56px] font-bold leading-[1.1] tracking-tight">
              <span className="text-white">Psychiatric Clinical</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FDB02F] to-[#FDAA40]">
                Co-Pilot
              </span>
            </h1>

            <p className="mt-5 text-base md:text-lg text-white/60 leading-relaxed max-w-lg">
              Real-time clinical decision support delivering diagnostic reasoning,
              safer prescribing, and chart-ready documentation in under 90 seconds.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-start gap-4">
              <Button href="/copilot/login" variant="primary" className="text-lg px-7 py-3.5">
                Try the Clinical Co-Pilot &rarr;
              </Button>
              <Button variant="ghost" className="text-lg">
                <Play size={16} />
                Watch Demo
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap items-start gap-x-5 gap-y-2">
              {trustItems.map((item) => (
                <div key={item} className="flex items-center gap-2 text-base text-white/45">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0">
                    <path d="M13.5 4.5L6 12L2.5 8.5" stroke="#FDB02F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Right — Co-Pilot Model Showcase */}
          <div className="relative hero-animate">
            <div className="relative rounded-2xl bg-[#0D1B4B]/80 border border-[#FDB02F]/15 backdrop-blur-sm overflow-hidden">
              {/* Top bar */}
              <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
                  <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
                  <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
                </div>
                <span className="text-base text-white/30 ml-2 font-mono">copilot.ondemandpsych.com</span>
              </div>

              {/* Mock UI */}
              <div className="p-5 space-y-4">
                {/* Input area */}
                <div className="rounded-xl bg-[#07123A]/60 border border-white/5 p-4">
                  <p className="text-lg text-white/30 font-mono mb-2">Patient Case Input</p>
                  <p className="text-base text-white/60 leading-relaxed">
                    42yo male, presenting with auditory hallucinations, paranoid ideation,
                    medication non-adherence. Hx of schizoaffective disorder. Current: Risperidone 4mg...
                  </p>
                </div>

                {/* Output cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-[#07123A]/60 border border-[#FDB02F]/10 p-3 group hover:border-[#FDB02F]/30 transition-all">
                    <Brain size={16} className="text-[#FDB02F] mb-2" />
                    <p className="text-base font-semibold text-white/80">Diagnostic Reasoning</p>
                    <p className="text-base text-white/40 mt-1">DSM-5-TR &middot; ICD-10</p>
                  </div>
                  <div className="rounded-lg bg-[#07123A]/60 border border-[#FDB02F]/10 p-3 group hover:border-[#FDB02F]/30 transition-all">
                    <Pill size={16} className="text-[#FDB02F] mb-2" />
                    <p className="text-base font-semibold text-white/80">Medication Safety</p>
                    <p className="text-base text-white/40 mt-1">212+ medications</p>
                  </div>
                  <div className="rounded-lg bg-[#07123A]/60 border border-[#FDB02F]/10 p-3 group hover:border-[#FDB02F]/30 transition-all">
                    <AlertTriangle size={16} className="text-[#FDB02F] mb-2" />
                    <p className="text-base font-semibold text-white/80">Risk Assessment</p>
                    <p className="text-base text-white/40 mt-1">SAFE-T &middot; C-SSRS</p>
                  </div>
                  <div className="rounded-lg bg-[#07123A]/60 border border-[#FDB02F]/10 p-3 group hover:border-[#FDB02F]/30 transition-all">
                    <FileText size={16} className="text-[#FDB02F] mb-2" />
                    <p className="text-base font-semibold text-white/80">Documentation</p>
                    <p className="text-base text-white/40 mt-1">&lt;90s chart-ready</p>
                  </div>
                </div>

                {/* Output preview */}
                <div className="rounded-xl bg-[#07123A]/60 border border-[#FDB02F]/10 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <ClipboardCheck size={14} className="text-[#FDB02F]" />
                    <p className="text-base font-semibold text-[#FDB02F]">Co-Pilot Output</p>
                    <span className="ml-auto text-base text-white/20 font-mono">generated in 47s</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-[#FDB02F] mt-1.5 shrink-0" />
                      <p className="text-base text-white/50">Primary: Schizoaffective disorder, bipolar type (F25.0)</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-[#FDB02F] mt-1.5 shrink-0" />
                      <p className="text-base text-white/50">Consider: Clozapine trial given treatment resistance</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-[#FDB02F] mt-1.5 shrink-0" />
                      <p className="text-base text-white/50">Risk: Moderate &mdash; safety plan recommended</p>
                    </div>
                  </div>
                </div>

                {/* Bottom bar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield size={12} className="text-[#FDB02F]/50" />
                    <span className="text-base text-white/25">HIPAA-aligned &middot; Clinician-in-the-loop</span>
                  </div>
                  <span className="text-base text-white/15 font-mono">v3.2</span>
                </div>
              </div>
            </div>

            {/* Floating glow behind the card */}
            <div className="absolute -inset-4 rounded-3xl bg-[#FDB02F]/[0.04] blur-3xl -z-10" />
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce-slow">
        <ChevronDown className="text-white/30" size={24} />
      </div>
    </section>
  );
}
