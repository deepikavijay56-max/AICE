"use client";

import React, { useState } from "react";
import { useTimeMachine } from "./TimeMachineContext";
import { ClockIcon, RefreshIcon, AlertCircleIcon } from "./Icons";

export function TimeMachineWidget() {
  const { simulatedDaysOffset, simulatedDate, advanceDays, resetTime, isSimulated } = useTimeMachine();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
          isSimulated
            ? "bg-amber-50 text-amber-900 border-amber-300 ring-2 ring-amber-400/40 animate-pulse"
            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
        }`}
        title="Simulated Time Machine Demo (Regulatory SLA & Escalation Testing)"
      >
        <ClockIcon className={`w-4 h-4 ${isSimulated ? "text-amber-600" : "text-teal-600"}`} />
        <span className="hidden sm:inline">
          {isSimulated ? `Simulated: +${simulatedDaysOffset}d` : "Time Machine"}
        </span>
        {isSimulated && (
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
        )}
      </button>

      {/* Popover Panel */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white shadow-2xl border border-slate-200 p-4 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-amber-50 text-amber-700">
                <ClockIcon className="w-4 h-4" />
              </span>
              <div>
                <h4 className="font-bold text-slate-900">SLA Time Machine</h4>
                <p className="text-[10px] text-slate-500">Statutory Deadline & Escalation Simulator</p>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
              DEMO ONLY
            </span>
          </div>

          <div className="my-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-500">Simulated Virtual Date:</span>
              <span className="font-mono font-bold text-slate-900">
                {simulatedDate.toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-500">Time Travel Offset:</span>
              <span className="font-mono font-bold text-teal-700">
                +{simulatedDaysOffset} Days
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-semibold text-slate-700">Fast-forward regulatory cycle:</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => advanceDays(7)}
                className="py-1.5 px-2 rounded-md bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-900 font-semibold text-center transition-colors"
              >
                +7 Days
                <span className="block text-[9px] font-normal text-teal-600">Due-Soon alerts</span>
              </button>

              <button
                onClick={() => advanceDays(15)}
                className="py-1.5 px-2 rounded-md bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-semibold text-center transition-colors"
              >
                +15 Days
                <span className="block text-[9px] font-normal text-amber-700">Scrutiny SLA Breach</span>
              </button>

              <button
                onClick={() => advanceDays(30)}
                className="py-1.5 px-2 rounded-md bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-900 font-semibold text-center transition-colors"
              >
                +30 Days
                <span className="block text-[9px] font-normal text-rose-700">EVC Overdue Level 2</span>
              </button>
            </div>
          </div>

          {isSimulated && (
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-amber-800 text-[11px]">
                <AlertCircleIcon className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Simulated views active</span>
              </div>
              <button
                onClick={resetTime}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-colors"
              >
                <RefreshIcon className="w-3 h-3" />
                <span>Reset to Real Time</span>
              </button>
            </div>
          )}

          <div className="mt-3 pt-2 text-[10px] text-slate-400 border-t border-slate-100">
            Safeguard: Database timestamps and actual records are never modified. Only SLA pendency evaluation is simulated.
          </div>
        </div>
      )}
    </div>
  );
}
