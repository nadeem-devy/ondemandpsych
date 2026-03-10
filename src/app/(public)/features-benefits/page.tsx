import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { FeaturesIntro } from "@/components/pages/features/FeaturesIntro";
import { OutcomeCards } from "@/components/pages/features/OutcomeCards";
import { CoreCapabilities } from "@/components/pages/features/CoreCapabilities";
import { KeyFeatures } from "@/components/pages/features/KeyFeatures";
import { Benefits } from "@/components/pages/features/Benefits";
import { ClosingCTA } from "@/components/sections/home/ClosingCTA";

export const metadata: Metadata = {
  title: "Features & Benefits — Psychiatric Clinical Co-Pilot",
};

export default function FeaturesPage() {
  return (
    <>
      <PageHero
        title="Features & Benefits"
        subtitle="Every feature engineered for real-world psychiatric practice"
        breadcrumb="Features & Benefits"
      />
      <FeaturesIntro />
      <OutcomeCards />
      <CoreCapabilities />
      <KeyFeatures />
      <Benefits />
      <ClosingCTA />
    </>
  );
}
