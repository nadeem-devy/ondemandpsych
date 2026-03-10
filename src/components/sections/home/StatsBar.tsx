"use client";

import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { StatCounter } from "@/components/ui/StatCounter";

const stats = [
  { value: "70-90%", label: "Documentation time reduced" },
  { value: "100,000+", label: "Real patient encounters" },
  { value: "212+", label: "Psychiatric medications" },
  { value: "30+", label: "Subspecialties covered" },
];

export function StatsBar() {
  return (
    <SectionWrapper className="relative border-y border-[#FDB02F]/10 bg-gradient-to-r from-[#07123A] via-[#0D1B4B] to-[#07123A]">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <StatCounter key={stat.label} value={stat.value} label={stat.label} />
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
