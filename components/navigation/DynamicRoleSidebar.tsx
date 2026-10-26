"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { UserRole } from "@/types/database";
import {
  OverviewIcon,
  ApplicationsIcon,
  WorkflowIcon,
  EvcIcon,
  InstitutionsIcon,
  RegionsIcon,
  UsersIcon,
  AnalyticsIcon,
  AuditIcon,
  SettingsIcon,
  ShieldCheckIcon,
} from "@/components/admin/Icons";

export interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

export function getNavigationForRole(role: UserRole | string): NavItem[] {
  switch (role) {
    case "regional_officer":
      return [
        { name: "Regional Overview", href: "/regional", icon: OverviewIcon, description: "Regional pendency & cases" },
        { name: "Regional Applications", href: "/regional/applications", icon: ApplicationsIcon, description: "Jurisdiction dossiers" },
        { name: "Scrutiny & Deficiencies", href: "/regional/compliance", icon: AuditIcon, description: "Regional compliance review" },
        { name: "EVC Inspections", href: "/regional/evc", icon: EvcIcon, description: "Regional expert committees" },
      ];

    case "scrutiny_officer":
      return [
        { name: "Scrutiny Worklist", href: "/scrutiny", icon: OverviewIcon, description: "Assigned applications review" },
        { name: "Compliance Verifications", href: "/scrutiny/compliance", icon: AuditIcon, description: "Deficiency rectifications" },
        { name: "Inspection Guidelines", href: "/scrutiny/guidelines", icon: WorkflowIcon, description: "APH 2026-27 scrutiny rules" },
      ];

    case "evc_expert":
      return [
        { name: "My Assigned Visits", href: "/expert", icon: EvcIcon, description: "Peer review inspection roster" },
        { name: "Report Lodging", href: "/expert/reports", icon: OverviewIcon, description: "Findings abstract & scoring" },
        { name: "Inspection Guidelines", href: "/expert/guidelines", icon: WorkflowIcon, description: "APH Appendix 4 checklist" },
      ];

    case "institution_admin":
    case "institution_user":
      return [
        { name: "Institution Portal", href: "/institution", icon: OverviewIcon, description: "Dossier status & approvals" },
        { name: "Deficiency Replies", href: "/institution/deficiencies", icon: AuditIcon, description: "Submit clarifications & docs" },
        { name: "Legal Undertakings", href: "/institution/undertakings", icon: WorkflowIcon, description: "Signed affirmations & hashes" },
        { name: "Document Vault", href: "/institution/documents", icon: ApplicationsIcon, description: "Uploaded statutory files" },
      ];

    case "system_auditor":
      return [
        { name: "Audit Trail", href: "/admin/audit-logs", icon: AuditIcon, description: "Immutable governance ledger" },
        { name: "Workflow Execution", href: "/admin/workflows", icon: WorkflowIcon, description: "System status transitions" },
        { name: "Council Applications", href: "/admin/applications", icon: ApplicationsIcon, description: "Read-only statutory registry" },
      ];

    case "council_admin":
    default:
      return [
        { name: "Overview", href: "/admin", icon: OverviewIcon, description: "Executive KPI dashboard" },
        { name: "Applications", href: "/admin/applications", icon: ApplicationsIcon, description: "Approval & statutory requests" },
        { name: "Compliance Centre", href: "/admin/compliance", icon: AuditIcon, description: "Deficiencies & affirmations" },
        { name: "Workflow Monitoring", href: "/admin/workflows", icon: WorkflowIcon, description: "Stage tracking & SLAs" },
        { name: "Role Matrix", href: "/roles", icon: UsersIcon, description: "Statutory RBAC & scopes" },
        { name: "SIH Innovation Lab", href: "/admin/simulation", icon: AnalyticsIcon, description: "Time machine & sandbox" },
        { name: "EVC Visits", href: "/admin/evc-visits", icon: EvcIcon, description: "Expert committee schedules" },
        { name: "Institutions", href: "/admin/institutions", icon: InstitutionsIcon, description: "Registered institutes directory" },
        { name: "Regions", href: "/admin/regions", icon: RegionsIcon, description: "Regional AICTE jurisdiction" },
        { name: "User Management", href: "/admin/users", icon: UsersIcon, description: "Officer access & RBAC" },
        { name: "Reports & Analytics", href: "/admin/analytics", icon: AnalyticsIcon, description: "Approvals & SLA breakdown" },
        { name: "Audit Trail", href: "/admin/audit-logs", icon: AuditIcon, description: "Immutable governance ledger" },
        { name: "Settings", href: "/admin/settings", icon: SettingsIcon, description: "System & policy configs" },
      ];
  }
}

interface DynamicRoleSidebarProps {
  userRole: UserRole | string;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function DynamicRoleSidebar({
  userRole,
  mobileOpen,
  onCloseMobile,
}: DynamicRoleSidebarProps) {
  const pathname = usePathname();
  const navItems = getNavigationForRole(userRole);

  const roleLabels: Record<string, string> = {
    council_admin: "Council Secretariat",
    regional_officer: "Regional Directorate",
    scrutiny_officer: "Scrutiny Committee",
    evc_expert: "Expert Visiting Panel",
    institution_admin: "Institute Directorate",
    institution_user: "Applicant User",
    system_auditor: "Statutory Auditor",
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#0B1F36] border-r border-[#142D4E] text-slate-200 w-64 transition-transform duration-200 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center gap-3 h-16 px-5 border-b border-[#142D4E] bg-[#08182B]">
          <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-white/10 p-0.5 border border-white/20 text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
            <Image
              src="/saksham-logo.png"
              alt="AICTE SAKSHAM"
              width={32}
              height={32}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <div>
            <div className="text-xs font-extrabold text-white tracking-wider flex items-center gap-1.5">
              <span>AICTE SAKSHAM</span>
            </div>
            <span className="text-[10px] text-blue-300 font-mono font-semibold uppercase">
              {roleLabels[userRole] || userRole}
            </span>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  active
                    ? "bg-[#142D4E] text-white font-semibold shadow-xs border-l-3 border-teal-400"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${active ? "text-teal-300" : "text-slate-400"}`} />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Security Indicator */}
        <div className="p-4 border-t border-[#142D4E] bg-[#08182B]/60 text-[10px] text-slate-400 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-slate-300">
            <ShieldCheckIcon className="w-3.5 h-3.5 text-teal-400" />
            <span>RLS Protected Boundary</span>
          </div>
          <p className="font-mono text-slate-400 text-[9px] uppercase">
            Active Role: {userRole}
          </p>
        </div>
      </aside>
    </>
  );
}
