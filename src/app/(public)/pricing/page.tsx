import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { PricingSection } from "@/components/pages/pricing/PricingSection";
import { ClosingCTA } from "@/components/sections/home/ClosingCTA";

export const metadata: Metadata = {
  title: "Membership Plans — Psychiatric Co-Pilot Pricing",
};

export default function PricingPage() {
  return (
    <>
      <PageHero
        title="Simple, Transparent Pricing"
        subtitle="Full access to the Psychiatric Clinical Co-Pilot — no hidden fees, no EMR lock-in."
        breadcrumb="Pricing"
      />
      <PricingSection />
      <ClosingCTA />
    </>
  );
}
