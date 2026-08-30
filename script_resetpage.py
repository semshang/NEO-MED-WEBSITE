code = """
"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import { SITE } from "@/config/site";
import { Link } from "@/i18n/routing";

function ResetPasswordForm() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token || !email) {
      setError("Invalid reset link.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, newPassword })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Failed to reset password.");
      }
      
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-white rounded-3xl p-10 max-w-md w-full shadow-2xl border border-slate-100 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={32} className="text-green-600" />
        </div>
        <h2 className="text-3xl font-black text-brand-navy mb-4">Password Reset!</h2>
        <p className="text-slate-500 mb-8">Your password has been successfully updated. You can now sign in with your new password.</p>
        <button 
          onClick={() => router.push("/?login=true")}
          className="w-full bg-brand-blue hover:opacity-90 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-10 max-w-md w-full shadow-2xl border border-slate-100">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-brand-navy mb-2">Set New Password</h2>
        <p className="text-slate-500">Enter a new secure password for your account.</p>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-6 border border-red-100">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-bold text-brand-navy mb-2">New Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
              placeholder="At least 8 characters"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold text-brand-navy mb-2">Confirm Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
              placeholder="Confirm new password"
              required
            />
          </div>
        </div>
        <button 
          type="submit"
          disabled={isLoading}
          className="w-full bg-brand-blue hover:opacity-90 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          <span>{isLoading ? "Updating..." : "Update Password"}</span>
          {!isLoading && <ArrowRight size={18} />}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#eff5f9] flex flex-col items-center justify-center p-4">
      <Link href="/" className="mb-8 block">
        <img src="/logo-transparent.png" alt={SITE.name} className="h-12 w-auto" />
      </Link>
      <Suspense fallback={<div className="animate-pulse w-96 h-96 bg-slate-200 rounded-3xl" />}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
"""

with open("src/app/[locale]/reset-password/page.tsx", "w", encoding="utf-8") as f:
    f.write(code.strip())
