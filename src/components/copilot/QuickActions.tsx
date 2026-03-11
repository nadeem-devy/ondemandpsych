"use client";

import { useState } from "react";
import {
  AArrowUp,
  AArrowDown,
  Sun,
  Moon,
  Headset,
  Type,
} from "lucide-react";

interface QuickActionsProps {
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  theme: "dark" | "light";
  onThemeToggle: () => void;
  onOpenSupport: () => void;
  mobile?: boolean;
}

const FONT_SIZES = [
  { label: "S", value: 13 },
  { label: "M", value: 15 },
  { label: "L", value: 17 },
  { label: "XL", value: 20 },
];

export function QuickActions({
  fontSize,
  onFontSizeChange,
  theme,
  onThemeToggle,
  onOpenSupport,
  mobile,
}: QuickActionsProps) {
  const [showFontPicker, setShowFontPicker] = useState(false);

  function increaseFontSize() {
    const idx = FONT_SIZES.findIndex((f) => f.value >= fontSize);
    const next = idx < FONT_SIZES.length - 1 ? idx + 1 : idx;
    onFontSizeChange(FONT_SIZES[next].value);
  }

  function decreaseFontSize() {
    const idx = FONT_SIZES.findIndex((f) => f.value >= fontSize);
    const prev = idx > 0 ? idx - 1 : 0;
    onFontSizeChange(FONT_SIZES[prev].value);
  }

  // Mobile: inline horizontal buttons in top bar
  if (mobile) {
    return (
      <div className="flex items-center gap-1.5">
        {/* Font size */}
        <div className="relative">
          <button
            onClick={() => setShowFontPicker(!showFontPicker)}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              theme === "dark"
                ? "text-white/50 hover:text-white/80 hover:bg-white/5"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Type size={16} />
          </button>

          {showFontPicker && (
            <>
              <div className="fixed inset-0 z-50" onClick={() => setShowFontPicker(false)} />
              <div
                className={`absolute right-0 top-full mt-2 rounded-xl p-2 flex items-center gap-1 shadow-xl z-50 ${
                  theme === "dark"
                    ? "bg-[#0D1B4B] border border-white/10"
                    : "bg-white border border-gray-200"
                }`}
              >
                <button
                  onClick={decreaseFontSize}
                  className={`p-2 rounded-lg transition-colors ${
                    theme === "dark"
                      ? "text-white/50 hover:text-white hover:bg-white/10"
                      : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  }`}
                >
                  <AArrowDown size={14} />
                </button>
                {FONT_SIZES.map((f) => (
                  <button
                    key={f.label}
                    onClick={() => { onFontSizeChange(f.value); setShowFontPicker(false); }}
                    className={`w-8 h-8 rounded-lg text-xl font-bold transition-all ${
                      fontSize === f.value
                        ? "bg-[#FDB02F] text-[#07123A]"
                        : theme === "dark"
                          ? "text-white/40 hover:text-white/70 hover:bg-white/5"
                          : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
                <button
                  onClick={increaseFontSize}
                  className={`p-2 rounded-lg transition-colors ${
                    theme === "dark"
                      ? "text-white/50 hover:text-white hover:bg-white/10"
                      : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  }`}
                >
                  <AArrowUp size={14} />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Theme toggle */}
        <button
          onClick={onThemeToggle}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
            theme === "dark"
              ? "text-white/50 hover:text-[#FDB02F]"
              : "text-gray-500 hover:text-[#FDB02F]"
          }`}
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Support */}
        <button
          onClick={onOpenSupport}
          className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#FDB02F]/10 text-[#FDB02F] hover:bg-[#FDB02F]/20 transition-all"
        >
          <Headset size={16} />
        </button>
      </div>
    );
  }

  // Desktop: vertical fixed sidebar
  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2">
      {/* Font size controls */}
      <div className="relative">
        <button
          onClick={() => setShowFontPicker(!showFontPicker)}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-lg ${
            theme === "dark"
              ? "bg-[#0D1B4B] border border-white/10 text-white/50 hover:text-white/80 hover:border-white/20"
              : "bg-white border border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300 shadow-md"
          }`}
          title="Font Size"
        >
          <Type size={16} />
        </button>

        {showFontPicker && (
          <div
            className={`absolute right-12 top-1/2 -translate-y-1/2 rounded-xl p-2 flex items-center gap-1 shadow-xl ${
              theme === "dark"
                ? "bg-[#0D1B4B] border border-white/10"
                : "bg-white border border-gray-200"
            }`}
          >
            <button
              onClick={decreaseFontSize}
              className={`p-2 rounded-lg transition-colors ${
                theme === "dark"
                  ? "text-white/50 hover:text-white hover:bg-white/10"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              }`}
            >
              <AArrowDown size={14} />
            </button>

            {FONT_SIZES.map((f) => (
              <button
                key={f.label}
                onClick={() => { onFontSizeChange(f.value); setShowFontPicker(false); }}
                className={`w-8 h-8 rounded-lg text-xl font-bold transition-all ${
                  fontSize === f.value
                    ? "bg-[#FDB02F] text-[#07123A]"
                    : theme === "dark"
                      ? "text-white/40 hover:text-white/70 hover:bg-white/5"
                      : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                {f.label}
              </button>
            ))}

            <button
              onClick={increaseFontSize}
              className={`p-2 rounded-lg transition-colors ${
                theme === "dark"
                  ? "text-white/50 hover:text-white hover:bg-white/10"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              }`}
            >
              <AArrowUp size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Theme toggle */}
      <button
        onClick={onThemeToggle}
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-lg ${
          theme === "dark"
            ? "bg-[#0D1B4B] border border-white/10 text-white/50 hover:text-[#FDB02F] hover:border-[#FDB02F]/30"
            : "bg-white border border-gray-200 text-gray-500 hover:text-[#FDB02F] hover:border-[#FDB02F]/30 shadow-md"
        }`}
        title={theme === "dark" ? "Light Mode" : "Dark Mode"}
      >
        {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      {/* Support chat */}
      <button
        onClick={onOpenSupport}
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-lg ${
          theme === "dark"
            ? "bg-[#FDB02F]/10 border border-[#FDB02F]/20 text-[#FDB02F] hover:bg-[#FDB02F]/20 hover:border-[#FDB02F]/40"
            : "bg-[#FDB02F]/10 border border-[#FDB02F]/20 text-[#FDB02F] hover:bg-[#FDB02F]/20 shadow-md"
        }`}
        title="Chat with Support"
      >
        <Headset size={16} />
      </button>
    </div>
  );
}
