import Link from "next/link";

const quickLinks = [
  { href: "/", label: "About" },
  { href: "/founder", label: "Founder" },
  { href: "/pricing", label: "Pricing" },
  { href: "/our-unique-approach-workflow", label: "Approach & Workflow" },
  { href: "/features-benefits", label: "Features & Benefits" },
];

const resources = [
  { href: "#", label: "HIPAA Compliance" },
  { href: "#", label: "Privacy Policy" },
  { href: "#", label: "Terms & Conditions" },
  { href: "#", label: "Data Protection" },
  { href: "#", label: "Cookie Policy" },
];

const support = [
  { href: "/contact-us", label: "Contact Us" },
  { href: "#", label: "FAQ" },
];

export function Footer() {
  return (
    <footer className="bg-[#07123A] border-t border-[#FDB02F]/10">
      {/* Orange gradient line */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#FDB02F]/40 to-transparent" />

      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-2">
              <img src="/logo.webp" alt="OnDemandPsych" className="h-40 w-auto" />
            </Link>
            <p className="text-sm text-white/50 leading-relaxed max-w-xs">
              The World&apos;s First Psychiatric Clinical Co-Pilot — built by a
              psychiatrist, for clinicians.
            </p>
            <div className="flex gap-3">
              {["Instagram", "X", "LinkedIn", "YouTube", "Facebook"].map(
                (social) => (
                  <a
                    key={social}
                    href="#"
                    aria-label={social}
                    className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-white/50 text-lg hover:border-[#FDB02F]/50 hover:text-[#FDB02F] transition-all"
                  >
                    {social[0]}
                  </a>
                )
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 tracking-wide">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/50 hover:text-[#FDB02F] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 tracking-wide">
              Resources
            </h4>
            <ul className="space-y-2.5">
              {resources.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/50 hover:text-[#FDB02F] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 tracking-wide">
              Support
            </h4>
            <ul className="space-y-2.5">
              {support.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/50 hover:text-[#FDB02F] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-lg text-white/30">
            &copy; 2025 On-Demand Psych. All rights reserved.
          </p>
          <p className="text-lg text-white/20">
            Built with clinical precision.
          </p>
        </div>
      </div>
    </footer>
  );
}
