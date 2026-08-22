"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, Eye, EyeOff, ShieldCheck, AlertCircle, ArrowLeft } from "lucide-react";
import { loginAdminAction } from "@/lib/actions/auth";

import { Suspense } from "react";

function AdminLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedTarget = searchParams.get("from");
  const redirectTarget = requestedTarget?.startsWith("/admin")
    ? requestedTarget
    : "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setEmailError(null);
    setPasswordError(null);

    let hasError = false;
    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!cleanEmail) {
      setEmailError("الرجاء إدخال البريد الإلكتروني.");
      hasError = true;
    } else if (!emailRegex.test(cleanEmail)) {
      setEmailError("صيغة البريد الإلكتروني غير صحيحة.");
      hasError = true;
    }

    if (!password.trim()) {
      setPasswordError("الرجاء إدخال كلمة المرور.");
      hasError = true;
    } else if (password.trim().length < 6) {
      setPasswordError("كلمة المرور يجب أن لا تقل عن 6 خانات.");
      hasError = true;
    }

    if (hasError) return;

    setIsLoading(true);

    try {
      const res = await loginAdminAction(cleanEmail, password.trim());

      if (res.success) {
        router.push(redirectTarget);
        router.refresh();
      } else {
        setError(res.error || "فشل تسجيل الدخول، يرجى التأكد من البيانات.");
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Login client error:", err);
      setError("حدث خطأ غير متوقع، يرجى المحاولة لاحقاً.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col justify-center items-center px-6 py-12 font-sans selection:bg-neutral-800 selection:text-white">
      {/* Background Subtle Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-[#0d0d0d] to-[#0a0a0a] pointer-events-none" />

      <div className="relative w-full max-w-md space-y-8 z-10">
        
        {/* Brand & Title */}
        <div className="text-center space-y-3">
          <span className="font-serif text-3xl md:text-4xl font-bold tracking-[0.25em] text-white block">
            FATEKIT
          </span>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-900 border border-neutral-800 text-[11px] uppercase tracking-widest text-neutral-400 font-semibold rounded-full">
            <ShieldCheck className="w-3.5 h-3.5 text-neutral-300" />
            <span>لوحة التحكم الإدارية</span>
          </div>
          <p className="text-xs text-neutral-400 pt-1">
            يرجى تسجيل الدخول للوصول إلى إدارة المتجر والطلبات
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#141414] border border-neutral-800 p-8 shadow-2xl space-y-6">
          {error && (
            <div className="p-4 bg-red-950/50 border border-red-800 text-red-300 text-xs font-medium flex items-center gap-3">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2 text-right">
              <label className="block text-xs font-semibold text-neutral-300 tracking-wider">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError(null);
                  }}
                  placeholder="admin@fatekit.com"
                  className={`w-full bg-[#1c1c1c] border px-4 py-3 pl-10 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-white transition dir-ltr text-right ${
                    emailError ? "border-red-500" : "border-neutral-800"
                  }`}
                  autoComplete="email"
                />
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-3.5 pointer-events-none" />
              </div>
              {emailError && (
                <p className="text-[11px] text-red-400 font-sans">{emailError}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2 text-right">
              <label className="block text-xs font-semibold text-neutral-300 tracking-wider">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError(null);
                  }}
                  placeholder="••••••••"
                  className={`w-full bg-[#1c1c1c] border px-4 py-3 pl-10 pr-10 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-white transition dir-ltr text-right ${
                    passwordError ? "border-red-500" : "border-neutral-800"
                  }`}
                  autoComplete="current-password"
                />
                <Lock className="w-4 h-4 text-neutral-500 absolute right-3 top-3.5 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-neutral-500 hover:text-white absolute left-3 top-3.5 transition"
                  tabIndex={-1}
                  aria-label="إظهار/إخفاء كلمة المرور"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordError && (
                <p className="text-[11px] text-red-400 font-sans">{passwordError}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-white text-black font-sans text-xs uppercase tracking-widest font-bold hover:bg-neutral-200 transition flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>جاري التحقق...</span>
                </>
              ) : (
                <>
                  <span>تسجيل الدخول</span>
                  <ArrowLeft className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Info for Testing */}
          <div className="pt-3 border-t border-neutral-800/80 text-center">
            <div className="bg-neutral-900/60 p-3 border border-neutral-800/50 text-[11px] text-neutral-400 space-y-1">
              <p className="text-neutral-300 font-semibold">حساب الأدمن التجريبي (Seed Demo):</p>
              <p className="dir-ltr font-mono text-[10px] text-neutral-400">admin@fatekit.com • admin123</p>
            </div>
          </div>
        </div>

        {/* Back to store link */}
        <div className="text-center">
          <a
            href="/"
            className="text-xs text-neutral-500 hover:text-neutral-300 transition"
          >
            ← العودة لمتجر FATEKIT
          </a>
        </div>
      </div>
    </div>
  );
}
export default function AdminLoginPage() { return <Suspense fallback={<div>Loading...</div>}><AdminLoginContent /></Suspense>; }
