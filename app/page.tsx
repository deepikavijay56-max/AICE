import React, { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { getCurrentUserContext } from "@/lib/authContext";
import { ROLE_HOME_ROUTES } from "@/lib/authConstants";
import {
  ShieldCheckIcon,
  WorkflowIcon,
  OverviewIcon,
  AuditIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from "@/components/admin/Icons";

export const metadata = {
  title: "AICTE SAKSHAM | Smart Approval, Compliance, Scheduling & Handling Automation",
  description:
    "AICTE SAKSHAM — Smart Approval, Compliance, Scheduling, and Handling Automation Management System. Empowering Institutions. Streamlining Approvals.",
};

async function NavAuthControl() {
  const currentUser = await getCurrentUserContext();

  if (currentUser?.isAuthenticated) {
    return (
      <Link
        href={ROLE_HOME_ROUTES[currentUser.role] || "/admin"}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors shadow-xs"
      >
        <span>Go to Workspace ({currentUser.role})</span>
        <ArrowRightIcon className="w-3.5 h-3.5" />
      </Link>
    );
  }

  return (
    <Link
      href="/login"
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors shadow-xs"
    >
      <span>Institutional Sign In</span>
      <ArrowRightIcon className="w-3.5 h-3.5" />
    </Link>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      {/* Top Government Navigation Bar */}
      <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 shrink-0 rounded-lg overflow-hidden bg-white/10 p-0.5 border border-white/20 shadow-xs flex items-center justify-center">
              <Image
                src="/saksham-logo.png"
                alt="AICTE SAKSHAM"
                width={40}
                height={40}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div>
              <span className="text-sm font-extrabold text-white tracking-wider block">
                AICTE SAKSHAM
              </span>
              <span className="text-[10px] text-blue-300 font-mono font-medium uppercase tracking-wider block">
                Smart Approval, Compliance, Scheduling &amp; Handling Automation
              </span>
            </div>
          </div>

          <nav className="flex items-center gap-3">
            <Link
              href="/roles"
              className="hidden sm:inline-flex text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800/60 transition-colors"
            >
              Supported Roles
            </Link>
            <Suspense
              fallback={
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600/80 text-white font-bold text-xs"
                >
                  <span>Sign In</span>
                  <ArrowRightIcon className="w-3.5 h-3.5" />
                </Link>
              }
            >
              <NavAuthControl />
            </Suspense>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 flex flex-col justify-center">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-950/80 border border-blue-800/60 text-blue-300 text-xs font-mono">
            <ShieldCheckIcon className="w-3.5 h-3.5 text-blue-400" />
            <span>AICTE SAKSHAM &bull; Smart India Hackathon 2026 &bull; PS 26262</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Empowering Institutions. <br />
            <span className="text-blue-400">Streamlining Approvals.</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
            <strong className="text-white">Smart Approval, Compliance, Scheduling, and Handling Automation Management System.</strong>{" "}
            A next-generation statutory governance engine automating technical college clearances,
            scrutiny turnaround tracking, geotagged EVC inspections, and immutable audit trails across
            all AICTE regional directorates.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm transition-colors shadow-sm shadow-blue-950"
            >
              <span>Access Institutional Portal</span>
              <ArrowRightIcon className="w-4 h-4" />
            </Link>

            <Link
              href="/roles"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs sm:text-sm transition-colors"
            >
              <span>Explore Role Matrix</span>
            </Link>
          </div>
        </div>

        {/* Core Pillars Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 sm:mt-24">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold">
              <WorkflowIcon className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Configurable Workflow Routing
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enforces strict state transitions from scrutiny allocation to executive council sanction
              under Approval Process Handbook 2026-27 norms.
            </p>
            <ul className="text-[11px] text-slate-400 space-y-1 pt-1">
              <li className="flex items-center gap-1.5">
                <CheckCircleIcon className="w-3.5 h-3.5 text-teal-400" />
                <span>15-Day Maximum Scrutiny Turnaround</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircleIcon className="w-3.5 h-3.5 text-teal-400" />
                <span>Automated Deficiencies &amp; Clarifications</span>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold">
              <OverviewIcon className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              EVC Inspection &amp; Compliance Radar
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time monitoring of Expert Visiting Committee physical audits with geotagged
              photographic proof and verifiable legal undertakings.
            </p>
            <ul className="text-[11px] text-slate-400 space-y-1 pt-1">
              <li className="flex items-center gap-1.5">
                <CheckCircleIcon className="w-3.5 h-3.5 text-teal-400" />
                <span>Rubric-based Infrastructure Scoring</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircleIcon className="w-3.5 h-3.5 text-teal-400" />
                <span>SHA-256 Digital Undertaking Signatures</span>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold">
              <AuditIcon className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Case Flight Recorder &amp; Security
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every decision, document review, and status update is sealed into an immutable append-only
              event stream with role-based access boundaries.
            </p>
            <ul className="text-[11px] text-slate-400 space-y-1 pt-1">
              <li className="flex items-center gap-1.5">
                <CheckCircleIcon className="w-3.5 h-3.5 text-teal-400" />
                <span>PostgreSQL Row Level Security (RLS)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircleIcon className="w-3.5 h-3.5 text-teal-400" />
                <span>Zero-Trust Regional Data Boundaries</span>
              </li>
            </ul>
          </div>
        </div>
      </main>

      {/* Institutional Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/90 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="font-bold text-slate-300">AICTE SAKSHAM</span> &mdash; Smart Approval, Compliance, Scheduling &amp; Handling Automation
          </div>
          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <Link href="/roles" className="hover:text-blue-400 transition-colors">
              Role Matrix
            </Link>
            <span>&bull;</span>
            <Link href="/diagnostics" className="hover:text-blue-400 transition-colors">
              System Health
            </Link>
            <span>&bull;</span>
            <span>Security Standard: ISO 27001 Aligned</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
