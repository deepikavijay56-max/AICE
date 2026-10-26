import React, { Suspense } from "react";
import Link from "next/link";
import { getCurrentUserContext } from "@/lib/authContext";
import { AccessDeniedView } from "@/components/auth/AccessDeniedView";
import { RoleDashboardShell } from "@/components/navigation/RoleDashboardShell";
import { getComplianceMonitoringData } from "@/lib/complianceEngine";
import { ArrowRightIcon } from "@/components/admin/Icons";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = {
  title: "EVC Expert Panel Dashboard | AICTE SAKSHAM",
  description: "Assigned peer review inspection schedules and report lodgement",
};

export default function ExpertPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-medium">Checking expert panel assignments...</p>
        </div>
      }
    >
      <ExpertContent />
    </Suspense>
  );
}

async function ExpertContent() {
  const user = await getCurrentUserContext();

  if (user && user.role !== "evc_expert" && user.role !== "council_admin") {
    return (
      <AccessDeniedView
        requiredRole="evc_expert"
        actualRole={user.role}
        message="Only appointed Expert Visiting Committee (EVC) members can access peer-review inspection files."
      />
    );
  }

  const { evcItems, isDemo } = await getComplianceMonitoringData();

  const visits = evcItems.map((item) => ({
    id: item.id,
    applicationId: item.applicationId,
    applicationNumber: item.applicationNumber,
    institutionName: item.institutionName,
    scheduledDate: new Date(item.scheduledStart).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }) + " (" + (item.status === "verified" || item.status === "report_submitted" ? "Completed" : "Scheduled") + ")",
    panelRole: item.leadExpertName ? `Lead: ${item.leadExpertName}` : "Lead Expert / Panelist",
    status: item.status,
  }));

  return (
    <RoleDashboardShell
      userEmail={user?.email}
      userRole={user?.role || "evc_expert"}
      fullName={user?.fullName || "Prof. Senior Expert"}
    >
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        <PageHeader
          title="Expert Visiting Committee (EVC) Dossier"
          subtitle="Peer-review on-site inspections, geotagged infrastructure validation, and confidential statutory reporting."
          badge="Expert Panelist Active"
          badgeTone="teal"
          actions={
            <div className="text-xs text-slate-500 font-mono bg-white px-3 py-1.5 rounded-lg border border-slate-200">
              Assigned Visits: <strong className="text-slate-900">{visits.length}</strong>
            </div>
          }
        />

        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">My Appointed Inspection Visits</h3>
              <p className="text-xs text-slate-500 mt-0.5">Physical infrastructure and compliance assessment</p>
            </div>
            <span className="text-xs text-slate-500 font-mono">Expert Assignment Protected</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Application</th>
                  <th className="py-3 px-4">Technical Institute</th>
                  <th className="py-3 px-4">Inspection Date</th>
                  <th className="py-3 px-4">Panel Capacity</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visits.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {v.applicationNumber}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {v.institutionName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono">
                      {v.scheduledDate}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {v.panelRole}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-cyan-50 text-cyan-800 border border-cyan-200">
                        {v.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/expert/applications/${v.applicationId || v.id}`}
                        className="inline-flex items-center gap-1 font-bold text-teal-600 hover:text-teal-700"
                      >
                        <span>Inspection Dossier</span>
                        <ArrowRightIcon className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </RoleDashboardShell>
  );
}
