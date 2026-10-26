import React, { Suspense } from "react";
import Link from "next/link";
import { getCurrentUserContext } from "@/lib/authContext";
import { ROLE_HOME_ROUTES } from "@/lib/authConstants";
import type { UserRole } from "@/types/database";
import {
  ShieldCheckIcon,
  ArrowRightIcon,
} from "@/components/admin/Icons";

export const metadata = {
  title: "Supported Roles & Access Boundaries | AICTE SAKSHAM",
  description:
    "Statutory roles, access boundaries, and authorization matrix under AICTE SAKSHAM — Smart Approval, Compliance, Scheduling, and Handling Automation Management System.",
};

interface RoleCapability {
  role: UserRole;
  title: string;
  scopeBadge: string;
  badgeClass: string;
  description: string;
  responsibilities: string[];
  route: string;
}

const SUPPORTED_ROLES: RoleCapability[] = [
  {
    role: "council_admin",
    title: "Council Secretariat Admin",
    scopeBadge: "Council Bureau",
    badgeClass: "bg-teal-50 text-teal-800 border-teal-200",
    description: "System-wide statutory oversight, executive sanctions, policy management, and KPI tracking.",
    responsibilities: [
      "Executive sanction and final order sign-off",
      "Deadline-Risk Radar and SLA escalation monitoring",
      "National regional performance breakdown",
      "System-wide policy and workflow rule configuration",
    ],
    route: ROLE_HOME_ROUTES.council_admin,
  },
  {
    role: "regional_officer",
    title: "Regional Directorate Officer",
    scopeBadge: "Regional Office",
    badgeClass: "bg-blue-50 text-blue-800 border-blue-200",
    description: "Jurisdictional case pendency, scrutiny allocation, and regional EVC monitoring (WRO / SRO / NRO).",
    responsibilities: [
      "Regional application dossier review",
      "Regional deficiency notifications and compliance tracking",
      "Expert Visiting Committee (EVC) panel deployment",
      "Regional SLA turnaround compliance",
    ],
    route: ROLE_HOME_ROUTES.regional_officer,
  },
  {
    role: "scrutiny_officer",
    title: "Scrutiny Committee Member",
    scopeBadge: "Scrutiny Panel",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
    description: "Document checklist verification, deficiency query issuance, and 15-day SLA review queues.",
    responsibilities: [
      "Verification of land, building, and faculty norms against APH 2026-27",
      "Formal deficiency notice issuance to technical institutes",
      "Deficiency clarification re-evaluation",
      "15-day scrutiny timeout compliance",
    ],
    route: ROLE_HOME_ROUTES.scrutiny_officer,
  },
  {
    role: "evc_expert",
    title: "Expert Visiting Committee (EVC)",
    scopeBadge: "Peer Review Panel",
    badgeClass: "bg-cyan-50 text-cyan-800 border-cyan-200",
    description: "On-site physical inspection rosters, geotagged infrastructure validation, and scoring.",
    responsibilities: [
      "Peer-review on-site inspection roster inspection",
      "Geotagged photographic verification and timestamp checks",
      "Rubric-based infrastructure compliance score entry",
      "Formal inspection report submission",
    ],
    route: ROLE_HOME_ROUTES.evc_expert,
  },
  {
    role: "institution_admin",
    title: "Technical Institute Applicant",
    scopeBadge: "Tenant Isolated",
    badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
    description: "Institution dossier status tracking, deficiency reply lodging, and digital legal undertakings.",
    responsibilities: [
      "Statutory approval dossier tracking & Case Flight Recorder",
      "Deficiency clarification and document rectification upload",
      "Cryptographically hashed legal undertakings",
      "Approved document vault access",
    ],
    route: ROLE_HOME_ROUTES.institution_admin,
  },
  {
    role: "system_auditor",
    title: "Statutory System Auditor",
    scopeBadge: "Read-Only Audit",
    badgeClass: "bg-purple-50 text-purple-800 border-purple-200",
    description: "Immutable governance audit ledger, state transition logs, and regulatory compliance trail.",
    responsibilities: [
      "Immutable PostgreSQL append-only event stream inspection",
      "Workflow task execution and SLA breach audit",
      "Read-only statutory registry access",
      "Security and governance trail verification",
    ],
    route: ROLE_HOME_ROUTES.system_auditor,
  },
];

async function RolesDirectoryContent() {
  const currentUser = await getCurrentUserContext();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between p-6 sm:p-12">
      <div className="max-w-6xl mx-auto w-full space-y-8">
        {/* Header */}
        <div className="border-b border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                AICTE SAKSHAM RBAC Matrix
              </span>
              <span className="text-xs text-slate-400 font-mono">ISO 27001 Aligned</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 tracking-tight">
              Supported Roles &amp; Authorization Boundaries
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Every persona in AICTE SAKSHAM operates strictly within its verified database role, regional
              jurisdiction, and multi-tenant Row Level Security (RLS) boundary. Selecting a card
              provides regulatory scope details.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {currentUser?.isAuthenticated ? (
              <Link
                href={ROLE_HOME_ROUTES[currentUser.role] || "/admin"}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-colors shadow-xs"
              >
                <span>Enter My Workspace ({currentUser.role})</span>
                <ArrowRightIcon className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-colors shadow-xs"
              >
                <span>Sign In with Credentials</span>
                <ArrowRightIcon className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SUPPORTED_ROLES.map((r) => {
            const isUserRole = currentUser?.role === r.role;
            return (
              <div
                key={r.role}
                className={`rounded-2xl border p-6 flex flex-col justify-between transition-all ${
                  isUserRole
                    ? "bg-slate-800/90 border-teal-500 ring-2 ring-teal-500/20"
                    : "bg-slate-800/40 border-slate-700/80 hover:border-slate-600"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-sm text-white tracking-tight">{r.title}</span>
                    <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${r.badgeClass}`}>
                      {r.scopeBadge}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {r.description}
                  </p>

                  <div className="pt-2 border-t border-slate-700/60">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                      Permitted Statutory Responsibilities
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {r.responsibilities.map((resp, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-teal-400 shrink-0 font-bold">&bull;</span>
                          <span className="leading-snug">{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center justify-between">
                  <div className="text-[11px] font-mono text-slate-400">
                    Route: <span className="text-teal-400">{r.route}</span>
                  </div>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-teal-400 hover:text-teal-300 transition-colors"
                  >
                    <span>Authenticate</span>
                    <ArrowRightIcon className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Security Note */}
        <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 text-xs text-slate-400 flex items-start gap-3">
          <ShieldCheckIcon className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-slate-200">Server-Side Profile &amp; Role Enforcement</h4>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
              In accordance with AICTE data security standards, role assignment is resolved strictly from the authenticated session profile in PostgreSQL <code className="text-teal-300">public.profiles</code>. Direct URL modifications or client-side role toggling are strictly rejected by the server.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto w-full pt-8 mt-8 border-t border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>AICTE SAKSHAM &mdash; Smart Approval, Compliance, Scheduling &amp; Handling Automation</span>
        <span>SIH 2026 Problem Statement 26262</span>
      </footer>
    </div>
  );
}

export default function RolesDirectoryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-mono">Loading AICTE SAKSHAM RBAC Matrix...</span>
          </div>
        </div>
      }
    >
      <RolesDirectoryContent />
    </Suspense>
  );
}
