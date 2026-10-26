import React, { Suspense } from "react";
import Link from "next/link";
import { getCurrentUserContext } from "@/lib/authContext";
import { AccessDeniedView } from "@/components/auth/AccessDeniedView";
import { RoleDashboardShell } from "@/components/navigation/RoleDashboardShell";
import { ArrowRightIcon } from "@/components/admin/Icons";

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

  const visits = [
    {
      id: "evc-1",
      applicationNumber: "AICTE-2026-MGMT-00088",
      institutionName: "T.A. Pai Management Institute",
      scheduledDate: "2026-11-04 (10:00 AM IST)",
      panelRole: "Lead Expert / Chairman",
      status: "scheduled",
    },
    {
      id: "evc-2",
      applicationNumber: "AICTE-2026-ENGG-00124",
      institutionName: "K.J. Somaiya College of Engineering",
      scheduledDate: "2026-10-18 (Completed)",
      panelRole: "Committee Member (AI/Data Science)",
      status: "report_submitted",
    },
  ];

  return (
    <RoleDashboardShell
      userEmail={user?.email}
      userRole={user?.role || "evc_expert"}
      fullName={user?.fullName || "Prof. Senior Expert"}
    >
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 border border-cyan-300">
              Expert Panelist Active
            </span>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Expert Visiting Committee (EVC) Dossier
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Assigned physical inspections and geotagged photographic report submissions
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">My Appointed Inspection Visits</h3>
            <span className="text-xs text-slate-500 font-mono">Protected by Expert Assignment Trigger</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/70 text-slate-600 font-semibold uppercase text-[10px] border-b border-slate-200">
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
                        href={`/expert/applications/${v.id}`}
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
