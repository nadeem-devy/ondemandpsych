import { HeroSection } from "@/components/sections/home/HeroSection";
import { StatsBar } from "@/components/sections/home/StatsBar";
import { DeliversSection } from "@/components/sections/home/DeliversSection";
import { FeatureGrid } from "@/components/sections/home/FeatureGrid";
import { SettingsTicker } from "@/components/sections/home/SettingsTicker";
import { FounderSpotlight } from "@/components/sections/home/FounderSpotlight";
import { WhoItsFor } from "@/components/sections/home/WhoItsFor";
import { ThreePillars } from "@/components/sections/home/ThreePillars";
import { TrustSection } from "@/components/sections/home/TrustSection";
import { ClosingCTA } from "@/components/sections/home/ClosingCTA";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsBar />
      <DeliversSection />
      <FeatureGrid />
      <SettingsTicker />
      <FounderSpotlight />
      <WhoItsFor />
      <ThreePillars />
      <TrustSection />
      <ClosingCTA />
    </>
  );
}
