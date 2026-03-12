import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { FounderBio } from "@/components/pages/founder/FounderBio";
import { ClinicalGaps } from "@/components/pages/founder/ClinicalGaps";
import { ClinicalUrgency } from "@/components/pages/founder/ClinicalUrgency";
import { SolutionSection } from "@/components/pages/founder/SolutionSection";
import { Capabilities90 } from "@/components/pages/founder/Capabilities90";
import { ClosingCTA } from "@/components/sections/home/ClosingCTA";
import { getAllPageContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "Meet the Founder — Dr. Tanveer A. Padder, MD",
};

export default async function FounderPage() {
  const content = await getAllPageContent("founder");
  return (
    <>
      <PageHero
        title={content["hero"]?.title || "Meet the Founder"}
        subtitle={content["hero"]?.subtitle || "Dr. Tanveer A. Padder, MD"}
        breadcrumb="Founder"
      />
      <FounderBio content={content["bio"]} />
      <ClinicalGaps content={content["clinical-gaps"]} />
      <ClinicalUrgency content={content["clinical-urgency"]} />
      <SolutionSection content={content["solution"]} />
      <Capabilities90 content={content["capabilities"]} />
      <ClosingCTA />
    </>
  );
}
