"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import type { LiveDeadlineRadarItem } from "@/lib/workflowEngine";
import {
  ArrowRightIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
} from "@/components/admin/Icons";

interface DeadlineRiskRadarProps {
  items: LiveDeadlineRadarItem[];
  isDemo?: boolean;
}

export function DeadlineRiskRadar({ items, isDemo = false }: DeadlineRiskRadarProps) {
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterSeverity, setFilterSeverity] = useState<string>("ALL");
  const [filterRegion, setFilterRegion] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const distinctRegions = useMemo(() => {
    const s = new Set<string>();
    items.forEach((i) => s.add(i.regionName));
    return Array.from(s).sort();
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchStatus = filterStatus === "ALL" || item.status === filterStatus;
      const matchSeverity = filterSeverity === "ALL" || item.severity === filterSeverity;
      const matchRegion = filterRegion === "ALL" || item.regionName === filterRegion;
      const matchSearch =
        searchQuery === "" ||
        item.applicationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.institutionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.responsibleOwner.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.ruleName.toLowerCase().includes(searchQuery.toLowerCase());

      return matchStatus && matchSeverity && matchRegion && matchSearch;
    });
  }, [items, filterStatus, filterSeverity, filterRegion, searchQuery]);

  const counts = {
    all: items.length,
    overdue: items.filter((i) => i.status === "OVERDUE").length,
    dueNow: items.filter((i) => i.status === "DUE_NOW").length,
    upcoming: items.filter((i) => i.status === "UPCOMING").length,
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Radar Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping inline-block" />
              Deadline-Risk Radar & Turnaround Command Panel
            </h3>
            {isDemo && (
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                Sample Alerts
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time stage SLA monitoring, statutory timeout warnings, and duplicate-safe escalation ledger
          </p>
        </div>

        {/* Status Counter Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setFilterStatus("ALL")}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
              filterStatus === "ALL"
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            All Monitored ({counts.all})
          </button>
          <button
            onClick={() => setFilterStatus("OVERDUE")}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
              filterStatus === "OVERDUE"
                ? "bg-rose-600 text-white"
                : "bg-white text-rose-700 border border-rose-200 hover:bg-rose-50"
            }`}
          >
            Overdue ({counts.overdue})
          </button>
          <button
            onClick={() => setFilterStatus("DUE_NOW")}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
              filterStatus === "DUE_NOW"
                ? "bg-amber-600 text-white"
                : "bg-white text-amber-700 border border-amber-200 hover:bg-amber-50"
            }`}
          >
            Due Now &le; 2d ({counts.dueNow})
          </button>
          <button
            onClick={() => setFilterStatus("UPCOMING")}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
              filterStatus === "UPCOMING"
                ? "bg-sky-600 text-white"
                : "bg-white text-sky-700 border border-sky-200 hover:bg-sky-50"
            }`}
          >
            Upcoming ({counts.upcoming})
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-3 bg-slate-50/40 border-b border-slate-200 flex flex-wrap items-center gap-2.5">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by App ID, Institute, Rule..."
          className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 w-full sm:w-64"
        />

        <select
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value)}
          className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
        >
          <option value="ALL">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select
          value={filterRegion}
          onChange={(e) => setFilterRegion(e.target.value)}
          className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
        >
          <option value="ALL">All Regions</option>
          {distinctRegions.map((reg) => (
            <option key={reg} value={reg}>
              {reg}
            </option>
          ))}
        </select>

        <span className="text-[11px] text-slate-400 ml-auto">
          Showing {filtered.length} of {items.length} items
        </span>
      </div>

      {/* Radar Cards Grid */}
      <div className="p-4 sm:p-5">
        {filtered.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-xs">
            <CheckCircleIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold">No deadline risks found matching criteria.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">All monitored statutory stages are operating within handbook SLA limits.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
            {filtered.map((item) => {
              const isOverdue = item.isOverdue;
              const isCritical = item.severity === "critical";

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isCritical
                      ? "border-rose-300 bg-rose-50/40 hover:border-rose-400"
                      : isOverdue
                      ? "border-amber-300 bg-amber-50/40 hover:border-amber-400"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-mono font-bold text-xs text-slate-900">
                          {item.applicationNumber}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200 uppercase">
                          {item.stageName}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 mt-1 line-clamp-1">
                        {item.institutionName}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Region: {item.regionName}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isCritical
                            ? "bg-rose-100 text-rose-800 border border-rose-200"
                            : isOverdue
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : "bg-sky-100 text-sky-800 border border-sky-200"
                        }`}
                      >
                        {isOverdue ? `${Math.abs(item.daysRemainingOrOverdue)}d Overdue` : `${item.daysRemainingOrOverdue}d Left`}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-1 font-mono">
                        Target: {new Date(item.configuredDueDate).toLocaleDateString("en-IN")}
                      </div>
                    </div>
                  </div>

                  {/* Triggering Statutory Rule */}
                  <div className="mt-3 p-2.5 rounded-lg bg-slate-100/70 border border-slate-200/80 text-[11px] space-y-1">
                    <div className="font-semibold text-slate-800 flex items-center gap-1">
                      <ShieldCheckIcon className="w-3.5 h-3.5 text-teal-600" />
                      <span>{item.ruleName}</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-[11px]">{item.reason}</p>
                  </div>

                  {/* Operational Action Footer */}
                  <div className="mt-3 pt-2.5 border-t border-slate-200/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">
                        Responsible Owner
                      </div>
                      <div className="text-[11px] font-semibold text-slate-800">
                        {item.responsibleOwner}
                      </div>
                    </div>

                    <Link
                      href={`/admin/applications/${item.applicationId}`}
                      className="inline-flex items-center gap-1 font-semibold text-teal-600 hover:text-teal-700 text-xs self-end sm:self-auto hover:underline"
                    >
                      <span>Open Case Recorder</span>
                      <ArrowRightIcon className="w-3.5 h-3.5" />
                    </Link>
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
