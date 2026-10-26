import React from "react";
import Link from "next/link";
import { ChevronRightIcon } from "@/components/admin/Icons";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeTone?: "navy" | "teal" | "amber" | "emerald" | "slate";
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  badge,
  badgeTone = "teal",
  breadcrumbs,
  actions,
  className = "",
}: PageHeaderProps) {
  const badgeStyles = {
    navy: "bg-[#0B1F36]/10 text-[#0B1F36] border-[#0B1F36]/20",
    teal: "bg-teal-50 text-teal-800 border-teal-200",
    amber: "bg-amber-50 text-amber-800 border-amber-200",
    emerald: "bg-emerald-50 text-emerald-800 border-emerald-200",
    slate: "bg-slate-100 text-slate-700 border-slate-200",
  }[badgeTone];

  return (
    <div className={`mb-6 space-y-2 ${className}`}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={crumb.label + idx}>
                {idx > 0 && <ChevronRightIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                {isLast || !crumb.href ? (
                  <span className={isLast ? "text-slate-800 font-semibold" : "text-slate-500"}>
                    {crumb.label}
                  </span>
                ) : (
                  <Link href={crumb.href} className="text-slate-500 hover:text-slate-900 transition-colors">
                    {crumb.label}
                  </Link>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              {title}
            </h1>
            {badge && (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badgeStyles}`}>
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed max-w-3xl">
              {subtitle}
            </p>
          )}
        </div>

        {actions && <div className="shrink-0 flex items-center gap-2.5 mt-2 sm:mt-0">{actions}</div>}
      </div>
    </div>
  );
}
