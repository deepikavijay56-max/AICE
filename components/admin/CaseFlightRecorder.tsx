"use client";

import React, { useState } from "react";
import type { FlightRecorderTimelineItem } from "@/lib/applicationDetail";
import {
  ClockIcon,
  ShieldCheckIcon,
  AlertCircleIcon,
  ActivityIcon,
} from "./Icons";

interface CaseFlightRecorderProps {
  timeline: FlightRecorderTimelineItem[];
  isDemo?: boolean;
}

export function CaseFlightRecorder({ timeline, isDemo = false }: CaseFlightRecorderProps) {
  const [sourceFilter, setSourceFilter] = useState<string>("ALL");

  const filtered = timeline.filter((item) => {
    if (sourceFilter === "ALL") return true;
    return item.source === sourceFilter;
  });

  const counts = {
    all: timeline.length,
    database: timeline.filter((t) => t.source === "DATABASE_EVENT").length,
    state: timeline.filter((t) => t.source === "APPLICATION_STATE").length,
    warning: timeline.filter((t) => t.source === "OPERATIONAL_WARNING").length,
    demo: timeline.filter((t) => t.source === "DEMO_SIMULATION").length,
  };

  const getSourceBadge = (source: FlightRecorderTimelineItem["source"]) => {
    switch (source) {
      case "DATABASE_EVENT":
        return {
          label: "Database Ledger",
          classes: "bg-blue-100 text-blue-800 border-blue-200",
          icon: ShieldCheckIcon,
        };
      case "APPLICATION_STATE":
        return {
          label: "Current Engine State",
          classes: "bg-teal-100 text-teal-800 border-teal-200",
          icon: ClockIcon,
        };
      case "OPERATIONAL_WARNING":
        return {
          label: "Operational SLA Warning",
          classes: "bg-rose-100 text-rose-800 border-rose-200",
          icon: AlertCircleIcon,
        };
      case "DEMO_SIMULATION":
        return {
          label: "Simulated Historical Trace",
          classes: "bg-purple-100 text-purple-800 border-purple-200",
          icon: ActivityIcon,
        };
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-500/10 text-teal-600 flex items-center justify-center font-bold">
            <ActivityIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Case Flight Recorder
              </h3>
              {isDemo && (
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                  Sample Data
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Auditable, chronological trace of state transitions, actor interventions, and SLA alarms
            </p>
          </div>
        </div>

        {/* Source Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={() => setSourceFilter("ALL")}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
              sourceFilter === "ALL"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            All Traces ({counts.all})
          </button>
          {counts.database > 0 && (
            <button
              onClick={() => setSourceFilter("DATABASE_EVENT")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                sourceFilter === "DATABASE_EVENT"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white text-blue-700 border border-blue-200 hover:bg-blue-50"
              }`}
            >
              Database Events ({counts.database})
            </button>
          )}
          {counts.warning > 0 && (
            <button
              onClick={() => setSourceFilter("OPERATIONAL_WARNING")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                sourceFilter === "OPERATIONAL_WARNING"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "bg-white text-rose-700 border border-rose-200 hover:bg-rose-50"
              }`}
            >
              SLA Warnings ({counts.warning})
            </button>
          )}
          {counts.demo > 0 && (
            <button
              onClick={() => setSourceFilter("DEMO_SIMULATION")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                sourceFilter === "DEMO_SIMULATION"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "bg-white text-purple-700 border border-purple-200 hover:bg-purple-50"
              }`}
            >
              Simulated ({counts.demo})
            </button>
          )}
        </div>
      </div>

      {/* Timeline List */}
      <div className="p-4 sm:p-6">
        {filtered.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No events match the selected source filter.
          </div>
        ) : (
          <div className="relative pl-6 sm:pl-8 space-y-6 before:content-[''] before:absolute before:left-2.5 sm:before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {filtered.map((item) => {
              const badge = getSourceBadge(item.source);
              const IconComp = badge.icon;

              return (
                <div key={item.id} className="relative group">
                  {/* Timeline Node Point */}
                  <div className="absolute -left-6 sm:-left-8 top-1 w-5 h-5 rounded-full bg-white border-2 border-slate-400 group-hover:border-teal-500 transition-colors flex items-center justify-center shadow-xs">
                    <div className="w-2 h-2 rounded-full bg-slate-400 group-hover:bg-teal-500 transition-colors" />
                  </div>

                  {/* Event Container */}
                  <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80 hover:border-slate-300 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${badge.classes}`}
                        >
                          <IconComp className="w-3 h-3" />
                          {badge.label}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                        <ClockIcon className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {new Date(item.timestamp).toLocaleString("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed">{item.description}</p>

                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-slate-700">Actor:</span>
                        <span className="font-semibold text-slate-900">{item.actorName}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200/70 font-mono text-slate-700">
                          {item.actorRole}
                        </span>
                      </div>

                      <div className="text-[10px] font-mono text-slate-400">
                        Event Type: {item.eventType}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
