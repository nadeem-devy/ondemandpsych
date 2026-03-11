"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Lock, ShieldCheck } from "lucide-react";

type Step = "email" | "otp" | "reset" | "done";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/copilot/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", email, type: "password_reset" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send reset code");
        setLoading(false);
        return;
      }
      setStep("otp");
    } catch {
      setError("Something went wrong");
    }
    setLoading(false);
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/copilot/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", email, code: otp, type: "password_reset" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid code");
        setLoading(false);
        return;
      }
      setStep("reset");
    } catch {
      setError("Something went wrong");
    }
    setLoading(false);
  }

  async function handleResetPassword(e: React.FormEvent) {
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
        body: JSON.stringify({ action: "reset_password", email, newPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to reset password");
        setLoading(false);
        return;
      }
      setStep("done");
    } catch {
      setError("Something went wrong");
    }
    setLoading(false);
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
          <p className="text-white/40 text-sm">
            {step === "email" && "Enter your email to reset your password"}
            {step === "otp" && "Enter the 6-digit code sent to your email"}
            {step === "reset" && "Set your new password"}
            {step === "done" && "Password reset successful!"}
          </p>
        </div>

        <div className="bg-[#0D1B4B]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm mb-5">
              {error}
            </div>
          )}

          {/* Step 1: Email */}
          {step === "email" && (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <label className="block text-white/50 text-lg font-medium mb-2">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#FDB02F]/40 focus:bg-white/[0.07] transition-all"
                    placeholder="doctor@clinic.com"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#FDB02F] to-[#FDAA40] text-[#07123A] font-bold text-sm hover:shadow-lg hover:shadow-[#FDB02F]/20 transition-all disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Reset Code"}
              </button>
            </form>
          )}

          {/* Step 2: OTP Verification */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label className="block text-white/50 text-lg font-medium mb-2">Verification Code</label>
                <div className="relative">
                  <ShieldCheck size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm text-center tracking-[0.5em] font-mono placeholder:text-white/20 placeholder:tracking-normal focus:outline-none focus:border-[#FDB02F]/40 focus:bg-white/[0.07] transition-all"
                    placeholder="000000"
                    maxLength={6}
                    required
                  />
                </div>
                <p className="text-white/30 text-lg mt-2">Check your email for the 6-digit code</p>
              </div>
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#FDB02F] to-[#FDAA40] text-[#07123A] font-bold text-sm hover:shadow-lg hover:shadow-[#FDB02F]/20 transition-all disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify Code"}
              </button>
              <button
                type="button"
                onClick={() => { setStep("email"); setOtp(""); setError(""); }}
                className="w-full text-white/30 text-lg hover:text-white/50 transition-colors"
              >
                Didn&apos;t receive it? Go back and try again
              </button>
            </form>
          )}

          {/* Step 3: New Password */}
          {step === "reset" && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label className="block text-white/50 text-lg font-medium mb-2">New Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#FDB02F]/40 focus:bg-white/[0.07] transition-all"
                    placeholder="Enter new password"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-white/50 text-lg font-medium mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#FDB02F]/40 focus:bg-white/[0.07] transition-all"
                    placeholder="Confirm new password"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#FDB02F] to-[#FDAA40] text-[#07123A] font-bold text-sm hover:shadow-lg hover:shadow-[#FDB02F]/20 transition-all disabled:opacity-50"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}

          {/* Step 4: Done */}
          {step === "done" && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                <ShieldCheck size={32} className="text-green-400" />
              </div>
              <p className="text-white text-sm font-medium">Your password has been reset</p>
              <Link
                href="/copilot/login"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#FDB02F] to-[#FDAA40] text-[#07123A] font-bold text-sm hover:shadow-lg hover:shadow-[#FDB02F]/20 transition-all"
              >
                Sign In Now
              </Link>
            </div>
          )}

          {step !== "done" && (
            <div className="mt-6 pt-6 border-t border-white/5 text-center">
              <Link href="/copilot/login" className="inline-flex items-center gap-1 text-white/30 text-lg hover:text-white/50 transition-colors">
                <ArrowLeft size={12} />
                Back to Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
