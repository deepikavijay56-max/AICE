import React, { Suspense } from "react";
import Link from "next/link";
import { getCurrentUserContext } from "@/lib/authContext";
import { AccessDeniedView } from "@/components/auth/AccessDeniedView";
import { RoleDashboardShell } from "@/components/navigation/RoleDashboardShell";
import { ArrowRightIcon } from "@/components/admin/Icons";

export const metadata = {
  title: "Institution Portal | AICTE SAKSHAM",
  description: "Track Extension of Approval (EoA), deficiency replies, and compliance affirmations",
};

export default function InstitutionPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-medium">Verifying institutional credentials...</p>
        </div>
      }
    >
      <InstitutionContent />
    </Suspense>
  );
}

async function InstitutionContent() {
  const user = await getCurrentUserContext();

  if (
    user &&
    user.role !== "institution_admin" &&
    user.role !== "institution_user" &&
    user.role !== "council_admin"
  ) {
    return (
      <AccessDeniedView
        requiredRole="institution_admin"
        actualRole={user.role}
        message="Only registered Technical Institute administrators can access their institution's application docket."
      />
    );
  }

  const institutionName = "K.J. Somaiya College of Engineering (PID: 1-4251781)";
  const application = {
    id: "app-101",
    applicationNumber: "AICTE-2026-ENGG-00124",
    academicYear: "2026-2027",
    programType: "Engineering & Technology",
    status: "council_decision_pending",
    stage: "Council Decision Review",
    submissionDate: "2026-09-12",
    targetSlaDate: "2026-11-15",
  };

  return (
    <RoleDashboardShell
      userEmail={user?.email}
      userRole={user?.role || "institution_admin"}
      fullName={user?.fullName || "Institution Registrar / Director"}
    >
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
              Institution Dossier
            </span>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Statutory Approval &amp; Compliance Portal
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {institutionName} &bull; Protected under Statutory Institutional Isolation
          </p>
        </div>

        {/* Current Active Application Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                AY {application.academicYear} &bull; {application.programType}
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-1.5 font-mono">
                {application.applicationNumber}
              </h3>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-bold uppercase px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                {application.status.replace(/_/g, " ")}
              </span>
              <div className="text-[11px] text-slate-400 mt-1 font-mono">
                Target SLA: {application.targetSlaDate}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-400 font-medium block text-[10px] uppercase">Current Lifecycle Stage</span>
              <span className="font-bold text-slate-800 text-xs mt-0.5 block">{application.stage}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-400 font-medium block text-[10px] uppercase">Submission Date</span>
              <span className="font-bold text-slate-800 text-xs mt-0.5 block">{application.submissionDate}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-400 font-medium block text-[10px] uppercase">EVC Inspection</span>
              <span className="font-bold text-emerald-700 text-xs mt-0.5 block">Completed (94.5% Score)</span>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href={`/institution/applications/${application.id}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors shadow-2xs"
            >
              <span>View Case Flight Recorder</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/admin/compliance"
              className="px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
            >
              Manage Deficiency Submissions
            </Link>
          </div>
        </div>
      </div>
    </RoleDashboardShell>
  );
}
