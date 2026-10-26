import React, { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { getCurrentUserContext } from "@/lib/authContext";
import { ROLE_HOME_ROUTES } from "@/lib/authConstants";
import {
  ShieldCheckIcon,
  WorkflowIcon,
  AuditIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  BuildingOfficeIcon,
} from "@/components/admin/Icons";

export const metadata = {
  title: "AICTE SAKSHAM | Statutory Technical Education Approval & SLA Management",
  description:
    "AICTE SAKSHAM: Smart Approval, Compliance, Scheduling, and Handling Automation Management System. Empowering Institutions. Streamlining Approvals under APH 2026-27.",
};

async function NavAuthControl() {
  const currentUser = await getCurrentUserContext();

  if (currentUser?.isAuthenticated) {
    return (
      <Link
        href={ROLE_HOME_ROUTES[currentUser.role] || "/admin"}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs transition-colors shadow-xs"
      >
        <span>Open Workspace ({currentUser.role.replace(/_/g, " ")})</span>
        <ArrowRightIcon className="w-3.5 h-3.5" />
      </Link>
    );
  }

  return (
    <Link
      href="/login"
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors shadow-xs"
    >
      <span>Portal Sign In</span>
      <ArrowRightIcon className="w-3.5 h-3.5" />
    </Link>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#172B4D] flex flex-col justify-between selection:bg-teal-700 selection:text-white font-sans">
      {/* Institutional Top Header */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="relative w-12 h-12 shrink-0 rounded-xl overflow-hidden bg-slate-50 p-1 border border-slate-200/80 shadow-xs flex items-center justify-center">
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
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-[#142D4E] tracking-tight block">
                  AICTE SAKSHAM
                </span>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                  SIH 2026 PS 26262
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium tracking-normal block line-clamp-1">
                Smart Approval, Compliance, Scheduling, and Handling Automation Management System
              </span>
            </div>
          </div>

          <nav className="flex items-center gap-3">
            <Suspense
              fallback={
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white font-semibold text-xs shadow-xs"
                >
                  <span>Portal Sign In</span>
                  <ArrowRightIcon className="w-3.5 h-3.5" />
                </Link>
              }
            >
              <NavAuthControl />
            </Suspense>
          </nav>
        </div>
      </header>

      {/* Hero Section with Government-Tech Elegance */}
      <main className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-b from-[#0B1F36] via-[#142D4E] to-[#0B1F36] text-white py-20 sm:py-28 border-b border-slate-800">
          <div className="absolute inset-0 bg-[radial-gradient(#0F766E_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-900/60 border border-teal-500/40 text-teal-300 text-xs font-semibold backdrop-blur-sm shadow-inner">
              <ShieldCheckIcon className="w-4 h-4 text-teal-400" />
              <span>Approval Process Handbook (APH 2026–27) Regulatory Engine</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
              A Unified Platform for <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-teal-300 via-sky-200 to-indigo-300 bg-clip-text text-transparent">
                Approval Workflow Management
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-3xl mx-auto leading-relaxed">
              AICTE SAKSHAM automates the statutory technical education approval lifecycle through
              intelligent route selection, inter-committee deficiency coordination, geotagged EVC inspections,
              and a transparent, rules-based Compliance Risk Radar.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-sm transition-all shadow-lg hover:shadow-teal-500/20 focus:outline-none focus:ring-2 focus:ring-teal-400"
              >
                <span>Launch Institutional Workspace</span>
                <ArrowRightIcon className="w-4 h-4 text-slate-950" />
              </Link>
              <Link
                href="/roles"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-semibold text-sm border border-slate-700 transition-all hover:border-slate-600"
              >
                <span>Access &amp; Responsibilities Matrix</span>
              </Link>
            </div>

            {/* Measurable Targets Banner (Pitch Deck Alignment) */}
            <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <div className="text-2xl font-black text-teal-300">100%</div>
                <div className="text-xs font-semibold text-slate-200 mt-1">Route &amp; SLA Visibility</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Across all 4 statutory paths</div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <div className="text-2xl font-black text-teal-300">40–60%</div>
                <div className="text-xs font-semibold text-slate-200 mt-1">Follow-Up Reduction</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Automated multi-tier escalations</div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <div className="text-2xl font-black text-teal-300">0 Overdue</div>
                <div className="text-xs font-semibold text-slate-200 mt-1">Lease-Expiry Target</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Proactive risk radar warnings</div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <div className="text-2xl font-black text-teal-300">Full Audit</div>
                <div className="text-xs font-semibold text-slate-200 mt-1">Immutable Ledger</div>
                <div className="text-[11px] text-slate-400 mt-0.5">PostgreSQL trigger tracking</div>
              </div>
            </div>
          </div>
        </section>

        {/* Platform Core Capabilities Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded border border-teal-200">
              Statutory Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#142D4E] mt-3">
              Designed for Speed, Integrity &amp; Transparency
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Replacing manual paper bundles with synchronized digital workflows for applicants, officers, and committee members.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-xs space-y-4 hover:border-slate-300 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 border border-teal-100 flex items-center justify-center">
                <WorkflowIcon className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#142D4E] tracking-tight">
                Route-Aware Approval Engine
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Automatically determines stage sequences across <strong>SCRUTINY_ONLY</strong>, <strong>SCRUTINY_EVC</strong>, 
                <strong>EVC_SAC</strong>, and <strong>ONLY_EVC</strong>. Bypasses unnecessary inspections for standard EoAs.
              </p>
              <ul className="text-xs text-slate-700 space-y-2 pt-3 border-t border-slate-100 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Strict state-machine enforcement</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Deficiency clarification loop</span>
                </li>
              </ul>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-xs space-y-4 hover:border-slate-300 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 border border-teal-100 flex items-center justify-center">
                <BuildingOfficeIcon className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#142D4E] tracking-tight">
                Peer Review &amp; EVC Scheduling
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Coordinated on-site and virtual visits by 3-member Expert Visiting Committees. 
                Digitally records rubric marks, geotagged infrastructure proof, and SAC appeals.
              </p>
              <ul className="text-xs text-slate-700 space-y-2 pt-3 border-t border-slate-100 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Expert visit roster &amp; rubrics</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Standing Appellate Committee track</span>
                </li>
              </ul>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-xs space-y-4 hover:border-slate-300 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 border border-teal-100 flex items-center justify-center">
                <AuditIcon className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#142D4E] tracking-tight">
                Risk Radar &amp; Case Flight Recorder
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Transparent rules-based deadline radar quoting governing APH regulations. 
                PostgreSQL triggers log every action immutably to the Case Flight Recorder.
              </p>
              <ul className="text-xs text-slate-700 space-y-2 pt-3 border-t border-slate-100 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Explainable SLA timeout alerts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Zero-Trust PostgreSQL Row Level Security</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section: Access & Responsibilities */}
        <section className="bg-white border-y border-slate-200 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                Statutory Personas
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#142D4E] mt-3">
                Role Matrix &amp; Operational Boundaries
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-2">
                Operational authority and scope allocated across statutory stakeholder personas
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3 hover:border-slate-300 transition-colors">
                <div className="text-xs font-bold uppercase tracking-wider text-teal-800 font-mono">
                  Council Bureau
                </div>
                <h4 className="text-sm font-bold text-[#142D4E]">National Executive Council</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  National regulatory oversight, statutory policy threshold configurations, SLA risk radar, and executive approval orders.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3 hover:border-slate-300 transition-colors">
                <div className="text-xs font-bold uppercase tracking-wider text-teal-800 font-mono">
                  Regional Office
                </div>
                <h4 className="text-sm font-bold text-[#142D4E]">Regional Officers</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Jurisdictional application queues, allocation of scrutiny officers, and regional EVC visit roster coordination.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3 hover:border-slate-300 transition-colors">
                <div className="text-xs font-bold uppercase tracking-wider text-teal-800 font-mono">
                  Scrutiny &amp; Inspection
                </div>
                <h4 className="text-sm font-bold text-[#142D4E]">Scrutiny &amp; EVC Experts</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Verification of institutional land titles, faculty norms, deficiency identification, and campus peer-review reports.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3 hover:border-slate-300 transition-colors">
                <div className="text-xs font-bold uppercase tracking-wider text-teal-800 font-mono">
                  Institutions
                </div>
                <h4 className="text-sm font-bold text-[#142D4E]">Colleges &amp; Universities</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Submission of approval dossiers, rectification of scrutiny deficiencies, and cryptographic signing of statutory undertakings.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Professional Institutional Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-xs text-slate-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#142D4E]">AICTE SAKSHAM</span>
            <span>&mdash;</span>
            <span>All India Council for Technical Education (Approval Bureau)</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500 text-xs">
            <span>Security Standard: ISO 27001 / CERT-In</span>
            <span>&bull;</span>
            <Link href="/login" className="text-teal-700 hover:underline font-semibold">
              Portal Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

