"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Mail, Lock } from "lucide-react";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A66C2">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

export default function CopilotLoginPage() {
  return (
    <Suspense>
      <CopilotLogin />
    </Suspense>
  );
}

function CopilotLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  useEffect(() => {
    const err = searchParams.get("error");
    if (err) setError(err);
  }, [searchParams]);

  function handleOAuth(provider: string) {
    setOauthLoading(provider);
    setError("");
    window.location.href = `/api/copilot/auth/oauth/${provider}`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/copilot/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
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
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#FDB02F]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#1E40AF]/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/logo.webp" alt="OnDemandPsych" className="h-40 w-auto mx-auto mb-4" />
          <p className="text-white/40 text-lg">Sign in to your clinical workspace</p>
        </div>

        {/* Login card */}
        <div className="bg-[#0D1B4B]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-lg">
                {error}
              </div>
            )}

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
              <label className="block text-white/50 text-base font-medium mb-2">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-lg placeholder:text-white/20 focus:outline-none focus:border-[#FDB02F]/40 focus:bg-white/[0.07] transition-all"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Link href="/copilot/forgot-password" className="text-[#FDB02F]/70 hover:text-[#FDB02F] text-base transition-colors">
                Forgot password?
              </Link>
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
                  Sign In
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 mt-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/30 text-sm">or continue with</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Social login buttons */}
          <div className="flex gap-3 mt-5">
            <button
              type="button"
              onClick={() => handleOAuth("google")}
              disabled={!!oauthLoading}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white/10 transition-all disabled:opacity-50"
            >
              {oauthLoading === "google" ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <GoogleIcon />}
              Google
            </button>
            <button
              type="button"
              onClick={() => handleOAuth("linkedin")}
              disabled={!!oauthLoading}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white/10 transition-all disabled:opacity-50"
            >
              {oauthLoading === "linkedin" ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <LinkedInIcon />}
              LinkedIn
            </button>
            <button
              type="button"
              onClick={() => handleOAuth("facebook")}
              disabled={!!oauthLoading}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white/10 transition-all disabled:opacity-50"
            >
              {oauthLoading === "facebook" ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FacebookIcon />}
              Facebook
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-white/5 text-center">
            <p className="text-white/30 text-base">
              Don&apos;t have an account?{" "}
              <Link href="/copilot/register" className="text-[#FDB02F] hover:text-[#FDAA40] font-medium transition-colors">
                Create one
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-white/20 text-lg mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
