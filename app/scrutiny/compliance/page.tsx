import React, { Suspense } from "react";
import { getCurrentUserContext } from "@/lib/authContext";
import { AccessDeniedView } from "@/components/auth/AccessDeniedView";
import { RoleDashboardShell } from "@/components/navigation/RoleDashboardShell";
import { getComplianceMonitoringData } from "@/lib/complianceEngine";
import { ComplianceCenterView } from "@/components/admin/ComplianceCenterView";

export const metadata = {
  title: "Scrutiny Compliance Verifications | AICTE SAKSHAM",
  description: "Examine institutional responses to deficiency queries and verify statutory documents",
};

async function ScrutinyComplianceContent() {
  const user = await getCurrentUserContext();

  if (
    user &&
    user.role !== "scrutiny_officer" &&
    user.role !== "council_admin" &&
    user.role !== "regional_officer"
  ) {
    return (
      <AccessDeniedView
        requiredRole="scrutiny_officer"
        actualRole={user.role}
        message="Only assigned Scrutiny Officers can examine institutional deficiency replies."
      />
    );
  }

  const data = await getComplianceMonitoringData();

  return (
    <RoleDashboardShell
      userEmail={user?.email}
      userRole={user?.role || "scrutiny_officer"}
      fullName={user?.fullName || "Scrutiny Officer"}
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                Scrutiny Panel Active
              </span>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Deficiency Clarifications &amp; Document Review
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Verify compliance submissions against APH 2026-27 norms within the 15-day SLA timeline
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-xs">
              <span className="text-amber-700 font-medium">Under Review:</span>{" "}
              <span className="font-bold text-amber-900">{data.stats.pendingReviews}</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs">
              <span className="text-emerald-700 font-medium">Cleared:</span>{" "}
              <span className="font-bold text-emerald-900">{data.stats.completedCompliance}</span>
            </div>
          </div>
        </div>

        <ComplianceCenterView
          complianceItems={data.complianceItems}
          undertakings={data.undertakings}
          isDemo={data.isDemo}
        />
      </div>
    </RoleDashboardShell>
  );
}

export default function ScrutinyCompliancePage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-medium">Loading scrutiny compliance verifications...</p>
        </div>
      }
    >
      <ScrutinyComplianceContent />
    </Suspense>
  );
}
