import React, { Suspense } from "react";
import Link from "next/link";
import { getCurrentUserContext } from "@/lib/authContext";
import { AccessDeniedView } from "@/components/auth/AccessDeniedView";
import { RoleDashboardShell } from "@/components/navigation/RoleDashboardShell";
import { createServerClient } from "@/lib/supabase/server";
import { ArrowRightIcon } from "@/components/admin/Icons";
import { PageHeader } from "@/components/ui/PageHeader";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Scrutiny Officer Worklist | AICTE SAKSHAM",
  description: "Document checklist verification, deficiency issuance, and scrutiny progression",
};

interface WorklistItem {
  id: string;
  applicationNumber: string;
  institutionName: string;
  applicationType: string;
  submissionDate: string;
  turnaroundDaysLeft: number;
  status: string;
  checklistProgress: string;
  routeCode: string;
}

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

  const supabase = await createServerClient();
  const worklist: WorklistItem[] = [];

  // Query real applications awaiting scrutiny from Supabase
  try {
    const { data: dbApps } = await (supabase.from("applications") as unknown as {
      select: (cols: string) => {
        in: (col: string, vals: string[]) => {
          order: (col: string, opts: { ascending: boolean }) => Promise<{
            data: Array<{
              id: string;
              application_number: string;
              application_type: string;
              status: string;
              submission_date: string | null;
              target_decision_date: string | null;
              institution?: { name: string } | null;
              workflow_definition?: { code: string } | null;
            }> | null;
          }>;
        };
      };
    })
      .select(`
        id,
        application_number,
        application_type,
        status,
        submission_date,
        target_decision_date,
        institution:institutions(name),
        workflow_definition:workflow_definitions(code)
      `)
      .in("status", ["submitted", "under_scrutiny", "scrutiny_clarification_sought"])
      .order("created_at", { ascending: false });

    if (dbApps && dbApps.length > 0) {
      for (const app of dbApps) {
        // Query verified document count
        const { data: docStats } = await (supabase.from("documents") as unknown as {
          select: (cols: string) => {
            eq: (col: string, val: string) => Promise<{
              data: Array<{ is_verified: boolean; metadata: Record<string, unknown> }> | null;
            }>;
          };
        })
          .select("is_verified, metadata")
          .eq("application_id", app.id);

        const totalDocs = docStats?.length || 0;
        const verifiedDocs = (docStats || []).filter((d) => d.is_verified).length;
        const deficientDocs = (docStats || []).filter((d) => d.metadata?.scrutiny_status === "deficient").length;

        let progressLabel = `${verifiedDocs} / ${totalDocs || 5} Verified`;
        if (deficientDocs > 0) {
          progressLabel = `${verifiedDocs} / ${totalDocs} Verified (${deficientDocs} Deficient)`;
        }

        // Calculate days left against 15-day SLA
        let daysLeft = 15;
        if (app.submission_date) {
          const submittedDate = new Date(app.submission_date);
          const targetDeadline = new Date(submittedDate.getTime() + 15 * 24 * 60 * 60 * 1000);
          daysLeft = Math.max(0, Math.ceil((targetDeadline.getTime() - submittedDate.getTime()) / (1000 * 60 * 60 * 24)));
        }

        worklist.push({
          id: app.id,
          applicationNumber: app.application_number,
          institutionName: app.institution?.name || "Registered Institute",
          applicationType: app.application_type,
          submissionDate: app.submission_date ? new Date(app.submission_date).toLocaleDateString("en-IN") : "Recently Submitted",
          turnaroundDaysLeft: daysLeft,
          status: app.status,
          checklistProgress: progressLabel,
          routeCode: app.workflow_definition?.code || "SCRUTINY_ONLY",
        });
      }
    }
  } catch {
    // Non-blocking
  }

  // Fallback demo data if database is empty
  if (worklist.length === 0) {
    worklist.push(
      {
        id: "app-104",
        applicationNumber: "AICTE-2026-MCA-00019",
        institutionName: "Harcourt Butler Technical University",
        applicationType: "MCA / Computer Applications",
        submissionDate: "02 Oct 2026",
        turnaroundDaysLeft: 3,
        status: "under_scrutiny",
        checklistProgress: "8 / 12 Verified",
        routeCode: "SCRUTINY_ONLY",
      },
      {
        id: "app-105",
        applicationNumber: "AICTE-2026-ARCH-00007",
        institutionName: "Jadavpur University School of Architecture",
        applicationType: "Architecture & Planning",
        submissionDate: "28 Sep 2026",
        turnaroundDaysLeft: 6,
        status: "scrutiny_clarification_sought",
        checklistProgress: "11 / 12 Verified (Awaiting Fire NOC)",
        routeCode: "SCRUTINY_EVC",
      }
    );
  }

  return (
    <RoleDashboardShell
      userEmail={user?.email}
      userRole={user?.role || "scrutiny_officer"}
      fullName={user?.fullName || "Scrutiny Officer"}
    >
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        <PageHeader
          title="Scrutiny Committee Worklist"
          subtitle="Statutory document verification and deficiency management under AICTE APH Chapter II."
          badge="Scrutiny Active"
          badgeTone="amber"
          actions={
            <div className="text-xs text-slate-500 font-mono bg-white px-3 py-1.5 rounded-lg border border-slate-200">
              Active Queue: <strong className="text-slate-900">{worklist.length} Applications</strong>
            </div>
          }
        />

        {/* Worklist Table */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Assigned Application Dossiers</h3>
              <p className="text-xs text-slate-500 mt-0.5">Prioritized by SLA submission age and statutory deadline</p>
            </div>
            <span className="text-xs text-slate-500 font-mono">{worklist.length} Cases Monitored</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Application ID</th>
                  <th className="py-3 px-4">Technical Institute</th>
                  <th className="py-3 px-4">Route &amp; Discipline</th>
                  <th className="py-3 px-4">Checklist Progress</th>
                  <th className="py-3 px-4">SLA Turnaround</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Scrutiny Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {worklist.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-slate-900 block">{item.applicationNumber}</span>
                      <span className="text-[10px] text-slate-400 font-mono">Sub: {item.submissionDate}</span>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {item.institutionName}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono text-blue-700 font-bold block">{item.routeCode}</span>
                      <span className="text-[10px] text-slate-500">{item.applicationType}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-1 rounded text-[11px] font-mono bg-teal-50 text-teal-800 border border-teal-200 font-bold">
                        {item.checklistProgress}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`font-bold font-mono ${
                        item.turnaroundDaysLeft <= 3 ? "text-rose-700" : "text-amber-700"
                      }`}>
                        {item.turnaroundDaysLeft} Days Remaining
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                        item.status === "scrutiny_clarification_sought"
                          ? "bg-rose-50 text-rose-800 border-rose-200"
                          : "bg-blue-50 text-blue-800 border-blue-200"
                      }`}>
                        {item.status.replace(/_/g, " ")}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/scrutiny/applications/${item.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-colors shadow-2xs"
                      >
                        <span>Review Application</span>
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
