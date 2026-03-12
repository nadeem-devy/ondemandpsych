import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { FeaturesIntro } from "@/components/pages/features/FeaturesIntro";
import { OutcomeCards } from "@/components/pages/features/OutcomeCards";
import { CoreCapabilities } from "@/components/pages/features/CoreCapabilities";
import { KeyFeatures } from "@/components/pages/features/KeyFeatures";
import { Benefits } from "@/components/pages/features/Benefits";
import { ClosingCTA } from "@/components/sections/home/ClosingCTA";
import { getAllPageContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "Features & Benefits — Psychiatric Clinical Co-Pilot",
};

export default async function FeaturesPage() {
  const content = await getAllPageContent("features-benefits");

  return (
    <>
      <PageHero
        title={content["hero"]?.title || "Features & Benefits"}
        subtitle={content["hero"]?.subtitle || "Every feature engineered for real-world psychiatric practice"}
        breadcrumb="Features & Benefits"
      />
      <FeaturesIntro content={content["features"]} />
      <OutcomeCards />
      <CoreCapabilities />
      <KeyFeatures />
      <Benefits content={content["benefits"]} />
      <ClosingCTA />
    </>
  );
}
