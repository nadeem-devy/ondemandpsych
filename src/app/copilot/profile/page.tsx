"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Phone,
  Building2,
  Stethoscope,
  Lock,
  BrainCircuit,
  CheckCircle2,
} from "lucide-react";

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

interface Profile {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  organization: string | null;
  role: string | null;
  plan: string;
  createdAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [organization, setOrganization] = useState("");
  const [role, setRole] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/copilot/profile")
      .then((r) => {
        if (!r.ok) throw new Error("Unauthorized");
        return r.json();
      })
      .then((data) => {
        setProfile(data);
        setName(data.name || "");
        setPhone(data.phone || "");
        setOrganization(data.organization || "");
        setRole(data.role || "");
      })
      .catch(() => router.push("/copilot/login"));
  }, [router]);

  async function handleSave() {
    setError("");

    if (newPassword && newPassword !== confirmPassword) {
      setError("New passwords don't match");
      return;
    }

    setSaving(true);
    try {
      const body: Record<string, string> = { name, phone, organization, role };
      if (newPassword) {
        body.currentPassword = currentPassword;
        body.newPassword = newPassword;
      }

      const res = await fetch("/api/copilot/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save");
        setSaving(false);
        return;
      }

      setSaved(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError("Something went wrong");
    }
    setSaving(false);
  }

  if (!profile) {
    return (
      <div className="h-screen bg-[#07123A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#FDB02F]/30 border-t-[#FDB02F] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07123A]">
      {/* Header */}
      <div className="border-b border-white/5 bg-[#0A1628]">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link
            href="/copilot/chat"
            className="p-2 rounded-lg text-white/40 hover:text-white/60 hover:bg-white/5 transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FDB02F] to-[#FDAA40] flex items-center justify-center">
              <BrainCircuit size={16} className="text-[#07123A]" />
            </div>
            <h1 className="text-lg font-bold text-white">Profile Settings</h1>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Avatar & name header */}
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#FDB02F]/20 to-[#FDB02F]/5 border border-[#FDB02F]/10 flex items-center justify-center text-[#FDB02F] text-2xl font-bold">
            {name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{name}</h2>
            <p className="text-white/40 text-sm">{profile.email}</p>
            <p className="text-[#FDB02F] text-lg font-semibold uppercase mt-1">{profile.plan} Plan</p>
          </div>
        </div>

        {/* Profile fields */}
        <div className="bg-[#0D1B4B]/40 border border-white/5 rounded-2xl p-6 space-y-5">
          <h3 className="text-white/60 text-lg font-semibold uppercase tracking-wider mb-2">Personal Information</h3>

          <Field icon={User} label="Full Name" value={name} onChange={setName} placeholder="Dr. John Smith" />
          <Field icon={Mail} label="Email" value={profile.email} disabled placeholder="" onChange={() => {}} />
          <Field icon={Phone} label="Phone" value={phone} onChange={setPhone} placeholder="+1 (555) 000-0000" />
          <Field icon={Building2} label="Organization" value={organization} onChange={setOrganization} placeholder="Hospital / Clinic name" />
          <div>
            <label className="block text-white/40 text-lg font-medium mb-2">Clinical Role</label>
            <div className="relative">
              <Stethoscope size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full pl-11 pr-10 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#FDB02F]/40 transition-all appearance-none cursor-pointer"
              >
                <option value="" className="bg-[#0D1B4B] text-white/40">Select your role</option>
                {clinicalRoles.map((r) => (
                  <option key={r} value={r} className="bg-[#0D1B4B] text-white">{r}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            </div>
          </div>
        </div>

        {/* Password */}
        <div className="bg-[#0D1B4B]/40 border border-white/5 rounded-2xl p-6 space-y-5">
          <h3 className="text-white/60 text-lg font-semibold uppercase tracking-wider mb-2">Change Password</h3>

          <Field icon={Lock} label="Current Password" value={currentPassword} onChange={setCurrentPassword} placeholder="Enter current password" type="password" />
          <Field icon={Lock} label="New Password" value={newPassword} onChange={setNewPassword} placeholder="Enter new password" type="password" />
          <Field icon={Lock} label="Confirm New Password" value={confirmPassword} onChange={setConfirmPassword} placeholder="Confirm new password" type="password" />
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
              saved
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "bg-[#FDB02F] text-[#07123A] hover:bg-[#FDAA40]"
            } disabled:opacity-50`}
          >
            {saved ? <CheckCircle2 size={16} /> : <Save size={16} />}
            {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  value,
  onChange,
  placeholder,
  disabled,
  type = "text",
}: {
  icon: typeof User;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  disabled?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-white/40 text-lg font-medium mb-2">{label}</label>
      <div className="relative">
        <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#FDB02F]/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}
