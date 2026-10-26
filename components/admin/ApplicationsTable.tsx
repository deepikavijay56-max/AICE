"use client";

import React, { useState, useMemo } from "react";
import { SearchIcon, FilterIcon, ArrowRightIcon } from "./Icons";
import { StatusBadge } from "./StatusBadge";
import type { ApplicationStatus } from "@/types/database";

export interface ApplicationRow {
  id: string;
  applicationNumber: string;
  institutionName: string;
  permanentInstituteId: string;
  regionName: string;
  programType: string;
  academicYear: string;
  status: ApplicationStatus;
  currentStage: string;
  submittedAt: string | null;
  targetDecisionDate: string | null;
}

interface ApplicationsTableProps {
  initialApplications: ApplicationRow[];
  isDemo?: boolean;
  detailBaseUrl?: string;
}

export function ApplicationsTable({
  initialApplications,
  isDemo = false,
  detailBaseUrl = "/admin/applications",
}: ApplicationsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [regionFilter, setRegionFilter] = useState<string>("ALL");
  const [sortField, setSortField] = useState<"date" | "number" | "institution">("date");
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Extract distinct regions
  const availableRegions = useMemo(() => {
    const set = new Set<string>();
    initialApplications.forEach((a) => {
      if (a.regionName) set.add(a.regionName);
    });
    return Array.from(set).sort();
  }, [initialApplications]);

  // Filter and Sort applications
  const filtered = useMemo(() => {
    return initialApplications
      .filter((app) => {
        const matchesSearch =
          searchQuery === "" ||
          app.applicationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.institutionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.permanentInstituteId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.regionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.programType.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus =
          statusFilter === "ALL" || app.status === statusFilter;

        const matchesRegion =
          regionFilter === "ALL" || app.regionName === regionFilter;

        return matchesSearch && matchesStatus && matchesRegion;
      })
      .sort((a, b) => {
        if (sortField === "date") {
          const tA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
          const tB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
          return sortAsc ? tA - tB : tB - tA;
        } else if (sortField === "number") {
          return sortAsc
            ? a.applicationNumber.localeCompare(b.applicationNumber)
            : b.applicationNumber.localeCompare(a.applicationNumber);
        } else {
          return sortAsc
            ? a.institutionName.localeCompare(b.institutionName)
            : b.institutionName.localeCompare(a.institutionName);
        }
      });
  }, [initialApplications, searchQuery, statusFilter, regionFilter, sortField, sortAsc]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header controls: Search & Filter */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Recent Applications
            {isDemo && (
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                Sample
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Showing {filtered.length} of {initialApplications.length} applications
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 sm:items-center">
          {/* Search Input */}
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search ID, college, region..."
              className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 w-full sm:w-56"
            />
          </div>

          {/* Status Filter */}
          <div className="relative flex items-center">
            <FilterIcon className="absolute left-3 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-8 pr-7 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 font-medium appearance-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="under_scrutiny">Under Scrutiny</option>
              <option value="scrutiny_clarification_sought">Clarification Sought</option>
              <option value="scrutiny_cleared">Scrutiny Cleared</option>
              <option value="evc_scheduled">EVC Scheduled</option>
              <option value="evc_completed">EVC Completed</option>
              <option value="sac_review">SAC Review</option>
              <option value="council_decision_pending">Council Decision Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Region Filter */}
          <div className="relative flex items-center">
            <select
              value={regionFilter}
              onChange={(e) => {
                setRegionFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 font-medium cursor-pointer"
            >
              <option value="ALL">All Regions</option>
              {availableRegions.map((reg) => (
                <option key={reg} value={reg}>
                  {reg}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Control */}
          <div className="flex items-center gap-1">
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as "date" | "number" | "institution")}
              className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 font-medium cursor-pointer"
            >
              <option value="date">Sort: Date</option>
              <option value="number">Sort: App ID</option>
              <option value="institution">Sort: College</option>
            </select>
            <button
              onClick={() => setSortAsc(!sortAsc)}
              title={sortAsc ? "Ascending" : "Descending"}
              className="px-2 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 hover:bg-slate-50 font-mono"
            >
              {sortAsc ? "↑" : "↓"}
            </button>
          </div>
        </div>
      </div>

      {/* Table view */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Application Details</th>
              <th className="py-3 px-4">Institution</th>
              <th className="py-3 px-4">Region</th>
              <th className="py-3 px-4">Program</th>
              <th className="py-3 px-4">Current Status</th>
              <th className="py-3 px-4">Target Date</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginated.length > 0 ? (
              paginated.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{app.applicationNumber}</div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      AY {app.academicYear}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-800 line-clamp-1">
                      {app.institutionName}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      PID: {app.permanentInstituteId}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-700">
                    {app.regionName}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] bg-slate-100 font-medium text-slate-700 border border-slate-200">
                      {app.programType}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={app.status} size="sm" />
                    <div className="text-[10px] text-slate-400 mt-1 capitalize">
                      Stage: {app.currentStage.replace(/_/g, " ")}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {app.targetDecisionDate
                      ? new Date(app.targetDecisionDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "Pending SLA"}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <a
                      href={`${detailBaseUrl}/${app.id}`}
                      className="inline-flex items-center gap-1 font-semibold text-teal-600 hover:text-teal-700 hover:underline"
                    >
                      <span>Review</span>
                      <ArrowRightIcon className="w-3.5 h-3.5" />
                    </a>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <p className="font-medium">No applications found matching query.</p>
                  <p className="text-[11px] mt-1 text-slate-400">
                    Try adjusting the search criteria or clearing filters.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/40 flex items-center justify-between text-xs text-slate-600">
        <div>
          Page <span className="font-bold text-slate-800">{currentPage}</span> of{" "}
          <span className="font-bold text-slate-800">{totalPages}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-md border border-slate-200 bg-white text-slate-700 font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-md border border-slate-200 bg-white text-slate-700 font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
