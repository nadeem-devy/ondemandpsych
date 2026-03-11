import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "outline" | "ghost" | "dark";
  href?: string;
  className?: string;
  external?: boolean;
  onClick?: () => void;
}

export function Button({
  children,
  variant = "primary",
  href,
  className = "",
  external = false,
  onClick,
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg text-sm font-bold transition-all duration-300 cursor-pointer";

  const variants = {
    primary:
      "bg-[#FDB02F] text-[#07123A] hover:bg-[#FDAA40] hover:shadow-[0_0_40px_rgba(253,176,47,0.5)] hover:scale-105",
    outline:
      "border border-[#FDB02F]/40 text-[#FDB02F] hover:bg-[#FDB02F]/10 hover:border-[#FDB02F]/60",
    ghost: "text-white/70 hover:text-white hover:bg-white/5",
    dark: "bg-[#07123A] text-white hover:bg-[#0D1B4B] hover:shadow-lg",
  };

  const classes = `${base} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <a
        href={href}
        className={classes}
        {...(external
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
      >
        {children}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
