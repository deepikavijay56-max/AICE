import React, { Suspense } from "react";
import { createServerClient } from "@/lib/supabase/server";
import { WorkflowIcon, ClockIcon, CheckCircleIcon } from "@/components/admin/Icons";
import type { QueryDeadlinePolicy } from "@/types/admin";

export const metadata = {
  title: "Workflow Monitoring & SLAs | AICTE SAKSHAM",
  description: "Monitor regulatory milestones, task turnarounds, and statutory SLA policies",
};

interface WorkflowPolicyItem {
  id: string;
  stageName: string;
  maxDaysAllowed: number;
  escalationLevel: string;
  description: string;
}

const DEFAULT_POLICIES: WorkflowPolicyItem[] = [
  {
    id: "sla-1",
    stageName: "Initial Scrutiny Review",
    maxDaysAllowed: 15,
    escalationLevel: "Regional Officer",
    description: "Verification of uploaded land documents, fire safety NOC, and statutory affidavits.",
  },
  {
    id: "sla-2",
    stageName: "Institution Deficiency Rectification",
    maxDaysAllowed: 7,
    escalationLevel: "System Reminder",
    description: "Window allotted to institute to submit clarified compliance documentation.",
  },
  {
    id: "sla-3",
    stageName: "EVC Committee Scheduling & Visit",
    maxDaysAllowed: 14,
    escalationLevel: "Regional Officer & Council Bureau",
    description: "Physical or virtual inspection of infrastructure, laboratories, and faculty roster.",
  },
  {
    id: "sla-4",
    stageName: "Standing Appellate Committee (SAC)",
    maxDaysAllowed: 21,
    escalationLevel: "Council Member Secretary",
    description: "Hearing of institute appeals against negative scrutiny or adverse EVC reports.",
  },
  {
    id: "sla-5",
    stageName: "Final Council Decision Order",
    maxDaysAllowed: 10,
    escalationLevel: "Approval Bureau Chairman",
    description: "Executive endorsement and cryptographic signing of LoA / EoA letters.",
  },
];

async function WorkflowsContent() {
  let policies = DEFAULT_POLICIES;
  let isDemo = true;

  try {
    const supabase = await createServerClient();
    const { data } = await (supabase.from("deadline_policies") as unknown as {
      select: (query: string) => {
        order: (col: string, opts: { ascending: boolean }) => Promise<{
          data: QueryDeadlinePolicy[] | null;
          error: unknown;
        }>;
      };
    })
      .select("id, stage_key, turnaround_days, warning_threshold_days, auto_escalation_enabled")
      .order("created_at", { ascending: true });

    if (data && data.length > 0) {
      isDemo = false;
      policies = data.map((d) => ({
        id: d.id,
        stageName: d.stage_key.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
        maxDaysAllowed: d.turnaround_days || 15,
        escalationLevel: d.auto_escalation_enabled ? "Regional Officer & Council" : "Manual Review",
        description: `Statutory turnaround threshold: ${d.turnaround_days} days (Warning alert at ${d.warning_threshold_days} days)`,
      }));
    }
  } catch (err) {
    console.warn("WorkflowsContent: falling back to demo policies", err);
  }

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Workflow & Statutory SLA Monitoring
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Tracking lifecycle progression, stage timeouts, and escalation triggers across all 8 AICTE regions
          </p>
        </div>

        {isDemo && (
          <span className="text-[10px] font-semibold uppercase px-2 py-1 rounded bg-slate-100 text-slate-500 border border-slate-200 self-start sm:self-auto">
            Handbook 2026-27 Defaults
          </span>
        )}
      </div>

      {/* SLA Timeline Pipeline Visual */}
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <WorkflowIcon className="w-4 h-4 text-teal-600" />
          Statutory Multi-Stage Pipeline Stages
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {[
            { step: "01", name: "Application Submission", sub: "Payment & e-Sign" },
            { step: "02", name: "Regional Scrutiny", sub: "15 Days Max" },
            { step: "03", name: "EVC Inspection", sub: "Geotagged & Expert" },
            { step: "04", name: "SAC Review", sub: "Appellate Hearing" },
            { step: "05", name: "Council Decision", sub: "LoA / Rejection" },
          ].map((s) => (
            <div
              key={s.step}
              className="p-4 rounded-lg bg-slate-50 border border-slate-200 relative flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-bold text-teal-600 font-mono">
                  STAGE {s.step}
                </span>
                <p className="text-xs font-bold text-slate-800 mt-1">{s.name}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{s.sub}</p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-[10px] text-slate-400">
                <CheckCircleIcon className="w-3.5 h-3.5 text-teal-500" />
                <span>APH Bound</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Statutory SLA Policies Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-900">
            Active Statutory Deadline Policies (Approval Process Handbook)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Automatic escalations are dispatched to regional officers when stage durations exceed these statutory thresholds
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Workflow Stage</th>
                <th className="py-3 px-4">Max Days Permitted</th>
                <th className="py-3 px-4">Escalation Authority</th>
                <th className="py-3 px-4">Policy Description</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {policies.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {p.stageName}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                      <ClockIcon className="w-3.5 h-3.5" />
                      {p.maxDaysAllowed} Days
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-700">
                    {p.escalationLevel}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 text-[11px] max-w-md">
                    {p.description}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      ACTIVE
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function WorkflowsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-medium">Loading statutory workflow monitor...</p>
        </div>
      }
    >
      <WorkflowsContent />
    </Suspense>
  );
}
