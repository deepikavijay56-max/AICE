"use client";

import React, { useState } from "react";
import {
  ClockIcon,
  RefreshIcon,
  ActivityIcon,
} from "@/components/admin/Icons";
import { useTimeMachine } from "@/components/admin/TimeMachineContext";

interface SyntheticScenario {
  id: string;
  applicationNumber: string;
  institutionName: string;
  routeCode: string;
  currentStage: string;
  nominalTurnaroundDays: number;
  thresholdWarningDays: number;
  responsibleRole: string;
  description: string;
  permittedAction: string;
  nextPermittedStage: string;
}

const SYNTHETIC_SCENARIOS: SyntheticScenario[] = [
  {
    id: "scen-1",
    applicationNumber: "SIM-2026-ENGG-00901",
    institutionName: "National Institute of Advanced Robotics & AI",
    routeCode: "Route B: Scrutiny + EVC",
    currentStage: "under_scrutiny",
    nominalTurnaroundDays: 15,
    thresholdWarningDays: 3,
    responsibleRole: "scrutiny_officer",
    description: "New program introduction in Autonomous Systems. Requires scrutiny clearance followed by 3-member EVC on-site audit.",
    permittedAction: "Issue Scrutiny Clearance & Schedule EVC",
    nextPermittedStage: "evc_scheduled",
  },
  {
    id: "scen-2",
    applicationNumber: "SIM-2026-MGMT-00412",
    institutionName: "Metropolitan School of Executive Management",
    routeCode: "Route A: Scrutiny Only",
    currentStage: "under_scrutiny",
    nominalTurnaroundDays: 10,
    thresholdWarningDays: 2,
    responsibleRole: "scrutiny_officer",
    description: "Standard Extension of Approval (EoA) with unvaried intake capacity. Requires scrutiny recommendation before Council endorsement.",
    permittedAction: "Submit Scrutiny Report to Council",
    nextPermittedStage: "council_decision_pending",
  },
  {
    id: "scen-3",
    applicationNumber: "SIM-2026-PHAR-00108",
    institutionName: "Imperial College of Pharmaceutical Sciences",
    routeCode: "Route C: EVC + SAC Review",
    currentStage: "evc_scheduled",
    nominalTurnaroundDays: 14,
    thresholdWarningDays: 2,
    responsibleRole: "evc_expert",
    description: "Appellate inspection following minor animal house carpet area deficiency observation in initial scrutiny.",
    permittedAction: "Complete Inspection & File EVC Report",
    nextPermittedStage: "evc_completed",
  },
  {
    id: "scen-4",
    applicationNumber: "SIM-2026-POLY-00055",
    institutionName: "Vidya Pratishthan Polytechnic Institute",
    routeCode: "Route D: Only EVC",
    currentStage: "evc_scheduled",
    nominalTurnaroundDays: 7,
    thresholdWarningDays: 2,
    responsibleRole: "evc_expert",
    description: "Surprise regulatory infrastructure inspection directed by Council Bureau for quality benchmarking.",
    permittedAction: "Submit Surprise EVC Audit Findings",
    nextPermittedStage: "council_decision_pending",
  },
];

interface SimulationEventLog {
  id: string;
  virtualDay: number;
  timestamp: string;
  type: "INFO" | "APPROACHING_DEADLINE" | "SLA_BREACH" | "ESCALATION_TRIGGERED" | "ACTION_EXECUTED";
  title: string;
  detail: string;
  targetRole: string;
}

export function SihSimulationLabView() {
  const { simulatedDaysOffset, advanceDays, resetTime } = useTimeMachine();
  const [selectedScenario, setSelectedScenario] = useState<SyntheticScenario>(SYNTHETIC_SCENARIOS[0]);
  const [scenarioState, setScenarioState] = useState<Record<string, { currentStage: string; completedAction?: string }>>({
    "scen-1": { currentStage: SYNTHETIC_SCENARIOS[0].currentStage },
    "scen-2": { currentStage: SYNTHETIC_SCENARIOS[1].currentStage },
    "scen-3": { currentStage: SYNTHETIC_SCENARIOS[2].currentStage },
    "scen-4": { currentStage: SYNTHETIC_SCENARIOS[3].currentStage },
  });
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [actionSuccessNotice, setActionSuccessNotice] = useState<string | null>(null);
  const [isExecutingAction, setIsExecutingAction] = useState<boolean>(false);
  const [eventLogs, setEventLogs] = useState<SimulationEventLog[]>([
    {
      id: "log-init",
      virtualDay: 0,
      timestamp: "Day 00 (09:00 AM IST)",
      type: "INFO",
      title: "Scenario Inception Initialized",
      detail: `Application ${SYNTHETIC_SCENARIOS[0].applicationNumber} placed in stage ${SYNTHETIC_SCENARIOS[0].currentStage}. Nominal turnaround: ${SYNTHETIC_SCENARIOS[0].nominalTurnaroundDays} days.`,
      targetRole: SYNTHETIC_SCENARIOS[0].responsibleRole,
    },
  ]);

  const activeStage = scenarioState[selectedScenario.id]?.currentStage || selectedScenario.currentStage;
  const isActionCompleted = Boolean(scenarioState[selectedScenario.id]?.completedAction);

  const daysRemaining = selectedScenario.nominalTurnaroundDays - simulatedDaysOffset;
  const isApproaching = daysRemaining > 0 && daysRemaining <= selectedScenario.thresholdWarningDays;
  const isOverdue = daysRemaining <= 0;

  const handleAdvance = (daysToAdd: number) => {
    advanceDays(daysToAdd);
    const nextDays = simulatedDaysOffset + daysToAdd;
    setActionSuccessNotice(null);

    const newLogs: SimulationEventLog[] = [];
    const remaining = selectedScenario.nominalTurnaroundDays - nextDays;

    if (remaining > 0 && remaining <= selectedScenario.thresholdWarningDays) {
      newLogs.push({
        id: `log-warn-${nextDays}-${Date.now()}`,
        virtualDay: nextDays,
        timestamp: `Day ${String(nextDays).padStart(2, "0")} (10:30 AM IST)`,
        type: "APPROACHING_DEADLINE",
        title: "Approaching Statutory Deadline Warning",
        detail: `Turnaround SLA expires in ${remaining} days. Warning threshold (<= ${selectedScenario.thresholdWarningDays}d) breached. Auto-reminder dispatched to ${selectedScenario.responsibleRole}.`,
        targetRole: selectedScenario.responsibleRole,
      });
      setActiveStepIndex(3);
    } else if (remaining <= 0) {
      const overdueDays = Math.abs(remaining);
      newLogs.push({
        id: `log-breach-${nextDays}-${Date.now()}`,
        virtualDay: nextDays,
        timestamp: `Day ${String(nextDays).padStart(2, "0")} (08:00 AM IST)`,
        type: "SLA_BREACH",
        title: "Statutory SLA Turnaround Exceeded",
        detail: `Statutory turnaround of ${selectedScenario.nominalTurnaroundDays} days lapsed by ${overdueDays} days. Mandated under AICTE APH Chapter II.`,
        targetRole: selectedScenario.responsibleRole,
      });
      newLogs.push({
        id: `log-esc-${nextDays}-${Date.now()}`,
        virtualDay: nextDays,
        timestamp: `Day ${String(nextDays).padStart(2, "0")} (08:05 AM IST)`,
        type: "ESCALATION_TRIGGERED",
        title: "Automated Regulatory Escalation Dispatched",
        detail: `Escalation event logged in duplicate-safe ledger. Primary recipient: Regional Officer. Escalation Tier 2: Council Approval Bureau Secretariat.`,
        targetRole: "council_admin / regional_officer",
      });
      setActiveStepIndex(5);
    } else {
      newLogs.push({
        id: `log-adv-${nextDays}-${Date.now()}`,
        virtualDay: nextDays,
        timestamp: `Day ${String(nextDays).padStart(2, "0")} (09:00 AM IST)`,
        type: "INFO",
        title: `Virtual Clock Advanced (+${daysToAdd} Days)`,
        detail: `Case operating normally within SLA turnaround. ${remaining} days remaining.`,
        targetRole: selectedScenario.responsibleRole,
      });
      setActiveStepIndex(2);
    }

    setEventLogs((prev) => [...newLogs, ...prev]);
  };

  const handleSimulateBreach = () => {
    const requiredDays = Math.max(1, selectedScenario.nominalTurnaroundDays - simulatedDaysOffset + 2);
    handleAdvance(requiredDays);
  };

  const handleExecutePermittedAction = () => {
    setIsExecutingAction(true);
    setActionSuccessNotice(null);

    setTimeout(() => {
      const currentNextStage = selectedScenario.nextPermittedStage;
      setScenarioState((prev) => ({
        ...prev,
        [selectedScenario.id]: {
          currentStage: currentNextStage,
          completedAction: selectedScenario.permittedAction,
        },
      }));

      const actionLog: SimulationEventLog = {
        id: `log-act-${Date.now()}`,
        virtualDay: simulatedDaysOffset,
        timestamp: `Day ${String(simulatedDaysOffset).padStart(2, "0")} (02:45 PM IST)`,
        type: "ACTION_EXECUTED",
        title: `Executed: ${selectedScenario.permittedAction}`,
        detail: `Statutory action executed for ${selectedScenario.applicationNumber}. Application progressed from ${activeStage.replace(/_/g, " ")} to ${currentNextStage.replace(/_/g, " ")}. Immutable audit log generated under AICTE APH 2026-27 statutory rules.`,
        targetRole: selectedScenario.responsibleRole,
      };

      setEventLogs((prev) => [actionLog, ...prev]);
      setActiveStepIndex(7);
      setActionSuccessNotice(
        `Action completed: "${selectedScenario.permittedAction}". Case stage updated to "${currentNextStage.replace(/_/g, " ")}".`
      );
      setIsExecutingAction(false);
    }, 400);
  };

  const handleReset = () => {
    resetTime();
    setActiveStepIndex(0);
    setActionSuccessNotice(null);
    setScenarioState({
      "scen-1": { currentStage: SYNTHETIC_SCENARIOS[0].currentStage },
      "scen-2": { currentStage: SYNTHETIC_SCENARIOS[1].currentStage },
      "scen-3": { currentStage: SYNTHETIC_SCENARIOS[2].currentStage },
      "scen-4": { currentStage: SYNTHETIC_SCENARIOS[3].currentStage },
    });
    setEventLogs([
      {
        id: `log-reset-step-${Date.now()}`,
        virtualDay: 0,
        timestamp: "Day 00 (09:00 AM IST)",
        type: "INFO",
        title: "Simulation Environment Reset",
        detail: `Virtual clock rewound to Day 0. All synthetic cases, stage transitions, and escalation alerts restored to baseline. Production records remain untouched.`,
        targetRole: selectedScenario.responsibleRole,
      },
    ]);
  };

  const handleSelectScenario = (scen: SyntheticScenario) => {
    setSelectedScenario(scen);
    setActiveStepIndex(1);
    setActionSuccessNotice(null);
    setEventLogs((prev) => [
      {
        id: `log-switch-${scen.id}-${Date.now()}`,
        virtualDay: simulatedDaysOffset,
        timestamp: `Day ${String(simulatedDaysOffset).padStart(2, "0")} (09:00 AM IST)`,
        type: "INFO",
        title: `Scenario Switched to ${scen.applicationNumber}`,
        detail: `Active route: ${scen.routeCode}. Nominal turnaround: ${scen.nominalTurnaroundDays} days.`,
        targetRole: scen.responsibleRole,
      },
      ...prev,
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Simulation Banner Notice */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500 text-white flex items-center justify-center font-black text-sm shrink-0">
            SIM
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500 text-white">
                Isolated SIH Demonstration Mode
              </span>
              <h3 className="text-sm font-bold text-amber-950">
                Time Machine & Regulatory Radar Sandbox
              </h3>
            </div>
            <p className="text-xs text-amber-800/90 mt-0.5">
              Live database protection enabled: zero mutations written to remote production tables; all actions strictly simulated in virtual memory.
            </p>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-900 font-bold text-xs hover:bg-amber-50 transition-colors shadow-2xs self-start sm:self-auto"
        >
          <RefreshIcon className="w-3.5 h-3.5" />
          <span>Reset Simulation</span>
        </button>
      </div>

      {/* Demonstration Guided Walkthrough Steps */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Smart India Hackathon 2026 &mdash; 8-Step Demonstration Script
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {[
            { step: "01", label: "Select Case", active: activeStepIndex >= 0 },
            { step: "02", label: "Route View", active: activeStepIndex >= 1 },
            { step: "03", label: "Advance Time", active: activeStepIndex >= 2 },
            { step: "04", label: "Due Soon Alert", active: activeStepIndex >= 3 },
            { step: "05", label: "SLA Breach", active: activeStepIndex >= 4 },
            { step: "06", label: "Auto Escalation", active: activeStepIndex >= 5 },
            { step: "07", label: "Flight Recorder", active: true },
            { step: "08", label: "Action Gate", active: true },
          ].map((item) => (
            <div
              key={item.step}
              className={`p-2.5 rounded-lg border text-center transition-all ${
                item.active
                  ? "border-teal-500 bg-teal-50/60 text-teal-950 font-bold"
                  : "border-slate-200 bg-slate-50 text-slate-400"
              }`}
            >
              <div className="text-[10px] font-mono text-teal-700">STEP {item.step}</div>
              <div className="text-[11px] truncate mt-0.5">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Sandbox Controls & Visual State */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Synthetic Scenario Picker & Controls */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Select Synthetic Scenario
            </h4>

            <div className="space-y-2">
              {SYNTHETIC_SCENARIOS.map((scen) => (
                <button
                  key={scen.id}
                  onClick={() => handleSelectScenario(scen)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    selectedScenario.id === scen.id
                      ? "border-teal-600 bg-teal-50/50 ring-2 ring-teal-500/20"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900 font-mono">
                    <span>{scen.applicationNumber}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-sans font-semibold">
                      {scen.currentStage.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-800 mt-1 line-clamp-1">
                    {scen.institutionName}
                  </div>
                  <div className="text-[11px] text-teal-700 mt-0.5">{scen.routeCode}</div>
                </button>
              ))}
            </div>

            {/* Virtual Clock Accelerator */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <ClockIcon className="w-4 h-4 text-teal-600" />
                  Virtual Clock Control
                </span>
                <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  +{simulatedDaysOffset} Virtual Days
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleAdvance(3)}
                  className="py-2 px-2 rounded-lg bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-slate-800 text-xs font-bold transition-all text-center"
                >
                  +3 Days
                  <span className="block text-[10px] text-slate-500 font-normal">Normal</span>
                </button>
                <button
                  onClick={() => handleAdvance(10)}
                  className="py-2 px-2 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold transition-all text-center"
                >
                  +10 Days
                  <span className="block text-[10px] text-amber-700 font-normal">Due Soon</span>
                </button>
                <button
                  onClick={() => handleAdvance(20)}
                  className="py-2 px-2 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-900 text-xs font-bold transition-all text-center"
                >
                  +20 Days
                  <span className="block text-[10px] text-rose-700 font-normal">Breach/Escalate</span>
                </button>
              </div>

              {/* Instant SLA Breach Trigger */}
              <button
                onClick={handleSimulateBreach}
                className="w-full mt-2 py-2 px-3 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-900 text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <span>Trigger Instant SLA Breach Simulation</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Live Simulated Flight Recorder & Radar State */}
        <div className="lg:col-span-2 space-y-4">
          {actionSuccessNotice && (
            <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-300 text-teal-900 text-xs font-semibold flex items-center justify-between shadow-2xs">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
                {actionSuccessNotice}
              </span>
              <button
                onClick={() => setActionSuccessNotice(null)}
                className="text-teal-700 hover:text-teal-900 font-bold ml-2"
              >
                &times;
              </button>
            </div>
          )}

          {/* Active Synthetic Radar Card */}
          <div
            className={`rounded-xl border p-5 transition-all shadow-xs ${
              isOverdue
                ? "border-rose-400 bg-rose-50/50"
                : isApproaching
                ? "border-amber-400 bg-amber-50/50"
                : "border-teal-300 bg-white"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200/60 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-teal-700">
                  {selectedScenario.routeCode}
                </span>
                <h3 className="text-base font-black text-slate-900 mt-0.5">
                  {selectedScenario.institutionName}
                </h3>
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  Ref: {selectedScenario.applicationNumber} &bull; Stage:{" "}
                  <span className="font-bold text-slate-800">{activeStage.replace(/_/g, " ")}</span>
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase ${
                    isOverdue
                      ? "bg-rose-600 text-white animate-bounce"
                      : isApproaching
                      ? "bg-amber-600 text-white"
                      : "bg-emerald-600 text-white"
                  }`}
                >
                  {isOverdue
                    ? `${Math.abs(daysRemaining)} Days Overdue`
                    : `${daysRemaining} Days Remaining`}
                </span>
                <div className="text-[10px] text-slate-500 mt-1 font-mono">
                  SLA Limit: {selectedScenario.nominalTurnaroundDays}d &bull; Warn: &le;{selectedScenario.thresholdWarningDays}d
                </div>
              </div>
            </div>

            {/* Explainable Decision Matrix */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-white/90 p-3 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-400">Triggering Rule</span>
                <p className="font-bold text-slate-800 mt-0.5">
                  APH Chapter II &sect; 2.14
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Statutory stage turnaround threshold enforcement.
                </p>
              </div>

              <div className="bg-white/90 p-3 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-400">Responsible Role</span>
                <p className="font-bold text-slate-800 mt-0.5 font-mono">
                  {selectedScenario.responsibleRole}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Regulatory officer holding active task ticket.
                </p>
              </div>

              <div className="bg-white/90 p-3 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-400">Next Permitted Step</span>
                <p className="font-bold text-teal-700 mt-0.5">
                  {isActionCompleted
                    ? "Stage Action Completed"
                    : isOverdue
                    ? "Escalate to Bureau / Officer"
                    : selectedScenario.permittedAction}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Validated against statutory workflow state rules.
                </p>
              </div>
            </div>

            {/* Step 08 Action Execution Gate */}
            <div className="mt-4 pt-3 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-600">
                <span className="font-bold text-slate-800">Action Gate (Step 08):</span>{" "}
                {isActionCompleted
                  ? `Completed stage transition to "${activeStage.replace(/_/g, " ")}".`
                  : `Permitted transition: advance case to "${selectedScenario.nextPermittedStage.replace(/_/g, " ")}".`}
              </div>

              <button
                onClick={handleExecutePermittedAction}
                disabled={isExecutingAction || isActionCompleted}
                className={`px-4 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-2 shadow-xs ${
                  isActionCompleted
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-not-allowed"
                    : isExecutingAction
                    ? "bg-teal-300 text-white cursor-wait"
                    : "bg-teal-700 hover:bg-teal-800 text-white shadow-teal-700/20"
                }`}
              >
                {isExecutingAction ? (
                  <span>Executing Action...</span>
                ) : isActionCompleted ? (
                  <span>Action Completed</span>
                ) : (
                  <span>Run Permitted Statutory Action</span>
                )}
              </button>
            </div>
          </div>

          {/* Timeline of Simulated Actions (Flight Recorder Sandbox) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ActivityIcon className="w-4 h-4 text-teal-600" />
                <h4 className="text-sm font-bold text-slate-900">
                  Simulated Case Flight Recorder & Audit Stream
                </h4>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {eventLogs.length} Virtual Log Entries
              </span>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {eventLogs.map((log) => (
                <div
                  key={log.id}
                  className={`p-3 rounded-xl border text-xs space-y-1 transition-all ${
                    log.type === "ESCALATION_TRIGGERED"
                      ? "bg-rose-50 border-rose-200"
                      : log.type === "SLA_BREACH"
                      ? "bg-rose-50/60 border-rose-200"
                      : log.type === "APPROACHING_DEADLINE"
                      ? "bg-amber-50 border-amber-200"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                          log.type === "ESCALATION_TRIGGERED"
                            ? "bg-rose-600 text-white"
                            : log.type === "SLA_BREACH"
                            ? "bg-rose-100 text-rose-800"
                            : log.type === "APPROACHING_DEADLINE"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {log.type.replace(/_/g, " ")}
                      </span>
                      <span className="font-bold text-slate-900">{log.title}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">{log.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-slate-700 leading-relaxed">{log.detail}</p>
                  <div className="text-[10px] text-slate-400 font-mono pt-1">
                    Target Role: {log.targetRole}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
