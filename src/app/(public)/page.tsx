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
import { getAllPageContent } from "@/lib/content";

export default async function HomePage() {
  const content = await getAllPageContent("home");

  return (
    <>
      <HeroSection content={content["hero"]} />
      <StatsBar content={content["stats"]} />
      <DeliversSection content={content["delivers"]} />
      <FeatureGrid content={content["features"]} />
      <SettingsTicker content={content["settings-ticker"]} />
      <FounderSpotlight content={content["founder-spotlight"]} />
      <WhoItsFor content={content["who-its-for"]} />
      <ThreePillars content={content["three-pillars"]} />
      <TrustSection content={content["trust"]} />
      <ClosingCTA content={content["closing-cta"]} />
    </>
  );
}
