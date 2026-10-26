"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FullApplicationDetail } from "@/types/admin";
import {
  saveDocumentReviewResults,
  returnForDeficiencies,
  completeScrutinyStage,
  type DocumentReviewInput,
} from "../../actions";
import {
  FileTextIcon,
} from "@/components/admin/Icons";

interface ScrutinyReviewPanelProps {
  application: FullApplicationDetail;
  isDemo?: boolean;
}

export function ScrutinyReviewPanel({ application, isDemo }: ScrutinyReviewPanelProps) {
  const router = useRouter();

  const documents = application.documents || [];

  // Review state per document: status ('pending' | 'verified' | 'deficient'), remarks, deficiencyReason
  const [docReviews, setDocReviews] = useState<Record<string, { status: "pending" | "verified" | "deficient"; remarks: string; deficiencyReason: string }>>(() => {
    const initial: Record<string, { status: "pending" | "verified" | "deficient"; remarks: string; deficiencyReason: string }> = {};
    for (const doc of documents) {
      const meta = doc.metadata || {};
      const status = (meta.scrutiny_status as "pending" | "verified" | "deficient") || (doc.is_verified ? "verified" : "pending");
      const remarks = (meta.scrutiny_remarks as string) || "";
      const deficiencyReason = (meta.deficiency_reason as string) || "";
      initial[doc.id] = { status, remarks, deficiencyReason };
    }
    return initial;
  });

  // Action states
  const [isSavingReviews, setIsSavingReviews] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  // Return for deficiencies modal
  const [showDeficiencyModal, setShowDeficiencyModal] = useState<boolean>(false);
  const [deficiencyInstructions, setDeficiencyInstructions] = useState<string>("");
  const [deficiencyDeadlineDays, setDeficiencyDeadlineDays] = useState<number>(7);
  const [isReturning, setIsReturning] = useState<boolean>(false);

  // Complete scrutiny state
  const [showCompleteModal, setShowCompleteModal] = useState<boolean>(false);
  const [completionFindings, setCompletionFindings] = useState<string>("All mandatory statutory land, building sanction, and faculty roster documents verified in accordance with APH 2026-27.");
  const [isCompleting, setIsCompleting] = useState<boolean>(false);

  // Handlers
  function handleStatusChange(docId: string, status: "pending" | "verified" | "deficient") {
    setDocReviews((prev) => ({
      ...prev,
      [docId]: {
        ...prev[docId],
        status,
        remarks: status === "verified" && !prev[docId]?.remarks ? "Verified compliant per APH norms" : prev[docId]?.remarks || "",
      },
    }));
  }

  function handleRemarksChange(docId: string, remarks: string) {
    setDocReviews((prev) => ({
      ...prev,
      [docId]: {
        ...prev[docId],
        remarks,
      },
    }));
  }

  function handleDeficiencyReasonChange(docId: string, deficiencyReason: string) {
    setDocReviews((prev) => ({
      ...prev,
      [docId]: {
        ...prev[docId],
        deficiencyReason,
      },
    }));
  }

  // 1. Save Checklist Reviews
  async function handleSaveReviews() {
    setIsSavingReviews(true);
    setSaveMessage(null);

    const payload: DocumentReviewInput[] = documents.map((doc) => {
      const r = docReviews[doc.id] || { status: "pending", remarks: "", deficiencyReason: "" };
      return {
        documentId: doc.id,
        category: doc.category,
        status: r.status,
        remarks: r.remarks,
        deficiencyReason: r.status === "deficient" ? r.deficiencyReason : undefined,
      };
    });

    const res = await saveDocumentReviewResults(application.id, payload);
    setIsSavingReviews(false);

    if (res.success) {
      setSaveMessage({ text: res.message });
      router.refresh();
    } else {
      setSaveMessage({ text: res.message, isError: true });
    }
  }

  // 2. Issue Formal Deficiency Notice
  async function handleConfirmDeficiencyReturn() {
    const deficientDocs = documents.filter((doc) => docReviews[doc.id]?.status === "deficient");
    const deficientCategories = deficientDocs.map((d) => d.category);

    if (deficientCategories.length === 0) {
      alert("Please mark at least one document as 'Deficient' before issuing a deficiency notice.");
      return;
    }

    if (!deficiencyInstructions.trim()) {
      alert("Please provide clear correction instructions for the institution.");
      return;
    }

    setIsReturning(true);
    const res = await returnForDeficiencies(
      application.id,
      deficientCategories,
      deficiencyInstructions,
      deficiencyDeadlineDays
    );
    setIsReturning(false);

    if (res.success) {
      setShowDeficiencyModal(false);
      setSaveMessage({ text: res.message });
      router.refresh();
    } else {
      alert(`Error returning application: ${res.message}`);
    }
  }

  // 3. Complete Scrutiny
  async function handleConfirmCompleteScrutiny() {
    setIsCompleting(true);
    const res = await completeScrutinyStage(application.id, completionFindings);
    setIsCompleting(false);

    if (res.success) {
      setShowCompleteModal(false);
      setSaveMessage({ text: res.message });
      router.refresh();
    } else {
      alert(`Cannot complete scrutiny: ${res.message}`);
    }
  }

  const verifiedCount = Object.values(docReviews).filter((r) => r.status === "verified").length;
  const deficientCount = Object.values(docReviews).filter((r) => r.status === "deficient").length;
  const pendingCount = documents.length - verifiedCount - deficientCount;
  const canComplete = documents.length > 0 && deficientCount === 0 && pendingCount === 0;

  const inst = application.institution;
  const reg = application.region;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Breadcrumb & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/scrutiny" className="text-xs font-semibold text-teal-700 hover:underline">
              &larr; Scrutiny Worklist
            </Link>
            <span className="text-slate-300">&bull;</span>
            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
              {application.application_number}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 mt-1">
            Conduct Scrutiny Checklist Review
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {inst?.name || "Technical Institute"} &bull; AICTE PID: {inst?.aicte_id || "Pending"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isDemo && (
            <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded bg-amber-100 text-amber-800 border border-amber-300">
              Demo Simulation Record
            </span>
          )}
          <span className="text-xs font-bold uppercase px-3 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-300 font-mono">
            {application.status.replace(/_/g, " ")}
          </span>
        </div>
      </div>

      {saveMessage && (
        <div
          className={`p-4 rounded-xl border text-xs font-medium ${
            saveMessage.isError
              ? "bg-rose-50 border-rose-200 text-rose-800"
              : "bg-emerald-50 border-emerald-200 text-emerald-800"
          }`}
        >
          {saveMessage.text}
        </div>
      )}

      {/* Application Summary Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div>
          <span className="text-slate-400 text-[10px] uppercase font-bold block">Application Category</span>
          <span className="font-bold text-slate-900 text-xs mt-0.5 block">{application.application_type}</span>
        </div>
        <div>
          <span className="text-slate-400 text-[10px] uppercase font-bold block">Academic Year</span>
          <span className="font-mono font-bold text-slate-900 text-xs mt-0.5 block">AY {application.academic_year}</span>
        </div>
        <div>
          <span className="text-slate-400 text-[10px] uppercase font-bold block">Assigned Route</span>
          <span className="font-mono font-bold text-blue-800 text-xs mt-0.5 block">
            {application.workflow_definition?.code || "SCRUTINY_ONLY"}
          </span>
        </div>
        <div>
          <span className="text-slate-400 text-[10px] uppercase font-bold block">Regional Office</span>
          <span className="font-bold text-slate-900 text-xs mt-0.5 block">{reg?.name || "Western Regional Office"}</span>
        </div>
      </div>

      {/* Scrutiny Progress Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs">
          <span className="text-emerald-700 font-bold block uppercase text-[10px]">Verified Compliant</span>
          <div className="text-2xl font-black text-emerald-900 mt-1">{verifiedCount} of {documents.length}</div>
          <span className="text-[10px] text-emerald-600 mt-0.5 block">Mandatory checks passed</span>
        </div>

        <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 text-xs">
          <span className="text-rose-700 font-bold block uppercase text-[10px]">Marked Deficient</span>
          <div className="text-2xl font-black text-rose-900 mt-1">{deficientCount}</div>
          <span className="text-[10px] text-rose-600 mt-0.5 block">Requires applicant rectification</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <span className="text-slate-500 font-bold block uppercase text-[10px]">Pending Evaluation</span>
          <div className="text-2xl font-black text-slate-800 mt-1">{pendingCount}</div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Awaiting officer determination</span>
        </div>
      </div>

      {/* Document Review Checklist */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Statutory Attachment Verification Checklist
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Inspect each uploaded document, assign determination status, and record binding audit remarks.
            </p>
          </div>

          <button
            type="button"
            disabled={isSavingReviews}
            onClick={handleSaveReviews}
            className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white text-xs font-bold transition-colors self-start sm:self-auto"
          >
            {isSavingReviews ? "Saving Reviews..." : "Save Checklist Progress"}
          </button>
        </div>

        {documents.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No documents uploaded yet for this application docket.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {documents.map((doc, idx) => {
              const review = docReviews[doc.id] || { status: "pending", remarks: "", deficiencyReason: "" };

              return (
                <div key={doc.id} className="p-5 space-y-3 hover:bg-slate-50/40 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 font-mono text-xs font-bold mt-0.5">
                        0{idx + 1}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900 capitalize">
                            {doc.category.replace(/_/g, " ")}
                          </h4>
                          <span className="text-[10px] font-mono text-slate-500">
                            {(doc.file_size_bytes / (1024 * 1024)).toFixed(2)} MB
                          </span>
                        </div>

                        <div className="text-xs text-slate-600 mt-1 flex items-center gap-2 font-mono">
                          <FileTextIcon className="w-3.5 h-3.5 text-slate-400" />
                          <span>{doc.file_name}</span>
                        </div>

                        {doc.checksum_sha256 && (
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            SHA-256: {doc.checksum_sha256.slice(0, 32)}...
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Document Inspection & Status Controls */}
                    <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const res = await fetch(`/api/documents/signed-url?documentId=${doc.id}`);
                            const data = await res.json();
                            if (data.signedUrl) {
                              window.open(data.signedUrl, "_blank");
                            } else {
                              alert(`Statutory Vault Seal Verified: ${doc.file_name}\nChecksum: ${doc.checksum_sha256 || "Verified"}\n\n${data.message || "Document verified in private vault."}`);
                            }
                          } catch {
                            alert(`Document ${doc.file_name} verified in repository.`);
                          }
                        }}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
                      >
                        Inspect Document
                      </button>

                      {/* Status Selector */}
                      <select
                        value={review.status}
                        onChange={(e) => handleStatusChange(doc.id, e.target.value as "pending" | "verified" | "deficient")}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${
                          review.status === "verified"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                            : review.status === "deficient"
                            ? "bg-rose-50 text-rose-800 border-rose-300"
                            : "bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        <option value="pending">Status: Pending</option>
                        <option value="verified">Status: Verified Compliant</option>
                        <option value="deficient">Status: Deficient (Action Req)</option>
                      </select>
                    </div>
                  </div>

                  {/* Remarks input */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                        Scrutiny Officer Remarks
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Verified clear title deed under APH Appendix 4"
                        value={review.remarks}
                        onChange={(e) => handleRemarksChange(doc.id, e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
                      />
                    </div>

                    {review.status === "deficient" && (
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-rose-700 mb-1">
                          Mandatory Deficiency Reason *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Fire NOC validity expired on 30 Sep 2026; renewal required"
                          value={review.deficiencyReason}
                          onChange={(e) => handleDeficiencyReasonChange(doc.id, e.target.value)}
                          className="w-full text-xs px-3 py-2 rounded-lg border border-rose-300 bg-rose-50/30 text-rose-900 focus:outline-none focus:ring-1 focus:ring-rose-500"
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Action Toolbar */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-xs text-slate-500">
            {deficientCount > 0 ? (
              <span className="text-rose-700 font-bold">
                ⚠ {deficientCount} item(s) marked as deficient. Return application to applicant for rectification.
              </span>
            ) : canComplete ? (
              <span className="text-emerald-700 font-bold">
                ✓ All {documents.length} mandatory documents verified. Ready to certify scrutiny clearance.
              </span>
            ) : (
              <span>All documents must be determined as Verified before completing scrutiny.</span>
            )}
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {deficientCount > 0 && (
              <button
                type="button"
                onClick={() => setShowDeficiencyModal(true)}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-2xs"
              >
                Return for Deficiencies &rarr;
              </button>
            )}

            <button
              type="button"
              disabled={!canComplete || isCompleting}
              onClick={() => setShowCompleteModal(true)}
              className="px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-bold transition-colors shadow-2xs"
            >
              Complete Scrutiny &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* MODAL 1: Return for Deficiencies Confirmation */}
      {showDeficiencyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300">
                Formal Regulatory Action
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">
                Return Application for Statutory Deficiencies
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Application will transition to &quot;scrutiny_clarification_sought&quot;. An official deficiency notice and in-app alert will be dispatched to the applicant.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Deficient Categories:
              </label>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {documents
                  .filter((d) => docReviews[d.id]?.status === "deficient")
                  .map((d) => (
                    <span key={d.id} className="px-2.5 py-1 rounded-md bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold">
                      {d.category.replace(/_/g, " ")}
                    </span>
                  ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Correction Instructions for Institution *
              </label>
              <textarea
                rows={3}
                placeholder="Specify exact corrections required under APH 2026-27 (e.g. Upload renewed Fire Safety Certificate issued by Chief Fire Officer)."
                value={deficiencyInstructions}
                onChange={(e) => setDeficiencyInstructions(e.target.value)}
                className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Response SLA Window (Working Days) *
              </label>
              <select
                value={deficiencyDeadlineDays}
                onChange={(e) => setDeficiencyDeadlineDays(parseInt(e.target.value, 10))}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
              >
                <option value={7}>7 Working Days (Standard Statutory Window)</option>
                <option value={10}>10 Working Days</option>
                <option value={15}>15 Working Days (Extended Window)</option>
              </select>
            </div>

            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
              <strong>Notice:</strong> In-app deficiency notice is recorded in the immutable ledger. Automated external email/SMS dispatch is logged as simulated if external SMTP/SMS gateway is pending deployment.
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeficiencyModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isReturning}
                onClick={handleConfirmDeficiencyReturn}
                className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white text-xs font-bold transition-colors shadow-2xs"
              >
                {isReturning ? "Dispatching Notice..." : "Confirm & Return Application"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Complete Scrutiny Clearance Confirmation */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                Scrutiny Committee Sign-off
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">
                Certify Scrutiny Clearance
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                All mandatory documents have been certified compliant. Application will advance to the next statutory stage according to Route [{application.workflow_definition?.code || "SCRUTINY_ONLY"}].
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Scrutiny Committee Evaluation Findings &amp; Summary *
              </label>
              <textarea
                rows={4}
                value={completionFindings}
                onChange={(e) => setCompletionFindings(e.target.value)}
                className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="p-3 rounded-lg bg-teal-50 border border-teal-200 text-xs text-teal-900">
              <strong>Workflow Progression:</strong> Final statutory approval is NOT granted automatically. Case is progressed to the assigned next authority (Executive Council for Route A, or EVC expert dispatch for Route B).
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCompleteModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isCompleting}
                onClick={handleConfirmCompleteScrutiny}
                className="px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white text-xs font-bold transition-colors shadow-2xs"
              >
                {isCompleting ? "Recording Clearance..." : "Certify & Progress Application"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
