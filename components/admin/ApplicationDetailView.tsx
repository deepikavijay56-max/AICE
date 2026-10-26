"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CaseFlightRecorder } from "@/components/admin/CaseFlightRecorder";
import { WorkflowActionPanel } from "@/components/admin/WorkflowActionPanel";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type { ApplicationStatus } from "@/types/database";
import {
  BuildingOfficeIcon,
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  ShieldCheckIcon,
  FileTextIcon,
  CheckCircleIcon,
} from "@/components/admin/Icons";
import type { FullApplicationDetail } from "@/types/admin";
import type { FlightRecorderTimelineItem } from "@/lib/applicationDetail";

interface ApplicationDetailViewProps {
  application: FullApplicationDetail;
  flightRecorder: FlightRecorderTimelineItem[];
  isDemo?: boolean;
  listHref?: string;
  listTitle?: string;
}

export function ApplicationDetailView({
  application,
  flightRecorder,
  isDemo = false,
  listHref = "/admin/applications",
  listTitle = "Applications Registry",
}: ApplicationDetailViewProps) {
  const [activeTab, setActiveTab] = useState<
    "timeline" | "compliance" | "evc" | "tasks" | "documents"
  >("timeline");

  const inst = application.institution;
  const reg = application.region;

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link
            href={listHref}
            className="hover:text-teal-600 transition-colors font-medium flex items-center gap-1"
          >
            <span>{listTitle}</span>
          </Link>
          <span>/</span>
          <span className="font-mono font-bold text-slate-800">
            {application.application_number}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isDemo && (
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
              High-Fidelity Sample Record
            </span>
          )}
          <StatusBadge status={application.status as ApplicationStatus} size="md" />
        </div>
      </div>

      {/* Main Statutory Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-teal-50 text-teal-800 border border-teal-200">
                {application.application_type}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                AY {application.academic_year}
              </span>
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {inst?.name || "Institution Name Not Registered"}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-xs text-slate-500">
                <span className="flex items-center gap-1 font-mono">
                  <BuildingOfficeIcon className="w-3.5 h-3.5 text-slate-400" />
                  AICTE PID: {inst?.aicte_id || "Pending"}
                </span>
                <span className="flex items-center gap-1">
                  <MapPinIcon className="w-3.5 h-3.5 text-slate-400" />
                  {inst?.city ? `${inst.city}, ${inst.state}` : reg?.name || "Regional Office"}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  Region: {reg?.name} ({reg?.code})
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Badge */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 lg:border-l lg:border-slate-100 lg:pl-6 shrink-0">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div className="text-[10px] uppercase font-bold text-slate-400">Current Stage</div>
              <div className="text-xs font-bold text-slate-800 mt-0.5 capitalize">
                {application.current_stage.replace(/_/g, " ")}
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div className="text-[10px] uppercase font-bold text-slate-400">Submission Date</div>
              <div className="text-xs font-bold text-slate-800 mt-0.5">
                {application.submission_date
                  ? new Date(application.submission_date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "Draft (Unsubmitted)"}
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 col-span-2 sm:col-span-1">
              <div className="text-[10px] uppercase font-bold text-slate-400">Target Decision SLA</div>
              <div className="text-xs font-bold text-slate-800 mt-0.5">
                {application.target_decision_date
                  ? new Date(application.target_decision_date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "Not Scheduled"}
              </div>
            </div>
          </div>
        </div>

        {/* Real Application Lifecycle Stepper */}
        {(() => {
          const STAGES = [
            { key: "submitted", label: "Submission", role: "Applicant Institute" },
            { key: "under_scrutiny", label: "Scrutiny Verification", role: "Scrutiny Officer" },
            { key: "evc_scheduled", label: "EVC Inspection", role: "EVC Expert Committee" },
            { key: "evc_completed", label: "Report Appraisal", role: "Regional Officer" },
            { key: "council_decision_pending", label: "Council Determination", role: "Executive Council" },
            { key: "approved", label: "Sanction Issued", role: "Council Bureau" },
          ];

          const stageIndexMap: Record<string, number> = {
            submitted: 0,
            under_scrutiny: 1,
            evc_scheduled: 2,
            evc_completed: 3,
            sac_review: 3,
            council_decision_pending: 4,
            approved: 5,
            rejected: 5,
          };

          const currentIdx = stageIndexMap[application.status] ?? stageIndexMap[application.current_stage] ?? 1;

          return (
            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-900 tracking-tight">
                  Statutory Approval Lifecycle
                </span>
                <span className="text-[11px] text-slate-500">
                  Active Stage: <strong className="text-blue-700 capitalize">{application.status.replace(/_/g, " ")}</strong>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {STAGES.map((s, idx) => {
                  const isCompleted = idx < currentIdx;
                  const isCurrent = idx === currentIdx;

                  return (
                    <div
                      key={s.key}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        isCurrent
                          ? "bg-blue-50/80 border-blue-500 ring-1 ring-blue-500/20"
                          : isCompleted
                          ? "bg-emerald-50/60 border-emerald-200"
                          : "bg-slate-50/60 border-slate-200 text-slate-400"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-slate-500">
                          0{idx + 1}
                        </span>
                        {isCompleted && (
                          <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                            ✓
                          </span>
                        )}
                        {isCurrent && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                        )}
                      </div>
                      <div className={`text-xs font-bold mt-1.5 leading-tight ${isCurrent ? "text-blue-900" : isCompleted ? "text-emerald-950" : "text-slate-500"}`}>
                        {s.label}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1 truncate">
                        {s.role}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Workflow Transition Action Gate */}
      <WorkflowActionPanel
        applicationId={application.id}
        currentStatus={application.status}
        applicationNumber={application.application_number}
      />

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab("timeline")}
          className={`px-4 py-2.5 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "timeline"
              ? "border-teal-600 text-teal-700 bg-teal-50/30"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <span>Case Flight Recorder</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700">
            {flightRecorder.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("compliance")}
          className={`px-4 py-2.5 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "compliance"
              ? "border-teal-600 text-teal-700 bg-teal-50/30"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <span>Compliance & Clarifications</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700">
            {application.compliance_submissions?.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("evc")}
          className={`px-4 py-2.5 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "evc"
              ? "border-teal-600 text-teal-700 bg-teal-50/30"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <span>EVC Expert Visits</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700">
            {application.evc_visits?.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("tasks")}
          className={`px-4 py-2.5 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "tasks"
              ? "border-teal-600 text-teal-700 bg-teal-50/30"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <span>Workflow Tasks & SLA</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700">
            {application.workflow_tasks?.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("documents")}
          className={`px-4 py-2.5 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "documents"
              ? "border-teal-600 text-teal-700 bg-teal-50/30"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <span>Statutory Documents & Undertakings</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700">
            {(application.documents?.length || 0) + (application.undertakings?.length || 0)}
          </span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === "timeline" && (
        <CaseFlightRecorder timeline={flightRecorder} isDemo={isDemo} />
      )}

      {activeTab === "compliance" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">
              Deficiency Notices & Compliance Submissions
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Statutory replies submitted by institute against deficiency notices issued during scrutiny
            </p>
          </div>

          {!application.compliance_submissions || application.compliance_submissions.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs font-medium">
              No statutory deficiency notices or compliance submissions recorded for this application.
            </div>
          ) : (
            <div className="space-y-3">
              {application.compliance_submissions.map((comp) => (
                <div key={comp.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs">
                    <span className="font-bold text-slate-900 font-mono">
                      Ref: {comp.deficiency_notice_ref || "Formal Scrutiny Query"}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Submitted: {new Date(comp.created_at).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                    <span className="font-semibold text-slate-800">Institution Reply:</span> {comp.compliance_remarks}
                  </p>
                  {comp.review_comments && (
                    <div className="text-xs text-teal-800 bg-teal-50 p-2.5 rounded-lg border border-teal-200">
                      <span className="font-bold">Officer Review:</span> {comp.review_comments}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "evc" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Expert Visiting Committee (EVC) Visits</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Physical or hybrid inspections conducted by appointed Senior Academicians and Experts
            </p>
          </div>

          {!application.evc_visits || application.evc_visits.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs font-medium">
              No EVC visits have been scheduled or recorded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {application.evc_visits.map((evc) => (
                <div key={evc.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs">
                    <div>
                      <span className="font-bold text-slate-900">
                        Lead Expert: {evc.lead_expert?.full_name || "Assigned Panelist"}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Status: {evc.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 flex items-center gap-2">
                    <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                    <span>Inspection Date: {new Date(evc.scheduled_start).toLocaleDateString("en-IN")}</span>
                  </div>

                  {evc.findings_summary && (
                    <div className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-200">
                      <span className="font-semibold text-slate-900">Findings Summary:</span>{" "}
                      {evc.findings_summary}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "tasks" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Statutory Workflow Task Checklist</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Milestone tracking across scrutiny, expert visit, appellate committee, and council sign-off
            </p>
          </div>

          {!application.workflow_tasks || application.workflow_tasks.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs font-medium">
              No individual workflow tasks currently logged.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {application.workflow_tasks.map((task) => (
                <div key={task.id} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      {task.status === "completed" ? (
                        <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <ClockIcon className="w-4 h-4 text-amber-500" />
                      )}
                      <span>{task.task_name}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Stage: <span className="font-mono">{task.stage_key}</span> &bull; Owner: {task.assigned_profile?.full_name || task.assigned_role || "Officer"}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      task.status === "completed"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}>
                      {task.status}
                    </span>
                    {task.completed_at && (
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Completed: {new Date(task.completed_at).toLocaleDateString("en-IN")}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "documents" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-6">
          {/* Statutory Affirmations */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2">Digitally Signed Statutory Undertakings</h3>
            {!application.undertakings || application.undertakings.length === 0 ? (
              <p className="text-xs text-slate-400">No undertakings registered.</p>
            ) : (
              <div className="space-y-2">
                {application.undertakings.map((und) => (
                  <div key={und.id} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <ShieldCheckIcon className="w-4 h-4 text-teal-600" />
                        <span>{und.title}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        SHA256 Sig: {und.digital_signature_hash.slice(0, 24)}...
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Verified Signature
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(und.signed_at).toLocaleDateString("en-IN")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Secure Document Vault */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Vault Documents (Storage Keys)</h3>
            <p className="text-xs text-slate-500 mb-3">
              Protected storage keys accessible only via authorized signed URLs; never exposed publicly.
            </p>
            {!application.documents || application.documents.length === 0 ? (
              <p className="text-xs text-slate-400">No documents catalogued.</p>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                {application.documents.map((doc) => (
                  <div key={doc.id} className="p-3 bg-white hover:bg-slate-50 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <FileTextIcon className="w-4 h-4 text-slate-400" />
                      <div>
                        <div className="font-bold text-slate-900">{doc.file_name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Key: {doc.storage_key} &bull; {(doc.file_size_bytes / (1024 * 1024)).toFixed(2)} MB
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {doc.category.replace(/_/g, " ")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
