"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/founder", label: "Founder" },
  { href: "/our-unique-approach-workflow", label: "Approach & Workflow" },
  { href: "/pricing", label: "Pricing" },
  { href: "/features-benefits", label: "Features & Benefits" },
  { href: "/blog", label: "Blog" },
  { href: "/contact-us", label: "Contact Us" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#07123A]/85 backdrop-blur-xl shadow-lg shadow-black/20"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto max-w-7xl flex items-center justify-between px-6 h-[100px]">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <img src="/logo.webp" alt="OnDemandPsych" className="h-40 w-auto" />
        </Link>

        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? "text-[#FDB02F] font-semibold" : "text-white/70 hover:text-white"
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#FDB02F] rounded-full" />
                )}
              </Link>
            );
          })}
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <Link href="/copilot/login"
            className="px-5 py-2 text-sm font-medium text-[#FDB02F] border border-[#FDB02F]/40 rounded-lg hover:bg-[#FDB02F]/10 transition-all">
            Login
          </Link>
          <Link href="/copilot/register"
            className="px-5 py-2 text-sm font-bold text-[#07123A] bg-[#FDB02F] rounded-lg hover:bg-[#FDAA40] hover:shadow-[0_0_20px_rgba(253,176,47,0.4)] transition-all">
            Sign Up
          </Link>
        </div>

        <button className="lg:hidden text-white/80 hover:text-white p-2" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="lg:hidden bg-[#07123A]/95 backdrop-blur-xl border-t border-white/5">
          <div className="px-6 py-4 space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link key={link.href} href={link.href}
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? "text-[#FDB02F] bg-[#FDB02F]/10" : "text-white/70 hover:text-white hover:bg-white/5"
                  }`}>
                  {link.label}
                </Link>
              );
            })}
            <div className="pt-4 space-y-2 border-t border-white/10">
              <Link href="/copilot/login"
                className="block w-full text-center px-5 py-3 text-sm font-medium text-[#FDB02F] border border-[#FDB02F]/40 rounded-lg">
                Login
              </Link>
              <Link href="/copilot/register"
                className="block w-full text-center px-5 py-3 text-sm font-bold text-[#07123A] bg-[#FDB02F] rounded-lg">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
