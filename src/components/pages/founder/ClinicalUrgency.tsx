import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { GlassCard } from "@/components/ui/GlassCard";
import { TrendingUp, Users, Clock, Monitor, Globe, AlertTriangle } from "lucide-react";

const urgencies = [
  {
    icon: TrendingUp,
    title: "Skyrocketing Demand",
    body: "1 in 5 Americans, 150M+ globally underserved. Mental health needs are outpacing supply at an unprecedented rate.",
  },
  {
    icon: Users,
    title: "Workforce Shortages",
    body: "Psychiatrists retiring faster than new ones enter the field. The gap between demand and available providers grows daily.",
  },
  {
    icon: Clock,
    title: "Provider Burnout",
    body: "Clinicians spend 50%+ of their time on documentation. Administrative burden drives talented providers out of practice.",
  },
  {
    icon: Monitor,
    title: "Rise of Telepsychiatry",
    body: "Remote care is expanding rapidly without subspecialty backup. Clinicians need real-time support at the point of care.",
  },
  {
    icon: AlertTriangle,
    title: "AI Already in Other Specialties",
    body: "Cardiology, oncology, primary care have AI tools. Psychiatry hasn\u2019t \u2014 until now.",
  },
  {
    icon: Globe,
    title: "Global Disparity",
    body: "1 psychiatrist per 100,000 patients in some regions. The need for scalable clinical support has never been greater.",
  },
];

export function ClinicalUrgency() {
  return (
    <SectionWrapper className="py-24 bg-[#07123A]">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <h2 className="font-[var(--font-syne)] text-3xl md:text-4xl font-bold text-white">
            Why Psychiatry Needs This Now
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {urgencies.map((u) => (
            <GlassCard key={u.title} className="p-6">
              <div className="w-12 h-12 rounded-xl bg-[#FDB02F]/10 flex items-center justify-center mb-4">
                <u.icon className="text-[#FDB02F]" size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{u.title}</h3>
              <p className="text-lg text-white/50 leading-relaxed">{u.body}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
