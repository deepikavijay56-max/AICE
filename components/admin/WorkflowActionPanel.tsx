"use client";

import React, { useState, useTransition } from "react";
import { advanceApplicationStatus } from "@/app/admin/applications/actions";
import type { ApplicationStatus } from "@/types/database";
import { CheckCircleIcon, AlertCircleIcon, ShieldCheckIcon } from "@/components/admin/Icons";

interface WorkflowActionPanelProps {
  applicationId: string;
  currentStatus: string;
  applicationNumber: string;
}

interface PermittedAction {
  targetStatus: ApplicationStatus;
  label: string;
  description: string;
  style: "primary" | "warning" | "danger" | "neutral";
  requiresRemark?: boolean;
}

// Strictly configured to valid transitions from enforce_application_integrity()
const ACTIONS_BY_STATUS: Record<string, PermittedAction[]> = {
  submitted: [
    {
      targetStatus: "under_scrutiny",
      label: "Commence Regional Scrutiny",
      description: "Initiate statutory document and land/building compliance review at Regional Office",
      style: "primary",
    },
    {
      targetStatus: "rejected",
      label: "Reject (Deficient at Inception)",
      description: "Issue formal rejection order due to critical non-compliance",
      style: "danger",
      requiresRemark: true,
    },
  ],
  under_scrutiny: [
    {
      targetStatus: "scrutiny_cleared",
      label: "Clear Scrutiny Stage",
      description: "Certify that all statutory documents and infrastructure claims satisfy handbook norms",
      style: "primary",
    },
    {
      targetStatus: "scrutiny_clarification_sought",
      label: "Seek Institution Clarification",
      description: "Issue deficiency notice to institution with statutory response window",
      style: "warning",
      requiresRemark: true,
    },
    {
      targetStatus: "rejected",
      label: "Reject Application",
      description: "Reject due to fatal infrastructure or documentation defect",
      style: "danger",
      requiresRemark: true,
    },
  ],
  scrutiny_clarification_sought: [
    {
      targetStatus: "under_scrutiny",
      label: "Resume Scrutiny Review",
      description: "Re-evaluate application after institution submitted compliance clarification",
      style: "primary",
    },
    {
      targetStatus: "rejected",
      label: "Reject (Clarification Unsatisfactory)",
      description: "Institution failed to clear identified statutory deficiencies within SLA",
      style: "danger",
      requiresRemark: true,
    },
  ],
  scrutiny_cleared: [
    {
      targetStatus: "evc_scheduled",
      label: "Dispatch Expert Visiting Committee (EVC)",
      description: "Schedule on-site surprise physical inspection by 3-member expert panel",
      style: "primary",
    },
    {
      targetStatus: "council_decision_pending",
      label: "Forward Directly to Council Decision",
      description: "Exempt from EVC (for standard EoA without faculty or infrastructure variation)",
      style: "neutral",
    },
  ],
  evc_scheduled: [
    {
      targetStatus: "evc_completed",
      label: "Log EVC Inspection Completed",
      description: "Verify that Expert Committee has uploaded geotagged report and score",
      style: "primary",
    },
    {
      targetStatus: "scrutiny_clarification_sought",
      label: "Seek Deficiency Rectification",
      description: "EVC reported minor physical discrepancies requiring institutional response",
      style: "warning",
      requiresRemark: true,
    },
  ],
  evc_completed: [
    {
      targetStatus: "sac_review",
      label: "Refer to Standing Appellate Committee (SAC)",
      description: "Formal appellate hearing for contentious inspection observations",
      style: "neutral",
    },
    {
      targetStatus: "council_decision_pending",
      label: "Forward to Council Decision Gate",
      description: "Present inspection findings and compliance score for Council approval sanction",
      style: "primary",
    },
  ],
  sac_review: [
    {
      targetStatus: "council_decision_pending",
      label: "SAC Recommendation Cleared",
      description: "Appellate committee recommendations submitted for final council deliberation",
      style: "primary",
    },
    {
      targetStatus: "scrutiny_clarification_sought",
      label: "Request Supplementary Proof",
      description: "Send back for documentary proof requested during SAC hearing",
      style: "warning",
      requiresRemark: true,
    },
  ],
  council_decision_pending: [
    {
      targetStatus: "approved",
      label: "Grant Statutory Approval (EoA / LoA)",
      description: "Issue official digitally signed AICTE Approval Order for AY 2026-27",
      style: "primary",
      requiresRemark: true,
    },
    {
      targetStatus: "rejected",
      label: "Refuse Approval (Issue Speaking Order)",
      description: "Formal refusal with reasoned speaking order under AICTE Regulations",
      style: "danger",
      requiresRemark: true,
    },
  ],
};

export function WorkflowActionPanel({
  applicationId,
  currentStatus,
  applicationNumber,
}: WorkflowActionPanelProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedAction, setSelectedAction] = useState<PermittedAction | null>(null);
  const [remarks, setRemarks] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  const availableActions = ACTIONS_BY_STATUS[currentStatus] || [];
  const isTerminal = ["approved", "rejected", "withdrawn"].includes(currentStatus);

  const handleExecute = (action: PermittedAction) => {
    if (action.requiresRemark && !remarks.trim()) {
      setFeedback({
        type: "error",
        message: "A formal remark / statutory reason is required for this action.",
      });
      return;
    }

    setFeedback(null);
    startTransition(async () => {
      const res = await advanceApplicationStatus(applicationId, action.targetStatus, remarks);
      if (res.success) {
        setFeedback({ type: "success", message: res.message });
        setSelectedAction(null);
        setRemarks("");
      } else {
        setFeedback({ type: "error", message: res.message });
      }
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-600 flex items-center justify-center font-bold">
            <ShieldCheckIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Statutory Workflow Transition Gate
            </h3>
            <p className="text-[11px] text-slate-500">
              Authorized actions governed by statutory approval process rules for {applicationNumber}
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200 uppercase">
          Status: {currentStatus.replace(/_/g, " ")}
        </span>
      </div>

      <div className="p-4 sm:p-6 space-y-4">
        {feedback && (
          <div
            className={`p-3 rounded-lg text-xs flex items-start gap-2.5 border ${
              feedback.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-rose-50 text-rose-800 border-rose-200"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircleIcon className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <p className="leading-relaxed">{feedback.message}</p>
          </div>
        )}

        {isTerminal ? (
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-center">
            <p className="text-xs font-semibold text-slate-700">
              Application has reached a terminal regulatory status ({currentStatus.toUpperCase()}).
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              No further transitions are permitted under Approval Process Handbook rules.
            </p>
          </div>
        ) : availableActions.length === 0 ? (
          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-left space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
              <AlertCircleIcon className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Pending Action from Responsible Statutory Authority</span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              This case is currently locked at stage <strong className="font-mono uppercase">{currentStatus.replace(/_/g, " ")}</strong>.
              {currentStatus === "draft" && " Waiting on Institution Admin to complete statutory document uploads and execute digital undertaking."}
              {currentStatus === "submitted" && " Waiting on Regional Scrutiny Officer to initiate document scrutiny and title verification."}
              {currentStatus === "under_scrutiny" && " Scrutiny Committee is currently reviewing uploaded infrastructure proof and compliance checklist."}
              {currentStatus === "scrutiny_clarification_sought" && " Waiting on Institutional Applicant to submit deficiency clarifications and rectifications."}
              {currentStatus === "evc_scheduled" && " Assigned 3-member Expert Visiting Committee (EVC) is conducting on-site physical/virtual audit."}
              {currentStatus === "evc_completed" && " Regional Officer is appraising the EVC inspection report and compliance score."}
              {currentStatus === "sac_review" && " Standing Appellate Committee (SAC) is holding a hearing regarding contested inspection observations."}
              {currentStatus === "council_decision_pending" && " Executive Council Approval Bureau is convening for final statutory determination."}
            </p>
            <div className="text-[11px] text-amber-700/90 pt-1 font-mono">
              Enforced by: Statutory Workflow Integrity Rule
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {availableActions.map((act) => {
                const isSelected = selectedAction?.targetStatus === act.targetStatus;
                return (
                  <button
                    key={act.targetStatus}
                    onClick={() => {
                      setSelectedAction(isSelected ? null : act);
                      setFeedback(null);
                    }}
                    className={`p-3.5 text-left rounded-xl border transition-all ${
                      isSelected
                        ? "border-teal-600 bg-teal-50/50 ring-2 ring-teal-500/20"
                        : "border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/80"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{act.label}</span>
                      <span
                        className={`w-2 h-2 rounded-full ${
                          act.style === "primary"
                            ? "bg-teal-500"
                            : act.style === "danger"
                            ? "bg-rose-500"
                            : act.style === "warning"
                            ? "bg-amber-500"
                            : "bg-indigo-500"
                        }`}
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                      {act.description}
                    </p>
                  </button>
                );
              })}
            </div>

            {selectedAction && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900">
                    Confirm Step: {selectedAction.label}
                  </h4>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-teal-100 text-teal-800 font-semibold">
                    Target: {selectedAction.targetStatus}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Statutory Reason / Committee Remarks{" "}
                    {selectedAction.requiresRemark ? (
                      <span className="text-rose-500 font-bold">*</span>
                    ) : (
                      <span className="text-slate-400 font-normal">(Optional)</span>
                    )}
                  </label>
                  <textarea
                    rows={2}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Enter formal justification, SAC hearing ref, or council minute resolution..."
                    className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAction(null);
                      setRemarks("");
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleExecute(selectedAction)}
                    className={`px-4 py-1.5 text-xs font-bold text-white rounded-lg transition-colors shadow-xs ${
                      selectedAction.style === "danger"
                        ? "bg-rose-600 hover:bg-rose-700"
                        : "bg-teal-600 hover:bg-teal-700"
                    } disabled:opacity-50`}
                  >
                    {isPending ? "Validating & Advancing..." : "Apply Statutory Transition"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
