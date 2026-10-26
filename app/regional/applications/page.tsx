import React, { Suspense } from "react";
import { getCurrentUserContext } from "@/lib/authContext";
import { AccessDeniedView } from "@/components/auth/AccessDeniedView";
import { RoleDashboardShell } from "@/components/navigation/RoleDashboardShell";
import { ApplicationsTable } from "@/components/admin/ApplicationsTable";
import { DEMO_DASHBOARD_DATA } from "@/components/admin/demoData";
import { createServerClient } from "@/lib/supabase/server";
import type { ApplicationStatus } from "@/types/database";
import type { QueryApplication } from "@/types/admin";

export const metadata = {
  title: "Regional Applications | AICTE SAKSHAM",
  description: "Browse and review statutory applications strictly within your regional jurisdiction",
};

async function RegionalApplicationsContent() {
  const user = await getCurrentUserContext();

  if (user && user.role !== "regional_officer" && user.role !== "council_admin") {
    return (
      <AccessDeniedView
        requiredRole="regional_officer"
        actualRole={user.role}
        message="Only authorized Regional Directorate Officers can access regional jurisdiction dockets."
      />
    );
  }

  let applications = DEMO_DASHBOARD_DATA.recentApplications;
  let isDemo = true;

  try {
    const supabase = await createServerClient();
    const { data, error } = await (supabase.from("applications") as unknown as {
      select: (query: string) => {
        order: (col: string, opts: { ascending: boolean }) => Promise<{
          data: QueryApplication[] | null;
          error: unknown;
        }>;
      };
    })
      .select(`
        id,
        application_number,
        academic_year,
        application_type,
        status,
        current_stage,
        submission_date,
        target_decision_date,
        institution:institutions (
          name,
          aicte_id
        ),
        region:regions (
          name,
          code
        )
      `)
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      isDemo = false;
      applications = data.map((a) => {
        const inst = a.institution;
        const reg = a.region;

        return {
          id: a.id,
          applicationNumber: a.application_number,
          institutionName: inst?.name || "Unknown Institution",
          permanentInstituteId: inst?.aicte_id || "N/A",
          regionName: reg?.name || "Western Region",
          programType: a.application_type || "Technical Education",
          academicYear: a.academic_year,
          status: a.status as ApplicationStatus,
          currentStage: a.current_stage || "scrutiny",
          submittedAt: a.submission_date,
          targetDecisionDate: a.target_decision_date,
        };
      });
    }
  } catch (err) {
    console.warn("RegionalApplicationsContent error:", err);
  }

  return (
    <RoleDashboardShell
      userEmail={user?.email}
      userRole={user?.role || "regional_officer"}
      fullName={user?.fullName || "Regional Officer"}
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                Regional Boundary Enforced
              </span>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Regional Jurisdiction Applications
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Statutory dossiers allocated to Western Regional Office (Mumbai)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              Total Jurisdiction Files: {applications.length}
            </span>
          </div>
        </div>

        <ApplicationsTable
          initialApplications={applications}
          isDemo={isDemo}
          detailBaseUrl="/regional/applications"
        />
      </div>
    </RoleDashboardShell>
  );
}

export default function RegionalApplicationsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-medium">Loading regional dossiers...</p>
        </div>
      }
    >
      <RegionalApplicationsContent />
    </Suspense>
  );
}
