"use client";

import React, { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import type { EvcManagementItem } from "@/lib/complianceEngine";
import { updateEvcVisitStatus } from "@/app/admin/compliance/actions";
import { CheckCircleIcon } from "@/components/admin/Icons";

interface EvcManagementViewProps {
  visits: EvcManagementItem[];
  isDemo?: boolean;
}

export function EvcManagementView({ visits }: EvcManagementViewProps) {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const [actionFeedback, setActionFeedback] = useState<{ id: string; message: string; type: "success" | "error" } | null>(null);

  const filtered = useMemo(() => {
    return visits.filter((v) => {
      const matchStatus = statusFilter === "ALL" || v.status === statusFilter;
      const matchSearch =
        searchQuery === "" ||
        v.applicationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.institutionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.leadExpertName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.regionName.toLowerCase().includes(searchQuery.toLowerCase());

      return matchStatus && matchSearch;
    });
  }, [visits, statusFilter, searchQuery]);

  const handleUpdateStatus = (
    id: string,
    newStatus: "in_progress" | "report_submitted" | "verified" | "cancelled"
  ) => {
    let summary: string | undefined;
    let score: number | undefined;

    if (newStatus === "report_submitted" || newStatus === "verified") {
      const summaryInput = window.prompt("Enter Committee Findings Summary / Report Abstract:");
      if (summaryInput === null) return;
      summary = summaryInput;

      const scoreInput = window.prompt("Enter Infrastructure & Faculty Compliance Score (0 - 100):", "92.5");
      if (scoreInput !== null) {
        score = parseFloat(scoreInput);
      }
    } else {
      if (!window.confirm(`Update EVC Visit to state "${newStatus.toUpperCase()}"?`)) return;
    }

    setActionFeedback(null);
    startTransition(async () => {
      const res = await updateEvcVisitStatus(id, newStatus, summary, score);
      setActionFeedback({
        id,
        message: res.message,
        type: res.success ? "success" : "error",
      });
    });
  };

  const counts = {
    all: visits.length,
    scheduled: visits.filter((v) => v.status === "scheduled").length,
    inProgress: visits.filter((v) => v.status === "in_progress").length,
    reportsAwaitingReview: visits.filter((v) => v.status === "report_submitted").length,
    verified: visits.filter((v) => v.status === "verified").length,
  };

  return (
    <div className="space-y-6">
      {/* Action feedback */}
      {actionFeedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
            actionFeedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionFeedback.message}</span>
          </div>
          <button
            onClick={() => setActionFeedback(null)}
            className="text-[11px] font-bold underline ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-bold uppercase text-slate-400">Scheduled Inspections</div>
          <div className="text-xl font-black text-cyan-700 mt-1">{counts.scheduled}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Committees assigned</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-bold uppercase text-slate-400">In Physical Progress</div>
          <div className="text-xl font-black text-amber-600 mt-1">{counts.inProgress}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Active on-site audits</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-bold uppercase text-slate-400">Reports Pending Verification</div>
          <div className="text-xl font-black text-purple-700 mt-1">{counts.reportsAwaitingReview}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Awaiting Regional Review</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-bold uppercase text-slate-400">Verified & Approved</div>
          <div className="text-xl font-black text-emerald-600 mt-1">{counts.verified}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Forwarded to Council</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by App ID, college, expert..."
          className="px-3.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 w-full sm:w-72"
        />

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
          >
            <option value="ALL">All Inspection Stages</option>
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="report_submitted">Report Submitted</option>
            <option value="verified">Verified</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Visits Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/70 text-slate-600 font-semibold uppercase text-[10px] border-b border-slate-200">
                <th className="py-3 px-4">Inspection Date</th>
                <th className="py-3 px-4">Application & Institution</th>
                <th className="py-3 px-4">Lead Expert & Panel</th>
                <th className="py-3 px-4">Inspection Status</th>
                <th className="py-3 px-4">Findings & Score</th>
                <th className="py-3 px-4 text-right">Committee Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No EVC visits match current filter.
                  </td>
                </tr>
              ) : (
                filtered.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono">
                      <div className="font-bold text-slate-900">
                        {new Date(v.scheduledStart).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(v.scheduledStart).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <Link
                        href={`/admin/applications/${v.applicationId}`}
                        className="font-bold text-slate-900 font-mono hover:text-teal-600 hover:underline"
                      >
                        {v.applicationNumber}
                      </Link>
                      <div className="text-[11px] text-slate-600 font-medium line-clamp-1">
                        {v.institutionName}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        PID: {v.permanentInstituteId} &bull; {v.regionName}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{v.leadExpertName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {v.committeeMembersCount}-Member Panel
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          v.status === "verified"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : v.status === "report_submitted"
                            ? "bg-purple-50 text-purple-800 border border-purple-200"
                            : v.status === "in_progress"
                            ? "bg-amber-50 text-amber-800 border border-amber-200"
                            : "bg-cyan-50 text-cyan-800 border border-cyan-200"
                        }`}
                      >
                        {v.status.replace(/_/g, " ")}
                      </span>
                    </td>

                    <td className="py-3 px-4 max-w-xs text-[11px] text-slate-600">
                      {v.findingsSummary ? (
                        <div>
                          <p className="line-clamp-2">{v.findingsSummary}</p>
                          {v.complianceScore !== null && (
                            <span className="font-bold text-teal-700 font-mono text-[10px]">
                              Score: {v.complianceScore}%
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Awaiting on-site observations</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {v.status === "scheduled" && (
                        <button
                          onClick={() => handleUpdateStatus(v.id, "in_progress")}
                          disabled={isPending}
                          className="px-2.5 py-1 text-[11px] font-bold bg-amber-600 hover:bg-amber-700 text-white rounded transition-colors disabled:opacity-50"
                        >
                          Commence Visit
                        </button>
                      )}
                      {v.status === "in_progress" && (
                        <button
                          onClick={() => handleUpdateStatus(v.id, "report_submitted")}
                          disabled={isPending}
                          className="px-2.5 py-1 text-[11px] font-bold bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors disabled:opacity-50"
                        >
                          Submit Report
                        </button>
                      )}
                      {v.status === "report_submitted" && (
                        <button
                          onClick={() => handleUpdateStatus(v.id, "verified")}
                          disabled={isPending}
                          className="px-2.5 py-1 text-[11px] font-bold bg-teal-600 hover:bg-teal-700 text-white rounded transition-colors disabled:opacity-50"
                        >
                          Verify & Clear
                        </button>
                      )}
                      {v.status === "verified" && (
                        <span className="text-[11px] text-emerald-700 font-bold flex items-center justify-end gap-1">
                          <CheckCircleIcon className="w-3.5 h-3.5" />
                          Verified
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
