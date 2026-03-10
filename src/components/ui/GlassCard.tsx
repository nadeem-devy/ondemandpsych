import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({ children, className = "", hover = true }: GlassCardProps) {
  return (
    <div
      className={`glass-card ${hover ? "glass-card-hover" : ""} p-6 transition-all duration-300 ${
        hover ? "hover:shadow-[0_0_40px_rgba(253,176,47,0.1)] hover:scale-[1.02]" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
