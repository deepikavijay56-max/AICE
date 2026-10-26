import React, { Suspense } from "react";
import { getComplianceMonitoringData } from "@/lib/complianceEngine";
import { ComplianceCenterView } from "@/components/admin/ComplianceCenterView";

export const metadata = {
  title: "Compliance Monitoring Centre | AICTE SAKSHAM",
  description: "Track institutional deficiency clarifications, statutory undertakings, and evidence documentation",
};

async function CompliancePageContent() {
  const data = await getComplianceMonitoringData();

  return (
    <div className="space-y-6">
      {/* Title & KPI Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Compliance Monitoring Centre
            </h2>
            {data.isDemo && (
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                Sample Data
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Statutory deficiency rectifications, legal affirmations, and photographic evidence oversight
          </p>
        </div>

        {/* Quick KPI Strip */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-xs">
            <span className="text-amber-700 font-medium">Pending Review:</span>{" "}
            <span className="font-bold text-amber-900">{data.stats.pendingReviews}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs">
            <span className="text-emerald-700 font-medium">Resolved:</span>{" "}
            <span className="font-bold text-emerald-900">{data.stats.completedCompliance}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200 text-xs">
            <span className="text-teal-700 font-medium">Attested Undertakings:</span>{" "}
            <span className="font-bold text-teal-900">{data.stats.verifiedUndertakings}</span>
          </div>
        </div>
      </div>

      {/* Main Compliance Component */}
      <ComplianceCenterView
        complianceItems={data.complianceItems}
        undertakings={data.undertakings}
        isDemo={data.isDemo}
      />
    </div>
  );
}

export default function CompliancePage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-medium">Loading compliance records and affirmations...</p>
        </div>
      }
    >
      <CompliancePageContent />
    </Suspense>
  );
}
