import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { PricingSection } from "@/components/pages/pricing/PricingSection";
import { ClosingCTA } from "@/components/sections/home/ClosingCTA";
import { getAllPageContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "Membership Plans — Psychiatric Co-Pilot Pricing",
};

export default async function PricingPage() {
  const content = await getAllPageContent("pricing");

  return (
    <>
      <PageHero
        title={content["hero"]?.title || "Simple, Transparent Pricing"}
        subtitle={content["hero"]?.subtitle || "Full access to the Psychiatric Clinical Co-Pilot — no hidden fees, no EMR lock-in."}
        breadcrumb="Pricing"
      />
      <PricingSection content={content["plans"]} />
      <ClosingCTA />
    </>
  );
}
