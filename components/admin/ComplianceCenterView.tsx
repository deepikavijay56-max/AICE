"use client";

import React, { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import type { ComplianceCentreItem, UndertakingItem } from "@/lib/complianceEngine";
import { reviewComplianceSubmission, verifyUndertaking } from "@/app/admin/compliance/actions";
import {
  CheckCircleIcon,
  ClockIcon,
} from "@/components/admin/Icons";

interface ComplianceCenterViewProps {
  complianceItems: ComplianceCentreItem[];
  undertakings: UndertakingItem[];
  isDemo?: boolean;
}

export function ComplianceCenterView({
  complianceItems,
  undertakings,
  isDemo = false,
}: ComplianceCenterViewProps) {
  const [activeTab, setActiveTab] = useState<"deficiencies" | "undertakings">("deficiencies");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isPending, startTransition] = useTransition();
  const [actionFeedback, setActionFeedback] = useState<{ id: string; message: string; type: "success" | "error" } | null>(null);

  // Filtered compliance items
  const filteredCompliance = useMemo(() => {
    return complianceItems.filter((item) => {
      const matchStatus = statusFilter === "ALL" || item.status === statusFilter;
      const matchSearch =
        searchQuery === "" ||
        item.applicationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.institutionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.deficiencyRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.complianceRemarks.toLowerCase().includes(searchQuery.toLowerCase());

      return matchStatus && matchSearch;
    });
  }, [complianceItems, statusFilter, searchQuery]);

  // Filtered undertakings
  const filteredUndertakings = useMemo(() => {
    return undertakings.filter((item) => {
      const matchSearch =
        searchQuery === "" ||
        item.applicationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.institutionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase());

      return matchSearch;
    });
  }, [undertakings, searchQuery]);

  const handleReviewSubmission = (id: string, decision: "completed" | "returned") => {
    const comments = window.prompt("Enter formal scrutiny verification remarks / statutory comments:");
    if (comments === null) return;

    setActionFeedback(null);
    startTransition(async () => {
      const res = await reviewComplianceSubmission(id, decision, comments);
      setActionFeedback({
        id,
        message: res.message,
        type: res.success ? "success" : "error",
      });
    });
  };

  const handleVerifyUndertaking = (id: string) => {
    if (!window.confirm("Digitally attest that this statutory affirmation complies with AICTE regulations?")) return;

    setActionFeedback(null);
    startTransition(async () => {
      const res = await verifyUndertaking(id);
      setActionFeedback({
        id,
        message: res.message,
        type: res.success ? "success" : "error",
      });
    });
  };

  return (
    <div className="space-y-6">
      {/* Action feedback alert */}
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

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex gap-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("deficiencies")}
            className={`px-4 py-2.5 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "deficiencies"
                ? "border-teal-600 text-teal-700 bg-teal-50/30"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Deficiency Submissions & Clarifications</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700">
              {complianceItems.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("undertakings")}
            className={`px-4 py-2.5 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "undertakings"
                ? "border-teal-600 text-teal-700 bg-teal-50/30"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Statutory Affirmations & Undertakings</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700">
              {undertakings.length}
            </span>
          </button>
        </div>

        {isDemo && (
          <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200 mr-2">
            Sample Registry
          </span>
        )}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by ID, institute name, ref..."
          className="px-3.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 w-full sm:w-72"
        />

        {activeTab === "deficiencies" && (
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
          >
            <option value="ALL">All Submission Statuses</option>
            <option value="pending">Pending Scrutiny Review</option>
            <option value="completed">Completed / Accepted</option>
            <option value="returned">Returned for Clarification</option>
          </select>
        )}
      </div>

      {/* Deficiencies View */}
      {activeTab === "deficiencies" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/70 text-slate-600 font-semibold uppercase text-[10px] border-b border-slate-200">
                  <th className="py-3 px-4">Application & College</th>
                  <th className="py-3 px-4">Deficiency Notice Ref</th>
                  <th className="py-3 px-4">Compliance Remarks</th>
                  <th className="py-3 px-4">Submitted Date</th>
                  <th className="py-3 px-4">Review Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCompliance.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400">
                      No compliance records match criteria.
                    </td>
                  </tr>
                ) : (
                  filteredCompliance.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <Link
                          href={`/admin/applications/${item.applicationId}`}
                          className="font-bold text-slate-900 font-mono hover:text-teal-600 hover:underline flex items-center gap-1"
                        >
                          <span>{item.applicationNumber}</span>
                        </Link>
                        <div className="text-[11px] text-slate-600 mt-0.5 line-clamp-1">
                          {item.institutionName}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          PID: {item.permanentInstituteId} &bull; {item.regionName}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                        {item.deficiencyRef}
                      </td>

                      <td className="py-3 px-4 text-slate-600 max-w-sm">
                        <p className="line-clamp-2 text-xs leading-relaxed">
                          {item.complianceRemarks}
                        </p>
                        {item.reviewComments && (
                          <div className="mt-1 text-[11px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                            Reviewer: {item.reviewComments}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-600">
                        {new Date(item.submissionDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                        {item.isOverdue && (
                          <div className="text-[10px] font-bold text-rose-600 mt-0.5">
                            Overdue Review SLA
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            item.status === "completed"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : item.status === "returned"
                              ? "bg-rose-50 text-rose-800 border border-rose-200"
                              : "bg-amber-50 text-amber-800 border border-amber-200"
                          }`}
                        >
                          {item.status}
                        </span>
                        {item.reviewerName && (
                          <div className="text-[10px] text-slate-400 mt-1">
                            By {item.reviewerName}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {item.status === "pending" ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleReviewSubmission(item.id, "completed")}
                              disabled={isPending}
                              className="px-2.5 py-1 text-[11px] font-bold bg-teal-600 hover:bg-teal-700 text-white rounded transition-colors disabled:opacity-50"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleReviewSubmission(item.id, "returned")}
                              disabled={isPending}
                              className="px-2.5 py-1 text-[11px] font-bold bg-slate-200 hover:bg-rose-100 hover:text-rose-800 text-slate-700 rounded transition-colors disabled:opacity-50"
                            >
                              Return
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">Reviewed</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Undertakings View */}
      {activeTab === "undertakings" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/70 text-slate-600 font-semibold uppercase text-[10px] border-b border-slate-200">
                  <th className="py-3 px-4">Application & College</th>
                  <th className="py-3 px-4">Statutory Clause & Type</th>
                  <th className="py-3 px-4">Affirmation Excerpt</th>
                  <th className="py-3 px-4">Signatory & Hash</th>
                  <th className="py-3 px-4">Verification</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUndertakings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400">
                      No undertakings catalogued.
                    </td>
                  </tr>
                ) : (
                  filteredUndertakings.map((und) => (
                    <tr key={und.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <Link
                          href={`/admin/applications/${und.applicationId}`}
                          className="font-bold text-slate-900 font-mono hover:text-teal-600 hover:underline"
                        >
                          {und.applicationNumber}
                        </Link>
                        <div className="text-[11px] text-slate-600 mt-0.5 line-clamp-1">
                          {und.institutionName}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800">{und.title}</div>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200 uppercase mt-0.5 inline-block">
                          {und.undertakingType.replace(/_/g, " ")}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-600 max-w-xs text-[11px]">
                        {und.clauseExcerpt}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{und.signedBy}</div>
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                          Sig: {und.digitalSignatureHash.slice(0, 16)}...
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {und.isVerified ? (
                          <div>
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <CheckCircleIcon className="w-3 h-3 text-emerald-600" />
                              Attested
                            </span>
                            {und.verifiedBy && (
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                By {und.verifiedBy}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                            <ClockIcon className="w-3 h-3 text-amber-600" />
                            Pending Attestation
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {!und.isVerified ? (
                          <button
                            onClick={() => handleVerifyUndertaking(und.id)}
                            disabled={isPending}
                            className="px-2.5 py-1 text-[11px] font-bold bg-teal-600 hover:bg-teal-700 text-white rounded transition-colors disabled:opacity-50"
                          >
                            Verify Attestation
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">Attested</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
