import React, { Suspense } from "react";
import { createServerClient } from "@/lib/supabase/server";
import { ApplicationsTable } from "@/components/admin/ApplicationsTable";
import { DEMO_DASHBOARD_DATA } from "@/components/admin/demoData";
import type { ApplicationStatus } from "@/types/database";
import type { QueryApplication } from "@/types/admin";

export const metadata = {
  title: "Applications Management | AICTE SAKSHAM",
  description: "Browse, filter, and review technical institute statutory applications",
};

async function ApplicationsContent() {
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
          regionName: reg?.name || "Central",
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
    console.warn("ApplicationsContent: falling back to demo records", err);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Statutory Applications Directory
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Complete registry of Extension of Approval (EoA), New Institutes, and Program Expansion
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            Total Listed: {applications.length}
          </span>
        </div>
      </div>

      <ApplicationsTable initialApplications={applications} isDemo={isDemo} />
    </div>
  );
}

export default function ApplicationsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-medium">Loading statutory applications registry...</p>
        </div>
      }
    >
      <ApplicationsContent />
    </Suspense>
  );
}
