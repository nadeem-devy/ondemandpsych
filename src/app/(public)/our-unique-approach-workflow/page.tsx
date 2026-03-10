import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { WorkflowIntro } from "@/components/pages/workflow/WorkflowIntro";
import { CareSettings } from "@/components/pages/workflow/CareSettings";
import { HowItWorks } from "@/components/pages/workflow/HowItWorks";
import { ClosingCTA } from "@/components/sections/home/ClosingCTA";

export const metadata: Metadata = {
  title: "Approach & Workflow — How the Co-Pilot Works",
};

export default function WorkflowPage() {
  return (
    <>
      <PageHero
        title="Approach & Workflow"
        subtitle="How the Psychiatric Clinical Co-Pilot Fits Into Every Clinical Visit"
        breadcrumb="Approach & Workflow"
      />
      <WorkflowIntro />
      <CareSettings />
      <HowItWorks />
      <ClosingCTA />
    </>
  );
}
