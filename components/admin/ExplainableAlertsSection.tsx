"use client";

import React, { useState } from "react";
import { CloseIcon } from "./Icons";
import { EXPLAINABLE_ALERTS, type ExplainableAlert } from "./explainableAlerts";
import { useTimeMachine } from "./TimeMachineContext";

export function ExplainableAlertsSection() {
  const { simulatedDaysOffset, isSimulated } = useTimeMachine();
  const [selectedAlert, setSelectedAlert] = useState<ExplainableAlert | null>(null);

  // Compute simulated SLA impact on alerts based on the TimeMachine simulated offset
  const alerts = EXPLAINABLE_ALERTS.map((a) => {
    const adjustedDays = a.daysRemainingOrOverdue - simulatedDaysOffset;
    const isNowOverdue = adjustedDays <= 0;
    const severity =
      adjustedDays < -5
        ? "critical"
        : adjustedDays <= 0
        ? "high"
        : adjustedDays <= 3
        ? "medium"
        : a.severity;

    return {
      ...a,
      daysRemainingOrOverdue: adjustedDays,
      isOverdue: isNowOverdue,
      severity: severity as ExplainableAlert["severity"],
    };
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Statutory SLA Alerts & Deadline Reminders
            </h3>
            {isSimulated && (
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                Simulated (+{simulatedDaysOffset}d)
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Rule-driven regulatory escalations showing statutory clause, deadline, and responsible officer
          </p>
        </div>

        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 self-start sm:self-auto">
          {alerts.filter((a) => a.isOverdue).length} Overdue / Escalated
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {alerts.map((alert) => {
          const isCritical = alert.severity === "critical";

          return (
            <div
              key={alert.id}
              onClick={() => setSelectedAlert(alert)}
              className={`p-3.5 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                alert.isOverdue
                  ? isCritical
                    ? "bg-rose-50/60 border-rose-300 hover:border-rose-400"
                    : "bg-amber-50/60 border-amber-300 hover:border-amber-400"
                  : "bg-slate-50 border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      alert.isOverdue ? "bg-rose-600 animate-pulse" : "bg-teal-600"
                    }`}
                  />
                  <span className="font-bold text-xs text-slate-900 font-mono">
                    {alert.applicationNumber}
                  </span>
                </div>

                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                    alert.isOverdue
                      ? "bg-rose-100 text-rose-800 border-rose-300"
                      : "bg-slate-100 text-slate-700 border-slate-200"
                  }`}
                >
                  {alert.isOverdue
                    ? `Overdue by ${Math.abs(alert.daysRemainingOrOverdue)}d`
                    : `${alert.daysRemainingOrOverdue}d remaining`}
                </span>
              </div>

              <div className="mt-2">
                <p className="font-semibold text-xs text-slate-800 truncate">
                  {alert.institutionName}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                  Rule: {alert.ruleName}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-600 font-medium truncate max-w-[200px]">
                  Owner: {alert.responsibleOwner}
                </span>
                <span className="text-teal-700 font-bold flex items-center gap-1">
                  Explain Rule &rarr;
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Full Rule Explanation */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 text-xs space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                  Regulatory Clause Analysis
                </span>
                <h4 className="text-base font-bold text-slate-900 mt-1">
                  {selectedAlert.applicationNumber}
                </h4>
                <p className="text-slate-600 font-medium">{selectedAlert.institutionName}</p>
              </div>
              <button
                onClick={() => setSelectedAlert(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Triggering Regulatory Policy:
                </span>
                <p className="font-semibold text-slate-800 mt-0.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  {selectedAlert.ruleName}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-medium">Statutory Target Date:</span>
                  <p className="font-bold text-slate-800 font-mono mt-0.5">
                    {new Date(selectedAlert.deadlineDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-medium">Current Status:</span>
                  <p
                    className={`font-bold mt-0.5 ${
                      selectedAlert.isOverdue ? "text-rose-700" : "text-emerald-700"
                    }`}
                  >
                    {selectedAlert.isOverdue
                      ? `Overdue (${Math.abs(selectedAlert.daysRemainingOrOverdue)} Days)`
                      : `Within SLA (${selectedAlert.daysRemainingOrOverdue} Days left)`}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Responsible Regulatory Owner:
                </span>
                <p className="font-semibold text-slate-800 mt-0.5">
                  {selectedAlert.responsibleOwner}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Statutory Reason:
                </span>
                <p className="text-slate-600 mt-0.5 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  {selectedAlert.reason}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Mandatory Action Required:
                </span>
                <p className="font-semibold text-teal-800 bg-teal-50/70 p-2.5 rounded-lg border border-teal-200 mt-0.5">
                  {selectedAlert.actionRequired}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Maker-Checker Protection Enforced</span>
              <button
                onClick={() => setSelectedAlert(null)}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors"
              >
                Close Rule Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
