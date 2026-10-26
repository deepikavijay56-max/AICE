import React, { Suspense } from "react";
import Link from "next/link";
import { getCurrentUserContext } from "@/lib/authContext";
import { AccessDeniedView } from "@/components/auth/AccessDeniedView";
import { RoleDashboardShell } from "@/components/navigation/RoleDashboardShell";
import { createServerClient } from "@/lib/supabase/server";
import {
  ArrowRightIcon,
} from "@/components/admin/Icons";

export const metadata = {
  title: "Institution Portal | AICTE SAKSHAM",
  description: "Submit new applications, track Extension of Approval (EoA), deficiency replies, and compliance affirmations",
};

interface ApplicationDocketItem {
  id: string;
  applicationNumber: string;
  institutionName: string;
  academicYear: string;
  applicationType: string;
  currentStage: string;
  status: string;
  submissionDate: string | null;
  targetDecisionDate: string | null;
  isDraft: boolean;
  missingDocumentsCount?: number;
  nextAction: string;
}

export default function InstitutionPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-medium">Verifying institutional credentials...</p>
        </div>
      }
    >
      <InstitutionContent />
    </Suspense>
  );
}

async function InstitutionContent() {
  const user = await getCurrentUserContext();

  if (
    user &&
    user.role !== "institution_admin" &&
    user.role !== "institution_user" &&
    user.role !== "council_admin"
  ) {
    return (
      <AccessDeniedView
        requiredRole="institution_admin"
        actualRole={user.role}
        message="Only registered Technical Institute administrators can access their institution's application docket."
      />
    );
  }

  const supabase = await createServerClient();

  let institutionName = "COEP Technological University (PID: 1-10992341)";
  const applications: ApplicationDocketItem[] = [];

  // Query real applications and profile from Supabase
  try {
    const { data: profile } = await (supabase.from("profiles") as unknown as {
      select: (cols: string) => {
        eq: (col: string, val: string) => {
          single: () => Promise<{
            data: {
              institution_id: string | null;
              institution?: { id: string; name: string; aicte_id: string | null } | null;
            } | null;
          }>;
        };
      };
    })
      .select("institution_id, institution:institutions(id, name, aicte_id)")
      .eq("id", user?.userId || "")
      .single();

    if (profile?.institution) {
      institutionName = `${profile.institution.name} (PID: ${profile.institution.aicte_id || "Registered"})`;
    }

    // Query applications belonging to this institution
    const query = (supabase.from("applications") as unknown as {
      select: (cols: string) => {
        order: (col: string, opts: { ascending: boolean }) => Promise<{
          data: Array<{
            id: string;
            application_number: string;
            academic_year: string;
            application_type: string;
            current_stage: string;
            status: string;
            submission_date: string | null;
            target_decision_date: string | null;
            institution?: { name: string } | null;
          }> | null;
        }>;
      };
    }).select(`
      id,
      application_number,
      academic_year,
      application_type,
      current_stage,
      status,
      submission_date,
      target_decision_date,
      institution:institutions(name)
    `);

    const { data: dbApps } = await query.order("created_at", { ascending: false });

    if (dbApps && dbApps.length > 0) {
      for (const app of dbApps) {
        const isDraft = app.status === "draft";
        let nextAction = "Track Scrutiny Status";
        if (isDraft) {
          nextAction = "Upload Missing Documents & Submit";
        } else if (app.status === "scrutiny_clarification_sought") {
          nextAction = "Upload Deficiency Clarifications";
        } else if (app.status === "approved") {
          nextAction = "Download Extension of Approval (EoA) Order";
        } else if (app.status === "council_decision_pending") {
          nextAction = "Awaiting Executive Council Endorsement";
        }

        applications.push({
          id: app.id,
          applicationNumber: app.application_number,
          institutionName: app.institution?.name || institutionName,
          academicYear: app.academic_year,
          applicationType: app.application_type,
          currentStage: app.current_stage,
          status: app.status,
          submissionDate: app.submission_date ? new Date(app.submission_date).toLocaleDateString("en-IN") : null,
          targetDecisionDate: app.target_decision_date ? new Date(app.target_decision_date).toLocaleDateString("en-IN") : null,
          isDraft,
          nextAction,
        });
      }
    }
  } catch {
    // Non-blocking
  }

  // Fallback demo row if database has no rows yet
  if (applications.length === 0) {
    applications.push({
      id: "app-101",
      applicationNumber: "AICTE-2026-ENGG-00124",
      institutionName: "COEP Technological University",
      academicYear: "2026-2027",
      applicationType: "Extension of Approval (EoA)",
      currentStage: "Council Decision Review",
      status: "council_decision_pending",
      submissionDate: "12 Sep 2026",
      targetDecisionDate: "15 Nov 2026",
      isDraft: false,
      nextAction: "Awaiting Executive Council Endorsement",
    });
  }

  const activeApp = applications[0];

  return (
    <RoleDashboardShell
      userEmail={user?.email}
      userRole={user?.role || "institution_admin"}
      fullName={user?.fullName || "Institution Registrar / Director"}
    >
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Top Banner with Action CTA */}
        <div className="bg-[#0B1F36] text-white rounded-xl p-6 sm:p-7 shadow-xs relative overflow-hidden border border-[#142D4E]">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/10 text-teal-300 border border-white/15 text-[10px] font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                AY 2026-2027 Approval Cycle Active
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Technical Institution Docket
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                {institutionName} &bull; Manage statutory Extension of Approval (EoA), New Technical Program additions, and regulatory deficiency replies.
              </p>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row gap-3">
              <Link
                href="/institution/applications/new"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs sm:text-sm font-bold transition-all shadow-xs"
              >
                <span>+ Submit New Application</span>
                <ArrowRightIcon className="w-4 h-4 text-white" />
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Statutory Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Total Dockets</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{applications.length}</div>
            <span className="text-[10px] text-slate-500 mt-0.5 block">National Registry</span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Active In Scrutiny</span>
            <div className="text-2xl font-bold text-blue-700 mt-1">
              {applications.filter((a) => a.status === "under_scrutiny" || a.status === "submitted").length}
            </div>
            <span className="text-[10px] text-blue-600 mt-0.5 block">Under Regional Review</span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Pending Council Review</span>
            <div className="text-2xl font-bold text-purple-700 mt-1">
              {applications.filter((a) => a.status === "council_decision_pending").length}
            </div>
            <span className="text-[10px] text-purple-600 mt-0.5 block">Executive Council Review</span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Draft Applications</span>
            <div className="text-2xl font-bold text-amber-700 mt-1">
              {applications.filter((a) => a.isDraft).length}
            </div>
            <span className="text-[10px] text-amber-600 mt-0.5 block">Ready for Submission</span>
          </div>
        </div>

        {/* Section: "My Applications" Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                  Institutional Docket
                </span>
                <h3 className="text-base font-bold text-slate-900">My Applications</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                All statutory applications initiated, drafted, or submitted by this institution.
              </p>
            </div>

            <Link
              href="/institution/applications/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors shadow-2xs self-start sm:self-auto"
            >
              <span>+ Create Application</span>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/70 text-slate-600 font-semibold uppercase text-[10px] border-b border-slate-200">
                  <th className="py-3 px-4">Application ID</th>
                  <th className="py-3 px-4">Application Type &amp; AY</th>
                  <th className="py-3 px-4">Submitted Date</th>
                  <th className="py-3 px-4">Current Stage</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Next Action</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app) => {
                  const isDraft = app.isDraft;

                  return (
                    <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-slate-900 block">{app.applicationNumber}</span>
                        <span className="text-[10px] text-slate-400 font-mono">UUID: {app.id.slice(0, 8)}...</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800 block">{app.applicationType}</span>
                        <span className="text-[10px] text-slate-500 font-mono">AY {app.academicYear}</span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {app.submissionDate ? (
                          app.submissionDate
                        ) : (
                          <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[10px]">
                            Not Submitted
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-800 block capitalize">
                          {app.currentStage.replace(/_/g, " ")}
                        </span>
                        {app.targetDecisionDate && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            Target SLA: {app.targetDecisionDate}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 font-bold px-2.5 py-1 rounded-full text-[10px] uppercase border ${
                            app.status === "approved"
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                              : app.status === "draft"
                              ? "bg-amber-100 text-amber-800 border-amber-300"
                              : app.status === "under_scrutiny" || app.status === "submitted"
                              ? "bg-blue-100 text-blue-800 border-blue-300"
                              : app.status === "scrutiny_clarification_sought"
                              ? "bg-rose-100 text-rose-800 border-rose-300"
                              : "bg-purple-100 text-purple-800 border-purple-300"
                          }`}
                        >
                          {app.status.replace(/_/g, " ")}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-xs text-slate-700 font-medium block">
                          {app.nextAction}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {isDraft ? (
                            <Link
                              href="/institution/applications/new"
                              className="px-2.5 py-1 rounded-md bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] transition-colors"
                            >
                              Continue Draft
                            </Link>
                          ) : (
                            <>
                              <Link
                                href={`/institution/applications/${app.id}`}
                                className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-colors"
                              >
                                View Application
                              </Link>
                              <Link
                                href={`/institution/applications/${app.id}`}
                                className="px-2.5 py-1 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-[11px] transition-colors"
                              >
                                Track Status
                              </Link>
                            </>
                          )}

                          {app.status === "scrutiny_clarification_sought" && (
                            <Link
                              href="/admin/compliance"
                              className="px-2.5 py-1 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-[11px] transition-colors border border-rose-200"
                            >
                              Upload Missing Documents
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Active Application Detail Callout */}
        {activeApp && !activeApp.isDraft && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                  AY {activeApp.academicYear} &bull; {activeApp.applicationType}
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1.5 font-mono">
                  {activeApp.applicationNumber}
                </h3>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-bold uppercase px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                  {activeApp.status.replace(/_/g, " ")}
                </span>
                <div className="text-[11px] text-slate-400 mt-1 font-mono">
                  Target SLA: {activeApp.targetDecisionDate || "Pending"}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 font-medium block text-[10px] uppercase">Current Lifecycle Stage</span>
                <span className="font-bold text-slate-800 text-xs mt-0.5 block">{activeApp.currentStage}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 font-medium block text-[10px] uppercase">Submission Date</span>
                <span className="font-bold text-slate-800 text-xs mt-0.5 block">{activeApp.submissionDate || "In Draft"}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 font-medium block text-[10px] uppercase">Assigned Authority</span>
                <span className="font-bold text-emerald-700 text-xs mt-0.5 block">Western Regional Committee</span>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href={`/institution/applications/${activeApp.id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors shadow-2xs"
              >
                <span>View Case Flight Recorder &amp; Documents</span>
                <ArrowRightIcon className="w-3.5 h-3.5" />
              </Link>

              <Link
                href="/admin/compliance"
                className="px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
              >
                Manage Deficiency Submissions
              </Link>
            </div>
          </div>
        )}
      </div>
    </RoleDashboardShell>
  );
}
