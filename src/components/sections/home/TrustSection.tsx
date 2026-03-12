import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { Button } from "@/components/ui/Button";
import {
  TrendingDown,
  TrendingUp,
  Lock,
  ClipboardList,
  Link2,
  Eye,
} from "lucide-react";

export function TrustSection({ content }: { content?: Record<string, string> }) {
  return (
    <SectionWrapper className="py-24 bg-[#0D1B4B]">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left — Clinical Impact */}
          <div className="bg-[#07123A] rounded-2xl border border-white/5 p-8 space-y-6">
            <h3 className="font-[var(--font-syne)] text-2xl font-bold text-white">
              {content?.heading || "Clinical Impact & Efficiency"}
            </h3>
            <div className="space-y-4">
              {[
                {
                  icon: TrendingDown,
                  label: "Documentation Time",
                  dir: "\u2193",
                },
                {
                  icon: TrendingDown,
                  label: "Provider Burnout",
                  dir: "\u2193",
                },
                {
                  icon: TrendingUp,
                  label: "Patient Throughput",
                  dir: "\u2191",
                },
                {
                  icon: TrendingUp,
                  label: "Clinical Safety",
                  dir: "\u2191",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-4 p-3 rounded-lg bg-white/[0.02] border border-white/5"
                >
                  <item.icon className="text-[#FDB02F] shrink-0" size={20} />
                  <span className="text-lg text-white/70 flex-1">
                    {item.label}
                  </span>
                  <span className="font-mono text-[#FDB02F] font-bold">
                    {item.dir}
                  </span>
                </div>
              ))}
            </div>
            <Button
              href="/copilot/login"
             
              className="mt-2"
            >
              Get Started
            </Button>
          </div>

          {/* Right — Trust */}
          <div className="bg-[#07123A] rounded-2xl border border-white/5 p-8 space-y-6">
            <h3 className="font-[var(--font-syne)] text-2xl font-bold text-white">
              Trust, Compliance & Integration
            </h3>
            <div className="space-y-4">
              {[
                { icon: Lock, label: "Enterprise Security" },
                { icon: ClipboardList, label: "HIPAA Governance" },
                {
                  icon: Link2,
                  label: "Integration-Ready (no EMR lock-in)",
                },
                { icon: Eye, label: "Full Clinical Oversight" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-4 p-3 rounded-lg bg-white/[0.02] border border-white/5"
                >
                  <item.icon className="text-[#FDB02F] shrink-0" size={20} />
                  <span className="text-lg text-white/70">{item.label}</span>
                </div>
              ))}
            </div>
            <Button
              href="/copilot/login"
             
              className="mt-2"
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
