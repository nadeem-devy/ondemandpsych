import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { ContactForm } from "@/components/pages/contact/ContactForm";
import { getAllPageContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact Us — OnDemandPsych",
};

export default async function ContactPage() {
  const content = await getAllPageContent("contact-us");

  return (
    <>
      <PageHero
        title={content["hero"]?.title || "Contact Us"}
        subtitle={content["hero"]?.subtitle || "Reach the On-Demand Psychiatry team"}
        breadcrumb="Contact Us"
      />
      <ContactForm content={content["form"]} />
    </>
  );
}
