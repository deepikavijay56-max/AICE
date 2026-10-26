import React, { Suspense } from "react";
import Link from "next/link";
import { getCurrentUserContext } from "@/lib/authContext";
import { AccessDeniedView } from "@/components/auth/AccessDeniedView";
import { RoleDashboardShell } from "@/components/navigation/RoleDashboardShell";
import { ArrowRightIcon } from "@/components/admin/Icons";

export const metadata = {
  title: "Scrutiny Officer Worklist | AICTE SAKSHAM",
  description: "Document checklist verification, deficiency issuance, and scrutiny progression",
};

export default function ScrutinyPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-medium">Loading scrutiny queue...</p>
        </div>
      }
    >
      <ScrutinyContent />
    </Suspense>
  );
}

async function ScrutinyContent() {
  const user = await getCurrentUserContext();

  if (user && user.role !== "scrutiny_officer" && user.role !== "council_admin" && user.role !== "regional_officer") {
    return (
      <AccessDeniedView
        requiredRole="scrutiny_officer"
        actualRole={user.role}
        message="Only assigned Scrutiny Officers can inspect statutory checklist submissions."
      />
    );
  }

  const worklist = [
    {
      id: "app-104",
      applicationNumber: "AICTE-2026-MCA-00019",
      institutionName: "Harcourt Butler Technical University",
      assignedDate: "2026-10-02",
      turnaroundDaysLeft: 3,
      status: "under_scrutiny",
      checklistProgress: "8 / 12 Verified",
    },
    {
      id: "app-105",
      applicationNumber: "AICTE-2026-ARCH-00007",
      institutionName: "Jadavpur University School of Architecture",
      assignedDate: "2026-09-28",
      turnaroundDaysLeft: 6,
      status: "scrutiny_clarification_sought",
      checklistProgress: "11 / 12 Verified (Awaiting Fire NOC)",
    },
  ];

  return (
    <RoleDashboardShell
      userEmail={user?.email}
      userRole={user?.role || "scrutiny_officer"}
      fullName={user?.fullName || "Scrutiny Officer"}
    >
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
              Scrutiny Active
            </span>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Scrutiny Committee Worklist & Checklist Engine
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Statutory Document Verification under Approval Process Handbook 2026-27 (15-Day Maximum Turnaround)
          </p>
        </div>

        {/* Worklist Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Assigned Application Dossiers</h3>
            <span className="text-xs text-slate-500 font-mono">2 Applications in Queue</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/70 text-slate-600 font-semibold uppercase text-[10px] border-b border-slate-200">
                  <th className="py-3 px-4">Application ID</th>
                  <th className="py-3 px-4">Technical Institute</th>
                  <th className="py-3 px-4">Checklist Progress</th>
                  <th className="py-3 px-4">SLA Turnaround</th>
                  <th className="py-3 px-4 text-right">Scrutiny Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {worklist.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {item.applicationNumber}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {item.institutionName}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-mono bg-teal-50 text-teal-800 border border-teal-200">
                        {item.checklistProgress}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-amber-700 font-bold font-mono">
                        {item.turnaroundDaysLeft} Days Remaining
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/scrutiny/applications/${item.id}`}
                        className="inline-flex items-center gap-1 font-bold text-teal-600 hover:text-teal-700"
                      >
                        <span>Conduct Scrutiny</span>
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
