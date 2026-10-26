"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signInAction, requestPasswordResetAction } from "@/lib/authActions";
import {
  ShieldCheckIcon,
  EyeIcon,
  EyeOffIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  ArrowRightIcon,
} from "@/components/admin/Icons";

export function InstitutionalLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [mode, setMode] = useState<"signin" | "forgot">("signin");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);

    if (mode === "forgot") {
      const formData = new FormData();
      formData.set("email", email);

      startTransition(async () => {
        const result = await requestPasswordResetAction(formData);
        if (result.success) {
          setInfoMessage(result.message);
        } else {
          setErrorMessage(result.message);
        }
      });
      return;
    }

    const formData = new FormData();
    formData.set("email", email);
    formData.set("password", password);
    formData.set("rememberMe", rememberMe ? "true" : "false");

    startTransition(async () => {
      const result = await signInAction(formData);
      if (result.success && result.redirectTo) {
        router.push(result.redirectTo);
      } else {
        setErrorMessage(result.message || "Authentication failed. Please verify your credentials.");
      }
    });
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          {mode === "signin" ? "Sign in to AICTE SAKSHAM" : "Password Recovery"}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
          {mode === "signin"
            ? "Sign in with your registered account email and password to access your authorized workspace."
            : "Enter your registered email address to receive secure password recovery instructions."}
        </p>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5 animate-in fade-in duration-150"
        >
          <AlertCircleIcon className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="leading-snug">{errorMessage}</div>
        </div>
      )}

      {infoMessage && (
        <div
          role="status"
          className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2.5 animate-in fade-in duration-150"
        >
          <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="leading-snug">{infoMessage}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Registered Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@domain.org or name@example.com"
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition-all shadow-2xs"
          />
        </div>

        {mode === "signin" && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setMode("forgot");
                  setErrorMessage(null);
                  setInfoMessage(null);
                }}
                className="text-[11px] font-semibold text-teal-700 hover:text-teal-800 hover:underline transition-colors"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your security credential"
                className="w-full pl-3.5 pr-10 py-2.5 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition-all shadow-2xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {mode === "signin" && (
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              <span>Remember this session on trusted workstation</span>
            </label>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full mt-2 py-2.5 px-4 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
        >
          {isPending ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Verifying Credentials...</span>
            </div>
          ) : (
            <>
              <span>{mode === "signin" ? "Sign In to AICTE SAKSHAM" : "Send Recovery Dispatch"}</span>
              <ArrowRightIcon className="w-4 h-4" />
            </>
          )}
        </button>

        {mode === "forgot" && (
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setErrorMessage(null);
                setInfoMessage(null);
              }}
              className="text-xs font-semibold text-teal-700 hover:underline"
            >
              &larr; Return to Sign In
            </button>
          </div>
        )}
      </form>

      <div className="mt-8 pt-5 border-t border-slate-200 space-y-3">
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
          <div className="font-bold text-slate-800 flex items-center justify-between mb-1.5">
            <span>Evaluator Pre-Created Accounts</span>
            <span className="text-[10px] font-mono text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">Test Roster</span>
          </div>
          <p className="text-[11px] text-slate-500 mb-2 leading-relaxed">
            Click any role to autofill its configured test email address:
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => {
                setEmail("admin@aicte-india.org");
                setPassword("Aice@2026Secure!");
                setErrorMessage(null);
              }}
              className="px-2 py-1 text-[10px] font-semibold text-left bg-white hover:bg-teal-50 hover:text-teal-900 border border-slate-200 rounded text-slate-700 transition-colors"
            >
              🏛️ Council Admin
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail("ro.western@aicte-india.org");
                setPassword("Aice@2026Secure!");
                setErrorMessage(null);
              }}
              className="px-2 py-1 text-[10px] font-semibold text-left bg-white hover:bg-teal-50 hover:text-teal-900 border border-slate-200 rounded text-slate-700 transition-colors"
            >
              🌐 Regional Officer
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail("scrutiny.officer@aicte-india.org");
                setPassword("Aice@2026Secure!");
                setErrorMessage(null);
              }}
              className="px-2 py-1 text-[10px] font-semibold text-left bg-white hover:bg-teal-50 hover:text-teal-900 border border-slate-200 rounded text-slate-700 transition-colors"
            >
              📋 Scrutiny Officer
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail("evc.lead@aicte-expert.gov.in");
                setPassword("Aice@2026Secure!");
                setErrorMessage(null);
              }}
              className="px-2 py-1 text-[10px] font-semibold text-left bg-white hover:bg-teal-50 hover:text-teal-900 border border-slate-200 rounded text-slate-700 transition-colors"
            >
              🔍 EVC Expert
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail("principal@coep.ac.in");
                setPassword("Aice@2026Secure!");
                setErrorMessage(null);
              }}
              className="px-2 py-1 text-[10px] font-semibold text-left bg-white hover:bg-teal-50 hover:text-teal-900 border border-slate-200 rounded text-slate-700 transition-colors col-span-2"
            >
              🎓 Institution User (COEP Pune)
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <ShieldCheckIcon className="w-4 h-4 text-teal-700 shrink-0" />
          <span>Statutory Data Boundary &bull; Multi-Tenant Row Level Security Active</span>
        </div>
      </div>
    </div>
  );
}
