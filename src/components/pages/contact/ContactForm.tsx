"use client";

import { useState } from "react";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { Button } from "@/components/ui/Button";

interface ContactFormProps {
  content?: Record<string, string>;
}

export function ContactForm({ content }: ContactFormProps) {
  const [submitted, setSubmitted] = useState(false);

  return (
    <SectionWrapper className="py-24 bg-[#07123A]">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Left */}
          <div className="space-y-6">
            <h2 className="font-[var(--font-syne)] text-3xl md:text-4xl font-bold">
              {content?.heading ? (
                <span className="text-white">{content.heading}</span>
              ) : (
                <>
                  <span className="text-white">Contact</span>{" "}
                  <span className="text-[#FDB02F]">Us</span>
                </>
              )}
            </h2>
            {content?.description ? (
              <div className="text-white/60 leading-relaxed [&_p]:mb-2" dangerouslySetInnerHTML={{ __html: content.description }} />
            ) : (
              <p className="text-white/60 leading-relaxed">
                Have questions? We&apos;d love to hear from you. Fill out the form and our team will get back to you promptly.
              </p>
            )}

            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-3 text-lg text-white/50">
                <span className="w-8 h-8 rounded-full bg-[#FDB02F]/10 flex items-center justify-center text-[#FDB02F] text-base">
                  @
                </span>
                support@ondemandpsych.com
              </div>
            </div>
          </div>

          {/* Right — Form */}
          <div>
            {submitted ? (
              <div className="glass-card p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-[#FDB02F]/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-[#FDB02F] text-2xl">&#10003;</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Message Sent!
                </h3>
                <p className="text-lg text-white/50">
                  We&apos;ll get back to you shortly.
                </p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSubmitted(true);
                }}
                className="space-y-5"
              >
                <div>
                  <label className="block text-lg text-white/60 mb-2">
                    Name <span className="text-[#FDB02F]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full bg-[#0D1B4B] border border-white/10 focus:border-[#FDB02F]/50 focus:ring-1 focus:ring-[#FDB02F]/30 rounded-lg px-4 py-3 text-white placeholder:text-white/30 outline-none transition-all"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-lg text-white/60 mb-2">
                    Email <span className="text-[#FDB02F]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full bg-[#0D1B4B] border border-white/10 focus:border-[#FDB02F]/50 focus:ring-1 focus:ring-[#FDB02F]/30 rounded-lg px-4 py-3 text-white placeholder:text-white/30 outline-none transition-all"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-lg text-white/60 mb-2">
                    Role
                  </label>
                  <input
                    type="text"
                    className="w-full bg-[#0D1B4B] border border-white/10 focus:border-[#FDB02F]/50 focus:ring-1 focus:ring-[#FDB02F]/30 rounded-lg px-4 py-3 text-white placeholder:text-white/30 outline-none transition-all"
                    placeholder="Psychiatrist, PMHNP, PA, administrator, other..."
                  />
                </div>
                <div>
                  <label className="block text-lg text-white/60 mb-2">
                    Message
                  </label>
                  <textarea
                    rows={5}
                    className="w-full bg-[#0D1B4B] border border-white/10 focus:border-[#FDB02F]/50 focus:ring-1 focus:ring-[#FDB02F]/30 rounded-lg px-4 py-3 text-white placeholder:text-white/30 outline-none transition-all resize-none"
                    placeholder="How can we help?"
                  />
                </div>
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => {}}
                >
                  Send Message &rarr;
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
