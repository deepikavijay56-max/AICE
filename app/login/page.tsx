import React from "react";
import Link from "next/link";
import Image from "next/image";
import { InstitutionalLoginForm } from "@/components/auth/InstitutionalLoginForm";
import {
  ShieldCheckIcon,
  WorkflowIcon,
  OverviewIcon,
  AuditIcon,
} from "@/components/admin/Icons";

export const metadata = {
  title: "AICTE SAKSHAM | Institutional Sign In & Workspace Access",
  description:
    "AICTE SAKSHAM — Smart Approval, Compliance, Scheduling, and Handling Automation Management System. Empowering Institutions. Streamlining Approvals.",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between">
      {/* Main Split-Screen Container */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-screen">
        {/* Left Institutional Branding Section */}
        <div className="lg:w-1/2 bg-slate-950 border-b lg:border-b-0 lg:border-r border-slate-800 p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle geometric background grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

          {/* Top Logo & System Title */}
          <div className="relative z-10">
            <div className="flex items-center gap-3.5">
              <div className="relative w-12 h-12 shrink-0 rounded-xl overflow-hidden bg-white/10 p-0.5 border border-white/20 shadow-md flex items-center justify-center">
                <Image
                  src="/saksham-logo.png"
                  alt="AICTE SAKSHAM"
                  width={48}
                  height={48}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
              <div>
                <span className="text-xl font-black text-white tracking-wider block">
                  AICTE SAKSHAM
                </span>
                <span className="text-[10px] text-blue-300 font-mono uppercase tracking-wider block font-semibold">
                  Smart Approval, Compliance, Scheduling &amp; Handling Automation
                </span>
              </div>
            </div>

            {/* Headline & Mission */}
            <div className="mt-12 sm:mt-16 space-y-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-blue-950/80 text-blue-300 border border-blue-800/60 font-mono">
                <ShieldCheckIcon className="w-3.5 h-3.5 text-blue-400" />
                Smart India Hackathon 2026 &bull; PS 26262
              </span>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Empowering Institutions. <br className="hidden sm:inline" />
                <span className="text-blue-400">Streamlining Approvals.</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-lg leading-relaxed pt-1">
                Automated statutory scrutiny, deadline SLA risk radar, and immutable Case Flight
                Recording for technical education institutions nationwide.
              </p>
            </div>
          </div>

          {/* Core Institutional Value Pillars */}
          <div className="relative z-10 mt-12 space-y-4">
            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0 mt-0.5">
                <WorkflowIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-200">
                  Configurable Regulatory Workflows
                </h3>
                <p className="text-[11px] text-slate-400 leading-normal mt-0.5">
                  15-day scrutiny turnaround and trigger-enforced state transitions under Approval
                  Process Handbook (APH) 2026-27.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0 mt-0.5">
                <OverviewIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-200">
                  Deficiency &amp; EVC Compliance Radar
                </h3>
                <p className="text-[11px] text-slate-400 leading-normal mt-0.5">
                  Geotagged infrastructure evidence, peer-review scoring, and cryptographic legal
                  undertakings.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0 mt-0.5">
                <AuditIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-200">
                  Case Flight Recorder &amp; Auditability
                </h3>
                <p className="text-[11px] text-slate-400 leading-normal mt-0.5">
                  Tamper-evident event stream capturing every regulatory intervention and SLA
                  warning.
                </p>
              </div>
            </div>
          </div>

          {/* Left Footer Reference */}
          <div className="relative z-10 pt-8 mt-8 border-t border-slate-800/80 text-[11px] text-slate-500 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span>AICTE SAKSHAM &bull; Statutory Bureau Edition</span>
            <span>All India Council for Technical Education</span>
          </div>
        </div>

        {/* Right Authentication Form Section */}
        <div className="lg:w-1/2 bg-slate-50 p-6 sm:p-12 lg:p-16 flex flex-col justify-between">
          {/* Top Quick Action */}
          <div className="flex items-center justify-between text-xs text-slate-500 pb-6 border-b border-slate-200">
            <span>Statutory Bureau Portal</span>
            <Link
              href="/roles"
              className="text-teal-700 hover:text-teal-800 font-semibold hover:underline"
            >
              Supported Roles &amp; Responsibilities &rarr;
            </Link>
          </div>

          {/* Central Login Card */}
          <div className="my-auto py-8">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-8">
              <InstitutionalLoginForm />
            </div>
          </div>

          {/* Security & Confidentiality Footer */}
          <footer className="pt-6 border-t border-slate-200 text-center text-xs text-slate-500 space-y-1">
            <p>
              Authorized regulatory personnel and technical institute applicants only.
            </p>
            <p className="text-[11px] text-slate-400">
              Session communications protected with TLS 1.3 &bull; PostgreSQL Multi-Tenant RLS Boundaries
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
