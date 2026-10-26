import React from "react";
import Link from "next/link";
import { AlertCircleIcon, ArrowRightIcon, ShieldCheckIcon } from "@/components/admin/Icons";

interface AccessDeniedProps {
  requiredRole?: string;
  actualRole?: string;
  message?: string;
}

export function AccessDeniedView({
  requiredRole = "council_admin",
  actualRole = "Unassigned Role",
  message,
}: AccessDeniedProps) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-6 shadow-xl text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircleIcon className="w-6 h-6" />
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
            403 &bull; Access Restricted by RLS Policy
          </span>
          <h2 className="text-lg font-bold text-slate-900 mt-2.5">
            Unauthorized Role Boundary
          </h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            {message || (
              <>
                This section requires an authorized{" "}
                <span className="font-mono font-bold text-teal-700">{requiredRole}</span> privilege.
                Your authenticated profile is registered as{" "}
                <span className="font-mono font-bold text-amber-700">{actualRole}</span>.
              </>
            )}
          </p>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-left text-[11px] text-slate-600 space-y-1">
          <div className="flex items-center gap-1 font-semibold text-slate-800">
            <ShieldCheckIcon className="w-3.5 h-3.5 text-teal-600" />
            <span>AICTE Statutory Data Isolation</span>
          </div>
          <p className="text-[10px] text-slate-500">
            PostgreSQL Row Level Security (RLS) strictly segregates institution dossiers, regional jurisdictions, and EVC assignments.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-xs font-bold text-white transition-colors"
          >
            <span>Switch Role / Sign In</span>
            <ArrowRightIcon className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
          >
            Portal Home
          </Link>
        </div>
      </div>
    </div>
  );
}
