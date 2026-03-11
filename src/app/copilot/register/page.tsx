"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Mail, Lock, User, Stethoscope } from "lucide-react";

const clinicalRoles = [
  "Psychiatrist",
  "Nurse Practitioner (NP)",
  "Physician Assistant (PA)",
  "Clinical Psychologist",
  "Licensed Clinical Social Worker (LCSW)",
  "Psychiatric Resident",
  "Medical Student",
  "Registered Nurse (RN)",
  "Licensed Professional Counselor (LPC)",
  "Marriage & Family Therapist (MFT)",
  "Clinical Pharmacist",
  "Program Director / Administrator",
  "Researcher / Academic",
  "Other",
];

export default function CopilotRegister() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords don't match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/copilot/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "register", email, password, name, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }
      router.push("/copilot/chat");
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#07123A] flex items-center justify-center p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#FDB02F]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#1E40AF]/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logo.webp" alt="OnDemandPsych" className="h-40 w-auto mx-auto mb-4" />
          <p className="text-white/40 text-lg">Create your clinical workspace</p>
        </div>

        <div className="bg-[#0D1B4B]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-white/50 text-base font-medium mb-2">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-lg placeholder:text-white/20 focus:outline-none focus:border-[#FDB02F]/40 focus:bg-white/[0.07] transition-all"
                  placeholder="Dr. John Smith"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-white/50 text-base font-medium mb-2">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-lg placeholder:text-white/20 focus:outline-none focus:border-[#FDB02F]/40 focus:bg-white/[0.07] transition-all"
                  placeholder="doctor@clinic.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-white/50 text-base font-medium mb-2">Clinical Role</label>
              <div className="relative">
                <Stethoscope size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-lg focus:outline-none focus:border-[#FDB02F]/40 focus:bg-white/[0.07] transition-all appearance-none cursor-pointer"
                  required
                >
                  <option value="" disabled className="bg-[#0D1B4B] text-white/40">Select your role</option>
                  {clinicalRoles.map((r) => (
                    <option key={r} value={r} className="bg-[#0D1B4B] text-white">{r}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-white/50 text-base font-medium mb-2">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-lg placeholder:text-white/20 focus:outline-none focus:border-[#FDB02F]/40 focus:bg-white/[0.07] transition-all"
                  placeholder="Create a password"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-white/50 text-base font-medium mb-2">Confirm Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-lg placeholder:text-white/20 focus:outline-none focus:border-[#FDB02F]/40 focus:bg-white/[0.07] transition-all"
                  placeholder="Confirm your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-[#FDB02F] to-[#FDAA40] text-[#07123A] font-bold text-lg hover:shadow-lg hover:shadow-[#FDB02F]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-[#07123A]/30 border-t-[#07123A] rounded-full animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/5 text-center">
            <p className="text-white/30 text-base">
              Already have an account?{" "}
              <Link href="/copilot/login" className="text-[#FDB02F] hover:text-[#FDAA40] font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
