import Link from "next/link";

interface PageHeroProps {
  title: string;
  subtitle?: string;
  breadcrumb: string;
}

export function PageHero({ title, subtitle, breadcrumb }: PageHeroProps) {
  return (
    <section className="relative pt-32 pb-16 bg-[#07123A]">
      <div className="absolute inset-0 overflow-hidden">
        <div className="orb orb-orange w-[400px] h-[400px] -top-40 -right-20" />
        <div className="orb orb-blue w-[300px] h-[300px] bottom-0 -left-20" />
      </div>
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="text-sm text-white/40 mb-6">
          <Link href="/" className="hover:text-[#FDB02F] transition-colors">
            Home
          </Link>
          <span className="mx-2">&rarr;</span>
          <span className="text-white/60">{breadcrumb}</span>
        </div>
        <h1 className="font-[var(--font-syne)] text-4xl md:text-5xl lg:text-6xl font-bold text-[#FDB02F]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-4 text-lg text-white/60 max-w-2xl">{subtitle}</p>
        )}
      </div>
    </section>
  );
}
