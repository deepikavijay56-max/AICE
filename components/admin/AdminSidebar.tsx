"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
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
  CloseIcon,
} from "./Icons";

export const NAVIGATION_ITEMS = [
  { name: "Overview", href: "/admin", icon: OverviewIcon, description: "Executive KPI dashboard" },
  { name: "Applications", href: "/admin/applications", icon: ApplicationsIcon, description: "Approval & statutory requests" },
  { name: "Compliance Centre", href: "/admin/compliance", icon: AuditIcon, description: "Deficiencies & affirmations" },
  { name: "Workflow Monitoring", href: "/admin/workflows", icon: WorkflowIcon, description: "Stage tracking & SLAs" },
  { name: "SIH Innovation Lab", href: "/admin/simulation", icon: AnalyticsIcon, description: "Time machine & sandbox" },
  { name: "EVC Visits", href: "/admin/evc-visits", icon: EvcIcon, description: "Expert committee schedules" },
  { name: "Institutions", href: "/admin/institutions", icon: InstitutionsIcon, description: "Registered institutes directory" },
  { name: "Regions", href: "/admin/regions", icon: RegionsIcon, description: "Regional AICTE jurisdiction" },
  { name: "User Management", href: "/admin/users", icon: UsersIcon, description: "Officer access & RBAC" },
  { name: "Reports & Analytics", href: "/admin/analytics", icon: AnalyticsIcon, description: "Approvals & SLA breakdown" },
  { name: "Audit Trail", href: "/admin/audit-logs", icon: AuditIcon, description: "Immutable governance ledger" },
  { name: "Settings", href: "/admin/settings", icon: SettingsIcon, description: "System & policy configs" },
];

interface AdminSidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function AdminSidebar({ mobileOpen, onCloseMobile }: AdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-slate-900 border-r border-slate-800 text-slate-200 transition-all duration-200 ease-in-out ${
          collapsed ? "w-20" : "w-64"
        } ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Header / Brand */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800/80 bg-slate-950/60">
          <Link href="/admin" className="flex items-center gap-3 overflow-hidden group">
            <div className="relative w-9 h-9 shrink-0 rounded-lg overflow-hidden bg-white/10 p-0.5 border border-white/20 shadow-xs flex items-center justify-center group-hover:border-white/40 transition-colors">
              <Image
                src="/saksham-logo.png"
                alt="AICTE SAKSHAM"
                width={36}
                height={36}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            {!collapsed && (
              <div className="flex flex-col truncate">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-300">AICTE SAKSHAM</span>
                <span className="text-sm font-extrabold text-white tracking-tight">Council Admin</span>
              </div>
            )}
          </Link>

          {/* Close button on mobile */}
          <button
            onClick={onCloseMobile}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
            aria-label="Close sidebar"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Council Badge / Environment Indicator */}
        {!collapsed && (
          <div className="px-4 py-2.5 mx-3 mt-3 rounded-md bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Statutory Portal
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-teal-900/60 text-teal-300 border border-teal-700/40">
              SECURE
            </span>
          </div>
        )}

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Council Sidebar">
          {NAVIGATION_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                title={collapsed ? item.name : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-teal-600 text-white shadow-sm shadow-teal-950 font-semibold"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/80"
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                {!collapsed && (
                  <span className="truncate">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer actions & Collapse toggle (Desktop only) */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40 hidden lg:flex items-center justify-between">
          {!collapsed ? (
            <div className="flex flex-col text-[11px] text-slate-400">
              <span className="font-medium text-slate-300">Approval Year 2026-27</span>
              <span className="text-[10px] text-slate-500">RLS Enforcement Active</span>
            </div>
          ) : (
            <span className="text-[10px] text-slate-500 mx-auto">2026</span>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg
              className={`w-4 h-4 transition-transform ${collapsed ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <polyline points="15 18 9 12 15 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </aside>
    </>
  );
}
