"use client";

import React, { useState } from "react";
import type { ConfiguredWorkflowRoute } from "@/lib/workflowEngine";
import { WorkflowIcon, ClockIcon } from "./Icons";

interface WorkflowRouteVisualizerProps {
  routes: ConfiguredWorkflowRoute[];
}

export function WorkflowRouteVisualizer({ routes }: WorkflowRouteVisualizerProps) {
  const [selectedRouteId, setSelectedRouteId] = useState<string>(routes[0]?.id || "");

  const activeRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-600 flex items-center justify-center font-bold">
            <WorkflowIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Configurable Workflow Routing Engine
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Active regulatory pathways under AICTE Approval Process Handbook (APH 2026-27)
            </p>
          </div>
        </div>

        {/* Route Selector Tabs */}
        <div className="flex flex-wrap gap-1.5 text-xs">
          {routes.map((route) => (
            <button
              key={route.id}
              onClick={() => setSelectedRouteId(route.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeRoute?.id === route.id
                  ? "bg-teal-600 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {route.code.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {activeRoute && (
        <div className="p-5 sm:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900">{activeRoute.title}</h4>
                {activeRoute.isDefault && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-50 text-teal-700 font-bold border border-teal-200 uppercase">
                    Default Pipeline
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl">{activeRoute.description}</p>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-slate-700">
                Total Max Turnaround:{" "}
                <span className="text-teal-600">
                  {activeRoute.stageSequence.reduce((sum, s) => sum + s.turnaroundDays, 0)} Days
                </span>
              </span>
            </div>
          </div>

          {/* Sequential Stage Pathway */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative">
            {activeRoute.stageSequence.map((step, idx) => (
              <div
                key={step.stageKey}
                className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 relative flex flex-col justify-between hover:border-teal-400 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono font-bold text-teal-600">
                      STEP 0{idx + 1}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-700">
                      {step.roleRequired}
                    </span>
                  </div>

                  <h5 className="text-xs font-bold text-slate-800 mt-2">{step.stageName}</h5>
                  <div className="text-[11px] text-slate-500 font-mono mt-1">
                    Key: {step.stageKey}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/70 flex items-center justify-between text-[11px]">
                  <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                    <ClockIcon className="w-3.5 h-3.5 text-amber-500" />
                    {step.turnaroundDays}d Max SLA
                  </span>
                  <span className="text-[10px] text-rose-600 font-bold">
                    Warn &le; {step.warningThresholdDays}d
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
