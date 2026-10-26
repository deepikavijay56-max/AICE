import React, { Suspense } from "react";
import { getComplianceMonitoringData } from "@/lib/complianceEngine";
import { EvcManagementView } from "@/components/admin/EvcManagementView";

export const metadata = {
  title: "Expert Visiting Committee (EVC) Oversight | AICTE SAKSHAM",
  description: "Monitor Expert Visiting Committees (EVC) schedules, peer-review audits, and findings scores",
};

async function EvcPageContent() {
  const data = await getComplianceMonitoringData();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Expert Visiting Committee (EVC) Management
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Senior academician peer-review inspections, geotagged infrastructure validation, and scoring
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
  );
}

export default function EvcVisitsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-medium">Accessing Expert Visiting Committee roster...</p>
        </div>
      }
    >
      <EvcPageContent />
    </Suspense>
  );
}
