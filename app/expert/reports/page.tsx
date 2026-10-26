import React, { Suspense } from "react";
import { getCurrentUserContext } from "@/lib/authContext";
import { AccessDeniedView } from "@/components/auth/AccessDeniedView";
import { RoleDashboardShell } from "@/components/navigation/RoleDashboardShell";
import { getComplianceMonitoringData } from "@/lib/complianceEngine";
import { EvcManagementView } from "@/components/admin/EvcManagementView";

export const metadata = {
  title: "EVC Report Lodging | AICTE SAKSHAM",
  description: "Lodge expert inspection findings, geotagged infrastructure validation, and scoring",
};

async function ExpertReportsContent() {
  const user = await getCurrentUserContext();

  if (user && user.role !== "evc_expert" && user.role !== "council_admin") {
    return (
      <AccessDeniedView
        requiredRole="evc_expert"
        actualRole={user.role}
        message="Only appointed Expert Visiting Committee (EVC) members can submit inspection reports."
      />
    );
  }

  const data = await getComplianceMonitoringData();

  return (
    <RoleDashboardShell
      userEmail={user?.email}
      userRole={user?.role || "evc_expert"}
      fullName={user?.fullName || "Prof. Senior Expert"}
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 border border-cyan-300">
                Peer Review Reporting
              </span>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                EVC Report Lodging &amp; Scoring Panel
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Finalize peer review findings, submit rubric percentage scores, and confirm geotagged photographic evidence
            </p>
          </div>

          {data.isDemo && (
            <span className="text-[10px] font-semibold uppercase px-2 py-1 rounded bg-slate-100 text-slate-500 border border-slate-200 self-start sm:self-auto">
              Sample EVC Roster
            </span>
          )}
        </div>

        <EvcManagementView visits={data.evcItems} isDemo={data.isDemo} />
      </div>
    </RoleDashboardShell>
  );
}

export default function ExpertReportsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-medium">Loading report lodging portal...</p>
        </div>
      }
    >
      <ExpertReportsContent />
    </Suspense>
  );
}
