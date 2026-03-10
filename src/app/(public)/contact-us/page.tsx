import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { ContactForm } from "@/components/pages/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us — OnDemandPsych",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        title="Contact Us"
        subtitle="Reach the On-Demand Psychiatry team"
        breadcrumb="Contact Us"
      />
      <ContactForm />
    </>
  );
}
