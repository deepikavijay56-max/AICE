import React, { Suspense } from "react";
import { getCurrentUserContext } from "@/lib/authContext";
import { AccessDeniedView } from "@/components/auth/AccessDeniedView";
import { RoleDashboardShell } from "@/components/navigation/RoleDashboardShell";
import { getComplianceMonitoringData } from "@/lib/complianceEngine";
import { ComplianceCenterView } from "@/components/admin/ComplianceCenterView";

export const metadata = {
  title: "Deficiency Responses | AICTE SAKSHAM",
  description: "Upload clarifications, rectifications, and supporting evidence for statutory deficiencies",
};

async function InstitutionDeficienciesContent() {
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
        message="Only registered Technical Institute administrators can lodge deficiency clarifications."
      />
    );
  }

  const data = await getComplianceMonitoringData();

  return (
    <RoleDashboardShell
      userEmail={user?.email}
      userRole={user?.role || "institution_admin"}
      fullName={user?.fullName || "Institution Registrar"}
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                Institutional Applicant
              </span>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Deficiency Clarifications &amp; Rectification Upload
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Respond to Scrutiny Committee queries and upload geo-tagged photographic evidence
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs">
              <span className="text-emerald-700 font-medium">Pending Reviews:</span>{" "}
              <span className="font-bold text-emerald-900">{data.stats.pendingReviews}</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200 text-xs">
              <span className="text-teal-700 font-medium">Resolved Compliance:</span>{" "}
              <span className="font-bold text-teal-900">{data.stats.completedCompliance}</span>
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

export default function InstitutionDeficienciesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-medium">Loading institutional deficiency portal...</p>
        </div>
      }
    >
      <InstitutionDeficienciesContent />
    </Suspense>
  );
}
