"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ROLE_HOME_ROUTES } from "@/lib/authConstants";
import type { UserRole } from "@/types/database";
import {
  ShieldCheckIcon,
  ArrowRightIcon,
} from "@/components/admin/Icons";

export function RoleSwitcherModal() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole>("council_admin");
  const [isNavigating, setIsNavigating] = useState(false);

  const rolesList: Array<{
    role: UserRole;
    title: string;
    description: string;
    badge: string;
  }> = [
    {
      role: "council_admin",
      title: "Council Secretariat Admin",
      description: "Final statutory sanction, policy management, executive approval orders, system-wide KPIs.",
      badge: "Full Governance",
    },
    {
      role: "regional_officer",
      title: "Regional Directorate Officer",
      description: "Jurisdictional case pendency, scrutiny allocation, regional EVC monitoring (WRO/SRO/NRO).",
      badge: "Regional Scope",
    },
    {
      role: "scrutiny_officer",
      title: "Scrutiny Committee Member",
      description: "Document checklist verification, deficiency query issuance, 15-day SLA worklist.",
      badge: "Checklist Scope",
    },
    {
      role: "evc_expert",
      title: "Expert Visiting Committee (EVC)",
      description: "Peer-review on-site inspection schedules, geotagged infrastructure validation, score entry.",
      badge: "Assigned Panel",
    },
    {
      role: "institution_admin",
      title: "Technical Institute Applicant",
      description: "Dossier status tracking, deficiency reply lodging, statutory digital undertakings.",
      badge: "Tenant Isolated",
    },
    {
      role: "system_auditor",
      title: "Statutory System Auditor",
      description: "Immutable governance audit trail, workflow event history inspection, compliance logs.",
      badge: "Read-Only Audit",
    },
  ];

  const handleLaunch = () => {
    setIsNavigating(true);
    const targetRoute = ROLE_HOME_ROUTES[selectedRole] || "/admin";
    router.push(targetRoute);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6 max-w-2xl mx-auto">
      <div className="border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
            Authentication & Role Switcher
          </span>
          <span className="text-[10px] font-mono font-bold text-slate-400">SIH 2026 Evaluation</span>
        </div>
        <h3 className="text-xl font-black text-slate-900 mt-2 tracking-tight">
          Select Persona & Authenticated Role Boundary
        </h3>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
          Simulate sign-in into AICTE SAKSHAM. Server-side session verification routes each persona to its dedicated, RLS-enforced dashboard.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {rolesList.map((r) => {
          const isSelected = selectedRole === r.role;
          return (
            <button
              key={r.role}
              onClick={() => setSelectedRole(r.role)}
              className={`p-4 rounded-xl border text-left transition-all relative ${
                isSelected
                  ? "border-teal-600 bg-teal-50/50 ring-2 ring-teal-500/20"
                  : "border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/70"
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">{r.title}</span>
                <span className="text-[9px] font-bold uppercase font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                  {r.badge}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                {r.description}
              </p>
              <div className="text-[10px] font-mono text-teal-700 font-bold mt-2">
                Route: {ROLE_HOME_ROUTES[r.role]}
              </div>
            </button>
          );
        })}
      </div>

      <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-slate-100">
        <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
          <ShieldCheckIcon className="w-4 h-4 text-teal-600 shrink-0" />
          <span>Role verified server-side against authorized user profile</span>
        </div>

        <button
          onClick={handleLaunch}
          disabled={isNavigating}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-colors shadow-xs disabled:opacity-50"
        >
          <span>{isNavigating ? "Authenticating Session..." : `Enter as ${selectedRole.replace(/_/g, " ").toUpperCase()}`}</span>
          <ArrowRightIcon className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
