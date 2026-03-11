"use client";

import { useEffect, useRef, useState } from "react";

interface StatCounterProps {
  value: string;
  label: string;
}

export function StatCounter({ value, label }: StatCounterProps) {
  const [display, setDisplay] = useState("0");
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          animateValue();
        }
      },
      { threshold: 0.5 }
    );

    const el = ref.current;
    if (el) observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  });

  function animateValue() {
    const numericMatch = value.match(/[\d,]+/);
    if (!numericMatch) {
      setDisplay(value);
      return;
    }

    const numStr = numericMatch[0].replace(/,/g, "");
    const target = parseInt(numStr, 10);
    const prefix = value.slice(0, value.indexOf(numericMatch[0]));
    const suffix = value.slice(
      value.indexOf(numericMatch[0]) + numericMatch[0].length
    );
    const duration = 1500;
    const steps = 40;
    const stepTime = duration / steps;
    let current = 0;

    const interval = setInterval(() => {
      current += target / steps;
      if (current >= target) {
        current = target;
        clearInterval(interval);
      }
      const formatted =
        target >= 1000
          ? Math.floor(current).toLocaleString()
          : Math.floor(current).toString();
      setDisplay(`${prefix}${formatted}${suffix}`);
    }, stepTime);
  }

  return (
    <div ref={ref} className="text-center px-4">
      <div className="font-mono text-2xl md:text-3xl font-bold text-[#FDB02F]">
        {display}
      </div>
      <div className="text-sm text-white/50 mt-2">{label}</div>
    </div>
  );
}
