"use client";

import { useState } from "react";
import { Save, Shield } from "lucide-react";

export default function SettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setMessage("Password must be at least 6 characters");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (res.ok) {
        setMessage("Password updated successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const data = await res.json();
        setMessage(data.error || "Failed to update password");
      }
    } catch {
      setMessage("Failed to update password");
    }
    setSaving(false);
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-white/40 text-lg mt-1">
          Manage admin account and site settings
        </p>
      </div>

      <div className="max-w-lg">
        {/* Change Password */}
        <div className="bg-[#0D1B4B]/60 border border-white/10 rounded-2xl p-6">
          <h2 className="text-white font-semibold text-lg flex items-center gap-2 mb-4">
            <Shield size={16} className="text-[#FDB02F]" />
            Change Password
          </h2>

          {message && (
            <div
              className={`text-lg px-4 py-2.5 rounded-lg mb-4 ${
                message.includes("success")
                  ? "bg-green-500/10 border border-green-500/30 text-green-400"
                  : "bg-red-500/10 border border-red-500/30 text-red-400"
              }`}
            >
              {message}
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-3">
            <div>
              <label className="block text-white/40 text-xl mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-lg focus:outline-none focus:border-[#FDB02F]/50 transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-white/40 text-xl mb-1">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-lg focus:outline-none focus:border-[#FDB02F]/50 transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-white/40 text-xl mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-lg focus:outline-none focus:border-[#FDB02F]/50 transition-colors"
                required
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#FDB02F] text-[#07123A] font-bold text-lg hover:bg-[#FDAA40] transition-colors disabled:opacity-50"
            >
              <Save size={16} />
              {saving ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
