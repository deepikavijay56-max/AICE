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
  title: "AICTE SAKSHAM | A Unified Platform for Approval Workflow Management",
  description:
    "AICTE SAKSHAM: Smart Approval, Compliance, Scheduling, and Handling Automation Management System. Empowering Institutions. Streamlining Approvals.",
};

async function NavAuthControl() {
  const currentUser = await getCurrentUserContext();

  if (currentUser?.isAuthenticated) {
    return (
      <Link
        href={ROLE_HOME_ROUTES[currentUser.role] || "/admin"}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs transition-colors shadow-xs"
      >
        <span>Open Workspace ({currentUser.role.replace(/_/g, " ")})</span>
        <ArrowRightIcon className="w-3.5 h-3.5" />
      </Link>
    );
  }

  return (
    <Link
      href="/login"
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs transition-colors shadow-xs"
    >
      <span>Sign In</span>
      <ArrowRightIcon className="w-3.5 h-3.5" />
    </Link>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-blue-600 selection:text-white font-sans">
      {/* Institutional Top Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="relative w-11 h-11 shrink-0 rounded-lg overflow-hidden bg-slate-50 p-1 border border-slate-200 shadow-xs flex items-center justify-center">
              <Image
                src="/saksham-logo.png"
                alt="AICTE SAKSHAM"
                width={44}
                height={44}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div>
              <span className="text-base font-extrabold text-slate-900 tracking-tight block">
                AICTE SAKSHAM
              </span>
              <span className="text-[11px] text-slate-500 font-medium tracking-normal block">
                Smart Approval, Compliance, Scheduling, and Handling Automation Management System
              </span>
            </div>
          </div>

          <nav className="flex items-center gap-3">
            <Suspense
              fallback={
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-700 text-white font-semibold text-xs shadow-xs"
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
      <main className="flex-1">
        <section className="bg-gradient-to-b from-white via-slate-50 to-slate-100/70 border-b border-slate-200 py-16 sm:py-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold">
              <ShieldCheckIcon className="w-4 h-4 text-blue-700" />
              <span>Statutory Technical Education Regulatory Portal &bull; APH 2026–27</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              A Unified Platform for <br className="hidden sm:inline" />
              <span className="text-blue-700">Approval Workflow Management</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 max-w-3xl mx-auto leading-relaxed">
              AICTE SAKSHAM streamlines technical institution approvals through automated application
              processing, inter-committee review coordination, geotagged Expert Visiting Committee
              inspections, and continuous statutory compliance monitoring.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
              >
                <span>Sign In to Institutional Workspace</span>
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Platform Core Capabilities Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Platform Core Capabilities
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Implemented operational workflows supporting institutional applicants and regulatory directorates
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4 hover:border-slate-300 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center">
                <WorkflowIcon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Application Processing &amp; Routing
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Standardized stage sequences for Extension of Approval (EoA), New Technical Programs,
                and intake expansion with statutory 15-day turnaround tracking.
              </p>
              <ul className="text-xs text-slate-700 space-y-2 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Configured statutory workflow sequences</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Deficiency notice dispatch &amp; tracking</span>
                </li>
              </ul>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4 hover:border-slate-300 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center">
                <BuildingOfficeIcon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Review &amp; Inspection Coordination
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Coordinated scheduling of Expert Visiting Committees (EVC), rubric-based infrastructure
                assessments, and appellate committee review tracking.
              </p>
              <ul className="text-xs text-slate-700 space-y-2 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Expert visit roster &amp; rubric evaluation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Standing Appellate Committee (SAC) track</span>
                </li>
              </ul>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4 hover:border-slate-300 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center">
                <AuditIcon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Compliance Tracking &amp; Audit Trail
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Continuous compliance records, digitally verified legal undertakings, SHA-256 document
                checksums, and immutable event flight recording.
              </p>
              <ul className="text-xs text-slate-700 space-y-2 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Append-only Case Flight Recorder</span>
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
        <section className="bg-white border-y border-slate-200 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Access &amp; Responsibilities
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-2">
                Operational authority and scope allocated across statutory stakeholder personas
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-blue-700 font-mono">
                  Council Bureau
                </div>
                <h4 className="text-sm font-bold text-slate-900">National Executive Council</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  National regulatory oversight, statutory policy threshold configurations, SLA risk radar, and executive approval orders.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-blue-700 font-mono">
                  Regional Office
                </div>
                <h4 className="text-sm font-bold text-slate-900">Regional Officers</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Jurisdictional application queues, allocation of scrutiny officers, and regional EVC visit roster coordination.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-blue-700 font-mono">
                  Scrutiny &amp; Inspection
                </div>
                <h4 className="text-sm font-bold text-slate-900">Scrutiny &amp; EVC Experts</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Verification of institutional land titles, faculty norms, deficiency identification, and campus peer-review reports.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-blue-700 font-mono">
                  Institutions
                </div>
                <h4 className="text-sm font-bold text-slate-900">Colleges &amp; Universities</h4>
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
            <span className="font-bold text-slate-900">AICTE SAKSHAM</span>
            <span>&mdash;</span>
            <span>Smart Approval, Compliance, Scheduling, and Handling Automation Management System</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500 text-xs">
            <span>Approval Process Handbook (APH 2026–27)</span>
            <span>&bull;</span>
            <Link href="/login" className="text-blue-700 hover:underline font-medium">
              Portal Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
