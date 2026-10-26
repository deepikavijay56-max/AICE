import React, { Suspense } from "react";
import { getCurrentUserContext } from "@/lib/authContext";
import { AccessDeniedView } from "@/components/auth/AccessDeniedView";
import { RoleDashboardShell } from "@/components/navigation/RoleDashboardShell";
import { getComplianceMonitoringData } from "@/lib/complianceEngine";
import { ComplianceCenterView } from "@/components/admin/ComplianceCenterView";

export const metadata = {
  title: "Regional Scrutiny & Deficiencies | AICTE SAKSHAM",
  description: "Monitor and manage regional deficiency notices and statutory rectifications",
};

async function RegionalComplianceContent() {
  const user = await getCurrentUserContext();

  if (user && user.role !== "regional_officer" && user.role !== "council_admin") {
    return (
      <AccessDeniedView
        requiredRole="regional_officer"
        actualRole={user.role}
        message="Only authorized Regional Directorate Officers can access regional compliance reviews."
      />
    );
  }

  const data = await getComplianceMonitoringData();

  return (
    <RoleDashboardShell
      userEmail={user?.email}
      userRole={user?.role || "regional_officer"}
      fullName={user?.fullName || "Regional Officer"}
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                Regional Jurisdiction
              </span>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Scrutiny Deficiencies &amp; Compliance Verification
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Active deficiency notices, institutional replies, and statutory affirmations in your region
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-xs">
              <span className="text-amber-700 font-medium">Pending Scrutiny:</span>{" "}
              <span className="font-bold text-amber-900">{data.stats.pendingReviews}</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs">
              <span className="text-emerald-700 font-medium">Resolved:</span>{" "}
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

export default function RegionalCompliancePage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-medium">Loading regional compliance records...</p>
        </div>
      }
    >
      <RegionalComplianceContent />
    </Suspense>
  );
}
