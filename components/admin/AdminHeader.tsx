"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MenuIcon,
  BellIcon,
  SearchIcon,
  LogoutIcon,
  CheckCircleIcon,
  AlertCircleIcon,
} from "./Icons";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { TimeMachineWidget } from "./TimeMachineWidget";

interface AdminHeaderProps {
  onOpenMobileMenu: () => void;
  userEmail?: string | null;
  userRole?: string | null;
  fullName?: string | null;
}

export function AdminHeader({
  onOpenMobileMenu,
  userEmail,
  userRole = "council_admin",
  fullName,
}: AdminHeaderProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  // Compute role-tailored Portal branding and labels
  const roleBranding: Record<string, { title: string; subtitle: string; badge: string; defaultName: string }> = {
    council_admin: {
      title: "Council Administration",
      subtitle: "Statutory Approval, Regulatory Oversight & EVC Monitoring",
      badge: "Council Secretariat",
      defaultName: "Council Administrator",
    },
    regional_officer: {
      title: "Regional Directorate",
      subtitle: "Jurisdictional Case Pendency & Regional Scrutiny Oversight",
      badge: "Regional Office",
      defaultName: "Regional Officer",
    },
    scrutiny_officer: {
      title: "Scrutiny Directorate",
      subtitle: "Statutory Checklist Verification & Deficiency Management",
      badge: "Scrutiny Panel",
      defaultName: "Scrutiny Officer",
    },
    evc_expert: {
      title: "Expert Visiting Committee",
      subtitle: "Peer-Review Inspection & Geotagged Evidence Assessment",
      badge: "EVC Panelist",
      defaultName: "Expert Committee Member",
    },
    institution_admin: {
      title: "Technical Institution Portal",
      subtitle: "Statutory Approval Dossier, Deficiency Replies & Compliance",
      badge: "Institute Directorate",
      defaultName: "Institute Registrar",
    },
    institution_user: {
      title: "Technical Institution Portal",
      subtitle: "Statutory Approval Dossier, Deficiency Replies & Compliance",
      badge: "Institute Applicant",
      defaultName: "Institution User",
    },
    system_auditor: {
      title: "System Audit Directorate",
      subtitle: "Immutable Governance Ledger & Workflow Compliance Radar",
      badge: "Statutory Auditor",
      defaultName: "System Auditor",
    },
  };

  const branding = roleBranding[userRole || "council_admin"] || roleBranding.council_admin;
  const displayName = fullName || userEmail?.split("@")[0] || branding.defaultName;
  const displayRole = (userRole || "council_admin").replace(/_/g, " ").toUpperCase();

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      const supabase = createBrowserClient();
      await supabase.auth.signOut();
      window.location.replace("/");
    } catch (err) {
      console.error("Sign out error:", err);
      window.location.replace("/");
    }
  };

  // Compute role-tailored links
  const roleAuditTrailHref: Record<string, string> = {
    institution_admin: "/institution",
    institution_user: "/institution",
    scrutiny_officer: "/scrutiny/compliance",
    regional_officer: "/regional/compliance",
    evc_expert: "/expert/reports",
    system_auditor: "/admin/audit-logs",
    council_admin: "/admin/audit-logs",
  };

  const auditTrailHref = roleAuditTrailHref[userRole || "council_admin"] || "/admin/audit-logs";

  // Role-appropriate notifications based on actual user context and workspace
  interface NotificationItem {
    id: string;
    title: string;
    description: string;
    timeAgo: string;
    targetHref: string;
    type: "alert" | "success" | "info";
  }

  const getRoleNotifications = (role: string): NotificationItem[] => {
    switch (role) {
      case "institution_admin":
      case "institution_user":
        return [
          {
            id: "notif-inst-1",
            title: "Statutory Deficiency Clarification Notice",
            description: "Scrutiny Committee logged inquiries on Land Title & Faculty Roster. Rectifications due.",
            timeAgo: "25 minutes ago",
            targetHref: "/institution/deficiencies",
            type: "alert",
          },
          {
            id: "notif-inst-2",
            title: "Annual EoA Application Docket Stored",
            description: "AICTE-2026-ENGG-00124 draft dossier is active. All uploaded proofs cryptographically sealed.",
            timeAgo: "2 hours ago",
            targetHref: "/institution",
            type: "info",
          },
          {
            id: "notif-inst-3",
            title: "Digital Legal Undertakings Acknowledged",
            description: "Anti-Ragging and BoG affirmation hash records logged under institutional registry.",
            timeAgo: "1 day ago",
            targetHref: "/institution/undertakings",
            type: "success",
          },
        ];
      case "scrutiny_officer":
        return [
          {
            id: "notif-sc-1",
            title: "New Application Allocated to Worklist",
            description: "AICTE-2026-ENGG-00124 ready for statutory checklist & cadre-ratio inspection.",
            timeAgo: "15 minutes ago",
            targetHref: "/scrutiny",
            type: "alert",
          },
          {
            id: "notif-sc-2",
            title: "Deficiency Evidence Upload Received",
            description: "Technical institute updated sanctioned building blueprint and Fire Safety NOC.",
            timeAgo: "1 hour ago",
            targetHref: "/scrutiny/compliance",
            type: "success",
          },
        ];
      case "regional_officer":
        return [
          {
            id: "notif-ro-1",
            title: "Jurisdictional SLA Escalation Alert",
            description: "Western Region: 2 technical institutes nearing 15-day regulatory decision deadline.",
            timeAgo: "10 minutes ago",
            targetHref: "/regional/applications",
            type: "alert",
          },
          {
            id: "notif-ro-2",
            title: "Regional EVC Inspection Committee Convened",
            description: "3 expert members empanelled for surprise physical campus infrastructure inspection.",
            timeAgo: "3 hours ago",
            targetHref: "/regional/evc",
            type: "info",
          },
        ];
      case "evc_expert":
        return [
          {
            id: "notif-evc-1",
            title: "EVC Inspection Assignment Scheduled",
            description: "You have been nominated to inspect infrastructure and faculty cadre for assigned institute.",
            timeAgo: "30 minutes ago",
            targetHref: "/expert",
            type: "alert",
          },
          {
            id: "notif-evc-2",
            title: "Peer-Review Report Submission Reminder",
            description: "Inspection dossier findings and geotagged evidence abstract due within 48 hours.",
            timeAgo: "2 hours ago",
            targetHref: "/expert/reports",
            type: "info",
          },
        ];
      case "system_auditor":
        return [
          {
            id: "notif-aud-1",
            title: "Cryptographic Audit Ledger Event",
            description: "Trigger trg_applications_enforce_integrity sealed 4 immutable workflow transitions.",
            timeAgo: "8 minutes ago",
            targetHref: "/admin/audit-logs",
            type: "info",
          },
        ];
      case "council_admin":
      default:
        return [
          {
            id: "notif-ca-1",
            title: "SLA Escalation: EVC Visit Delayed",
            description: "Western Region • Institute #1-98721 exceeds 14 days post-scrutiny.",
            timeAgo: "12 minutes ago",
            targetHref: "/admin/applications",
            type: "alert",
          },
          {
            id: "notif-ca-2",
            title: "Council Decision Pending Final Order",
            description: "SAC cleared 3 engineering extension requests ready for final order.",
            timeAgo: "1 hour ago",
            targetHref: "/admin/compliance",
            type: "success",
          },
        ];
    }
  };

  const notifications = getRoleNotifications(userRole || "council_admin");
  const [allRead, setAllRead] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      {/* Left: Mobile Menu + Dynamic Role Title */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 -ml-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden focus:outline-none focus:ring-2 focus:ring-[#0B1F36]"
          aria-label="Open sidebar"
        >
          <MenuIcon className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
              {branding.title}
            </h1>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#0B1F36]/5 text-[#0B1F36] border border-[#0B1F36]/15 uppercase tracking-wide">
              {branding.badge}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 hidden md:block">
            {branding.subtitle}
          </p>
        </div>
      </div>

      {/* Center: Quick Search Bar */}
      <div className="hidden lg:flex items-center flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="search"
            placeholder="Search Application ID, Permanent Institute ID, or Officer..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F36] focus:bg-white text-slate-900 placeholder-slate-400 transition-all"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Time Machine Interactive Simulation Control */}
        <TimeMachineWidget />

        {/* Notifications Control */}
        <div className="relative">
          <button
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setProfileOpen(false);
            }}
            className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
            aria-label="View notifications"
            aria-expanded={notificationsOpen}
          >
            <BellIcon className="w-5 h-5" />
            {!allRead && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal-600 ring-2 ring-white" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Regulatory Alerts
                </span>
                <button
                  type="button"
                  onClick={() => setAllRead(true)}
                  className="text-[11px] font-medium text-teal-600 hover:underline cursor-pointer"
                >
                  Mark all read
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 text-xs">
                {notifications.map((item) => (
                  <Link
                    key={item.id}
                    href={item.targetHref}
                    onClick={() => setNotificationsOpen(false)}
                    className="p-3 hover:bg-slate-50 transition-colors flex gap-3 text-left block"
                  >
                    {item.type === "alert" ? (
                      <AlertCircleIcon className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircleIcon className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-semibold text-slate-800 leading-snug">
                        {item.title}
                      </p>
                      <p className="text-slate-500 text-[11px] mt-0.5 leading-relaxed">
                        {item.description}
                      </p>
                      <span className="text-[10px] text-teal-700 font-medium mt-1 inline-block">
                        {item.timeAgo} &bull; Open in workspace &rarr;
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="px-4 py-2 border-t border-slate-100 text-center bg-slate-50/50">
                <Link
                  href={auditTrailHref}
                  onClick={() => setNotificationsOpen(false)}
                  className="text-xs font-medium text-slate-700 hover:text-teal-600"
                >
                  View complete workspace records &rarr;
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotificationsOpen(false);
            }}
            className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-100 text-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
            aria-expanded={profileOpen}
            aria-label="User menu"
          >
            <div className="w-8 h-8 rounded-full bg-slate-900 text-teal-400 font-bold text-xs flex items-center justify-center border border-teal-500/30">
              {displayName.slice(0, 2).toUpperCase()}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-800 leading-tight">
                {displayName}
              </span>
              <span className="text-[10px] font-medium text-teal-700 leading-none">
                {displayRole}
              </span>
            </div>
          </button>

          {/* Profile Dropdown */}
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-900">{displayName}</p>
                <p className="text-[11px] text-slate-500 truncate">{userEmail || "admin@aicte-india.org"}</p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                  Role: {displayRole}
                </div>
              </div>

              <div className="py-1">
                <Link
                  href={auditTrailHref}
                  onClick={() => setProfileOpen(false)}
                  className="block px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                >
                  My Workspace Activity
                </Link>
              </div>

              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogoutIcon className="w-4 h-4" />
                  <span>{signingOut ? "Signing Out..." : "Sign Out of Portal"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
