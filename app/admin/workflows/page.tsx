import React, { Suspense } from "react";
import { getWorkflowRoutingAndRadar } from "@/lib/workflowEngine";
import { WorkflowRouteVisualizer } from "@/components/admin/WorkflowRouteVisualizer";
import { DeadlineRiskRadar } from "@/components/admin/DeadlineRiskRadar";
import { RemindersAndEscalationPanel } from "@/components/admin/RemindersAndEscalationPanel";

export const metadata = {
  title: "Workflow Routing & Deadline Engine | AICTE SAKSHAM",
  description: "Configurable multi-route statutory pipelines, stage turnaround calculators, and Deadline-Risk Radar",
};

async function WorkflowsDashboardContent() {
  const result = await getWorkflowRoutingAndRadar();

  return (
    <div className="space-y-8">
      {/* Page Title & KPI Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Workflow Routing & Stage Deadline Command Engine
            </h2>
            {result.isDemo && (
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                Sample Data
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time execution of AICTE Approval Process Handbook (APH 2026-27) SLA turnaround rules
          </p>
        </div>

        {/* Quick KPI Strip */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-2xs text-xs">
            <span className="text-slate-400 font-medium">Monitored:</span>{" "}
            <span className="font-bold text-slate-800">{result.stats.totalMonitored}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-xs">
            <span className="text-rose-600 font-medium">Overdue:</span>{" "}
            <span className="font-bold text-rose-800">{result.stats.overdueCount}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-xs">
            <span className="text-amber-600 font-medium">Due &le; 2d:</span>{" "}
            <span className="font-bold text-amber-800">{result.stats.dueNowCount}</span>
          </div>
        </div>
      </div>

      {/* 1. Configurable Multi-Route Visualizer */}
      <WorkflowRouteVisualizer routes={result.routes} />

      {/* 2. Real-Time Deadline-Risk Radar */}
      <DeadlineRiskRadar items={result.deadlineRadar} isDemo={result.isDemo} />

      {/* 3. Duplicate-Safe Escalation & Reminder Engine */}
      <RemindersAndEscalationPanel radarItems={result.deadlineRadar} />
    </div>
  );
}

export default function WorkflowsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-medium">Computing statutory turnaround SLA matrices...</p>
        </div>
      }
    >
      <WorkflowsDashboardContent />
    </Suspense>
  );
}
