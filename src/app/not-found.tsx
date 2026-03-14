import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#07123A] flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-[#FDB02F] opacity-[0.03] blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-[#1E40AF] opacity-[0.05] blur-[100px]" />

      {/* Logo */}
      <Link href="/">
        <img src="/logo.webp" alt="OnDemandPsych" className="h-24 w-auto mb-10" />
      </Link>

      {/* 404 Number */}
      <h1
        className="text-[10rem] md:text-[14rem] font-extrabold leading-none tracking-tighter select-none"
        style={{
          background: "linear-gradient(135deg, #FDB02F 0%, rgba(253,176,47,0.2) 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        404
      </h1>

      {/* Message */}
      <h2 className="text-2xl md:text-3xl font-bold text-white mt-2 mb-3 text-center">
        Page Not Found
      </h2>
      <p className="text-white/40 text-center max-w-md mb-10 leading-relaxed">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
        Let&apos;s get you back on track.
      </p>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/"
          className="px-8 py-3.5 rounded-full bg-[#FDB02F] text-[#07123A] font-semibold text-sm hover:brightness-110 transition-all text-center"
        >
          Back to Home
        </Link>
        <Link
          href="/contact-us"
          className="px-8 py-3.5 rounded-full border border-white/15 text-white/70 font-medium text-sm hover:border-[#FDB02F]/40 hover:text-white transition-all text-center"
        >
          Contact Support
        </Link>
      </div>

      {/* Decorative line */}
      <div className="mt-16 w-48 h-px bg-gradient-to-r from-transparent via-[#FDB02F]/20 to-transparent" />

      <p className="mt-6 text-white/20 text-xs">
        OnDemandPsych — The World&apos;s First Psychiatric Clinical Co-Pilot
      </p>
    </div>
  );
}
