import React, { Suspense } from "react";
import Link from "next/link";
import { getCurrentUserContext } from "@/lib/authContext";
import { AccessDeniedView } from "@/components/auth/AccessDeniedView";
import { RoleDashboardShell } from "@/components/navigation/RoleDashboardShell";
import { createServerClient } from "@/lib/supabase/server";
import { ArrowRightIcon } from "@/components/admin/Icons";

export const metadata = {
  title: "Regional Directorate Dashboard | AICTE SAKSHAM",
  description: "Jurisdictional case pendency, scrutiny allocation, and regional EVC tracking",
};

async function RegionalDashboardContent() {
  const user = await getCurrentUserContext();

  // If user is logged in but not a regional officer or council admin, block access
  if (user && user.role !== "regional_officer" && user.role !== "council_admin") {
    return (
      <AccessDeniedView
        requiredRole="regional_officer"
        actualRole={user.role}
        message="Only authorized Regional Directorate Officers can access regional jurisdiction dockets."
      />
    );
  }

  let regionalApps: Array<{
    id: string;
    application_number: string;
    status: string;
    current_stage: string;
    created_at: string;
    institution: { name: string; aicte_id: string | null } | null;
  }> = [];

  let isDemo = true;
  const regionName = "Western Regional Office (Mumbai)";

  try {
    const supabase = await createServerClient();
    const { data } = await (supabase.from("applications") as unknown as {
      select: (cols: string) => {
        order: (col: string, opts: { ascending: boolean }) => Promise<{
          data: typeof regionalApps | null;
          error: unknown;
        }>;
      };
    })
      .select(`
        id,
        application_number,
        status,
        current_stage,
        created_at,
        institution:institutions (name, aicte_id)
      `)
      .order("created_at", { ascending: false });

    if (data && data.length > 0) {
      isDemo = false;
      regionalApps = data;
    }
  } catch (err) {
    console.warn("Regional dashboard fallback", err);
  }

  // Fallback demo data for regional officer
  if (regionalApps.length === 0) {
    regionalApps = [
      {
        id: "app-101",
        application_number: "AICTE-2026-ENGG-00124",
        status: "under_scrutiny",
        current_stage: "under_scrutiny",
        created_at: "2026-09-12T10:30:00Z",
        institution: { name: "K.J. Somaiya College of Engineering", aicte_id: "1-4251781" },
      },
      {
        id: "app-102",
        application_number: "AICTE-2026-MGMT-00088",
        status: "evc_scheduled",
        current_stage: "evc_inspection",
        created_at: "2026-09-18T14:15:00Z",
        institution: { name: "T.A. Pai Management Institute", aicte_id: "1-1289456" },
      },
    ];
  }

  return (
    <RoleDashboardShell
      userEmail={user?.email}
      userRole={user?.role || "regional_officer"}
      fullName={user?.fullName || "Regional Officer"}
    >
      <div className="space-y-6">
        {/* Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                Jurisdiction Active
              </span>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Regional Directorate Command Portal
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {regionName} &bull; Statutory Scrutiny &amp; Inspection Oversight
            </p>
          </div>

          {isDemo && (
            <span className="text-[10px] font-semibold uppercase px-2 py-1 rounded bg-slate-100 text-slate-500 border border-slate-200 self-start sm:self-auto">
              Sample Regional Ledger
            </span>
          )}
        </div>

        {/* Quick KPI stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold uppercase text-slate-400">Jurisdiction Applications</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{regionalApps.length}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Statutory files in regional jurisdiction</p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold uppercase text-slate-400">Under Scrutiny</span>
            <div className="text-2xl font-black text-amber-600 mt-1">
              {regionalApps.filter((a) => a.status === "under_scrutiny").length}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Assigned to regional scrutiny panels</p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold uppercase text-slate-400">EVC Visits Active</span>
            <div className="text-2xl font-black text-cyan-700 mt-1">
              {regionalApps.filter((a) => a.status === "evc_scheduled").length}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">On-site expert inspections</p>
          </div>
        </div>

        {/* Jurisdiction Applications List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Regional Application Dossiers
            </h3>
            <span className="text-xs text-slate-500">
              Filtered strictly by Regional RLS Boundary
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/70 text-slate-600 font-semibold uppercase text-[10px] border-b border-slate-200">
                  <th className="py-3 px-4">Application ID</th>
                  <th className="py-3 px-4">Technical Institute</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {regionalApps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {app.application_number}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{app.institution?.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        PID: {app.institution?.aicte_id || "N/A"}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono capitalize text-slate-600">
                      {app.current_stage.replace(/_/g, " ")}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {app.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/regional/applications/${app.id}`}
                        className="inline-flex items-center gap-1 font-bold text-teal-600 hover:text-teal-700"
                      >
                        <span>Review File</span>
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

export default function RegionalDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-medium">Verifying regional jurisdiction authorization...</p>
        </div>
      }
    >
      <RegionalDashboardContent />
    </Suspense>
  );
}
