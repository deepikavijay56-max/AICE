import React from "react";
import type { ApplicationStatus } from "@/types/database";

interface StatusBadgeProps {
  status: ApplicationStatus | string;
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const normalized = status.toLowerCase();

  let styles = "bg-slate-100 text-slate-700 border-slate-300";
  let label = status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  switch (normalized) {
    case "approved":
      styles = "bg-emerald-50 text-emerald-800 border-emerald-300";
      label = "Approved";
      break;
    case "rejected":
      styles = "bg-rose-50 text-rose-800 border-rose-300";
      label = "Rejected";
      break;
    case "council_decision_pending":
      styles = "bg-purple-50 text-purple-800 border-purple-300";
      label = "Council Decision Pending";
      break;
    case "sac_review":
      styles = "bg-indigo-50 text-indigo-800 border-indigo-300";
      label = "SAC Review";
      break;
    case "evc_scheduled":
      styles = "bg-cyan-50 text-cyan-800 border-cyan-300";
      label = "EVC Scheduled";
      break;
    case "evc_completed":
      styles = "bg-teal-50 text-teal-800 border-teal-300";
      label = "EVC Completed";
      break;
    case "scrutiny_cleared":
      styles = "bg-blue-50 text-blue-800 border-blue-300";
      label = "Scrutiny Cleared";
      break;
    case "scrutiny_clarification_sought":
      styles = "bg-amber-50 text-amber-800 border-amber-300";
      label = "Clarification Sought";
      break;
    case "under_scrutiny":
      styles = "bg-yellow-50 text-yellow-800 border-yellow-300";
      label = "Under Scrutiny";
      break;
    case "submitted":
      styles = "bg-sky-50 text-sky-800 border-sky-300";
      label = "Submitted";
      break;
    case "draft":
      styles = "bg-slate-100 text-slate-700 border-slate-300";
      label = "Draft";
      break;
    case "withdrawn":
      styles = "bg-stone-100 text-stone-600 border-stone-300";
      label = "Withdrawn";
      break;
    default:
      styles = "bg-slate-100 text-slate-700 border-slate-300";
  }

  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs font-medium";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${styles} ${sizeClasses} font-semibold transition-colors`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {label}
    </span>
  );
}
