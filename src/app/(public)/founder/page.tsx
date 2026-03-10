import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { FounderBio } from "@/components/pages/founder/FounderBio";
import { ClinicalGaps } from "@/components/pages/founder/ClinicalGaps";
import { ClinicalUrgency } from "@/components/pages/founder/ClinicalUrgency";
import { SolutionSection } from "@/components/pages/founder/SolutionSection";
import { Capabilities90 } from "@/components/pages/founder/Capabilities90";
import { ClosingCTA } from "@/components/sections/home/ClosingCTA";

export const metadata: Metadata = {
  title: "Meet the Founder — Dr. Tanveer A. Padder, MD",
};

export default function FounderPage() {
  return (
    <>
      <PageHero
        title="Meet the Founder"
        subtitle="Dr. Tanveer A. Padder, MD"
        breadcrumb="Founder"
      />
      <FounderBio />
      <ClinicalGaps />
      <ClinicalUrgency />
      <SolutionSection />
      <Capabilities90 />
      <ClosingCTA />
    </>
  );
}
