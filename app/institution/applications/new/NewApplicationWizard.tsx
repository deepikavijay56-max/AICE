"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  createDraftApplication,
  uploadApplicationDocument,
  deleteApplicationDocument,
  submitApplication,
  MANDATORY_DOCUMENT_CATEGORIES,
} from "../../actions";
import {
  FileTextIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  ArrowRightIcon,
} from "@/components/admin/Icons";

interface ProfileData {
  id: string;
  fullName: string;
  email: string;
  role: string;
  institution?: {
    id: string;
    name: string;
    aicte_id: string | null;
    state: string;
    city: string;
    regionName?: string;
  } | null;
}

interface NewApplicationWizardProps {
  profile: ProfileData;
  initialDraft?: {
    application: {
      id: string;
      application_number: string;
      academic_year: string;
      application_type: string;
      current_stage: string;
      status: string;
      metadata: Record<string, unknown> | null;
      institution_id: string;
      workflow_definition?: { code: string } | null;
    };
    documents: Array<{
      id: string;
      category: string;
      file_name: string;
      file_size_bytes: number;
      checksum_sha256: string;
      storage_key: string;
    }>;
  } | null;
}

interface UploadedDocState {
  id?: string;
  category: string;
  fileName: string;
  fileSizeBytes: number;
  checksumSha256: string;
  storageKey?: string;
  uploading?: boolean;
  error?: string;
}

export function NewApplicationWizard({ profile, initialDraft }: NewApplicationWizardProps) {
  // Wizard Steps: 1: Details -> 2: Upload Documents -> 3: Review Checklist -> 4: Complete
  const [currentStep, setCurrentStep] = useState<number>(() => {
    if (initialDraft?.application) {
      // If reopening draft with documents, go to Step 2
      return 2;
    }
    return 1;
  });

  // Step 1: Form state
  const [applicationType, setApplicationType] = useState<string>(
    initialDraft?.application?.application_type || "Extension of Approval (EoA)"
  );
  const academicYear = initialDraft?.application?.academic_year || "2026-2027";
  const [programType, setProgramType] = useState<string>(
    (initialDraft?.application?.metadata?.program as string) || "Engineering & Technology"
  );
  const [routeCode, setRouteCode] = useState<string>(
    (initialDraft?.application?.metadata?.statutory_route_code as string) ||
    initialDraft?.application?.workflow_definition?.code ||
    "SCRUTINY_ONLY"
  );
  const [intakeApplied, setIntakeApplied] = useState<number>(
    (initialDraft?.application?.metadata?.intake_applied as number) || 120
  );
  const [notes, setNotes] = useState<string>(
    (initialDraft?.application?.metadata?.notes as string) || ""
  );

  // Application creation result
  const [isCreatingDraft, setIsCreatingDraft] = useState<boolean>(false);
  const [applicationId, setApplicationId] = useState<string | null>(
    initialDraft?.application?.id || null
  );
  const [applicationNumber, setApplicationNumber] = useState<string | null>(
    initialDraft?.application?.application_number || null
  );
  const [draftError, setDraftError] = useState<string | null>(null);

  // Step 2: Upload state
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, UploadedDocState>>(() => {
    if (initialDraft?.documents && initialDraft.documents.length > 0) {
      const map: Record<string, UploadedDocState> = {};
      for (const d of initialDraft.documents) {
        map[d.category] = {
          id: d.id,
          category: d.category,
          fileName: d.file_name,
          fileSizeBytes: d.file_size_bytes,
          checksumSha256: d.checksum_sha256,
          storageKey: d.storage_key,
          uploading: false,
        };
      }
      return map;
    }
    return {};
  });

  // Step 3: Review & Submission state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [affirmationChecked, setAffirmationChecked] = useState<boolean>(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  // Handler: Step 1 Create or Update Draft
  async function handleCreateDraft(e: React.FormEvent) {
    e.preventDefault();
    if (applicationId && applicationNumber) {
      // Already has saved draft, advance to uploads
      setCurrentStep(2);
      return;
    }

    setIsCreatingDraft(true);
    setDraftError(null);

    const formData = new FormData();
    formData.append("applicationType", applicationType);
    formData.append("academicYear", academicYear);
    formData.append("programType", programType);
    formData.append("routeCode", routeCode);
    formData.append("intakeApplied", intakeApplied.toString());
    formData.append("notes", notes);

    const res = await createDraftApplication(formData);
    setIsCreatingDraft(false);

    if (!res.success) {
      setDraftError(res.message);
      return;
    }

    if (res.applicationId && res.applicationNumber) {
      setApplicationId(res.applicationId);
      setApplicationNumber(res.applicationNumber);
      setCurrentStep(2);
    }
  }

  // Handler: File Upload per Category
  async function handleFileUpload(categoryKey: string, file: File) {
    if (!applicationId) return;

    // Local file validation
    if (file.size > 15 * 1024 * 1024) {
      setUploadedDocs((prev) => ({
        ...prev,
        [categoryKey]: {
          category: categoryKey,
          fileName: file.name,
          fileSizeBytes: file.size,
          checksumSha256: "",
          error: "File exceeds 15 MB maximum size limit.",
        },
      }));
      return;
    }

    // Set uploading indicator
    setUploadedDocs((prev) => ({
      ...prev,
      [categoryKey]: {
        category: categoryKey,
        fileName: file.name,
        fileSizeBytes: file.size,
        checksumSha256: "",
        uploading: true,
      },
    }));

    const formData = new FormData();
    formData.append("file", file);
    formData.append("applicationId", applicationId);
    formData.append("category", categoryKey);

    const res = await uploadApplicationDocument(formData);

    if (!res.success) {
      setUploadedDocs((prev) => ({
        ...prev,
        [categoryKey]: {
          category: categoryKey,
          fileName: file.name,
          fileSizeBytes: file.size,
          checksumSha256: "",
          uploading: false,
          error: res.message,
        },
      }));
    } else {
      setUploadedDocs((prev) => ({
        ...prev,
        [categoryKey]: {
          id: res.documentId,
          category: categoryKey,
          fileName: res.fileName || file.name,
          fileSizeBytes: res.fileSizeBytes || file.size,
          checksumSha256: res.checksumSha256 || "",
          storageKey: res.storageKey,
          uploading: false,
        },
      }));
    }
  }

  // Handler: Remove Document
  async function handleRemoveDocument(categoryKey: string) {
    const doc = uploadedDocs[categoryKey];
    if (doc?.id) {
      await deleteApplicationDocument(doc.id);
    }
    setUploadedDocs((prev) => {
      const next = { ...prev };
      delete next[categoryKey];
      return next;
    });
  }

  // Handler: Submit to Scrutiny
  async function handleSubmitToScrutiny() {
    if (!applicationId) return;
    if (!affirmationChecked) {
      setSubmitError("You must digitally affirm the statutory declaration before final submission.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const res = await submitApplication(applicationId);
    setIsSubmitting(false);

    if (!res.success) {
      setSubmitError(res.message);
      return;
    }

    setSubmittedRef(res.applicationNumber || applicationNumber);
    setCurrentStep(4);
  }

  const institutionName = profile.institution?.name || "COEP Technological University";
  const aicteId = profile.institution?.aicte_id || "1-10992341";
  const locationText = `${profile.institution?.city || "Pune"}, ${profile.institution?.state || "Maharashtra"}`;

  const uploadedCount = Object.values(uploadedDocs).filter((d) => !d.error && !d.uploading).length;
  const mandatoryTotal = MANDATORY_DOCUMENT_CATEGORIES.length;
  const isUploadComplete = uploadedCount >= mandatoryTotal;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-teal-100 text-teal-800 border border-teal-300">
              National Approval Portal
            </span>
            <span className="text-xs text-slate-500 font-mono">Academic Year 2026-2027</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 mt-1">
            New Institution Approval Application
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {institutionName} &bull; PID: {aicteId} &bull; {locationText}
          </p>
        </div>

        <Link
          href="/institution"
          className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors self-start sm:self-auto"
        >
          &larr; Back to Dashboard
        </Link>
      </div>

      {/* Stepper Navigation */}
      <div className="grid grid-cols-4 gap-2 p-1.5 bg-slate-100 rounded-xl border border-slate-200">
        {[
          { step: 1, label: "Application Details", desc: "Category & Route" },
          { step: 2, label: "Upload Documents", desc: "Mandatory Clearances" },
          { step: 3, label: "Review & Confirm", desc: "Affirmation Checklist" },
          { step: 4, label: "Submitted", desc: "Statutory Reference" },
        ].map((item) => {
          const isActive = currentStep === item.step;
          const isDone = currentStep > item.step;

          return (
            <div
              key={item.step}
              className={`p-3 rounded-lg text-left transition-all ${
                isActive
                  ? "bg-white text-slate-900 shadow-xs border border-teal-500/40"
                  : isDone
                  ? "bg-teal-50/70 text-teal-900 border border-teal-200"
                  : "text-slate-400"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[11px] font-mono font-bold w-5 h-5 rounded-full flex items-center justify-center ${
                    isActive
                      ? "bg-teal-600 text-white"
                      : isDone
                      ? "bg-teal-600 text-white"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {isDone ? "✓" : item.step}
                </span>
                {isActive && <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />}
              </div>
              <div className="text-xs font-bold mt-2 leading-tight">{item.label}</div>
              <div className="text-[10px] text-slate-500 truncate hidden sm:block mt-0.5">
                {item.desc}
              </div>
            </div>
          );
        })}
      </div>

      {/* STEP 1: Application Details */}
      {currentStep === 1 && (
        <form onSubmit={handleCreateDraft} className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900">Step 1: Application Metadata &amp; Statutory Route</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Prefilled based on your verified institutional credentials under AICTE National Portal records.
            </p>
          </div>

          {draftError && (
            <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
              <strong>Error:</strong> {draftError}
            </div>
          )}

          {/* Prefilled Institute Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Institution Name</span>
              <span className="font-bold text-slate-900 text-xs mt-0.5 block">{institutionName}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Permanent Institute ID</span>
              <span className="font-mono font-bold text-slate-900 text-xs mt-0.5 block">{aicteId}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Campus Location</span>
              <span className="font-bold text-slate-900 text-xs mt-0.5 block">{locationText}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="applicationType" className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Application Category *
              </label>
              <select
                id="applicationType"
                value={applicationType}
                onChange={(e) => setApplicationType(e.target.value)}
                className="w-full text-xs font-medium px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="Extension of Approval (EoA)">Extension of Approval (EoA) - Standard AY 2026-27</option>
                <option value="Increase in Intake / Additional Course">Increase in Intake / Additional Course</option>
                <option value="New Technical Program">New Technical Program Inception</option>
                <option value="Conversion of Degree to Integrated Program">Conversion of Degree to Integrated Program</option>
              </select>
            </div>

            <div>
              <label htmlFor="academicYear" className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Academic Year *
              </label>
              <input
                id="academicYear"
                type="text"
                readOnly
                value={academicYear}
                className="w-full text-xs font-mono font-bold px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-100 text-slate-700"
              />
            </div>

            <div>
              <label htmlFor="programType" className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Technical Program Discipline *
              </label>
              <select
                id="programType"
                value={programType}
                onChange={(e) => setProgramType(e.target.value)}
                className="w-full text-xs font-medium px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="Engineering & Technology">Engineering &amp; Technology</option>
                <option value="Management (PGDM/MBA)">Management (PGDM / MBA)</option>
                <option value="Pharmacy (B.Pharm/M.Pharm)">Pharmacy (B.Pharm / M.Pharm)</option>
                <option value="Architecture & Planning">Architecture &amp; Planning</option>
                <option value="MCA / Computer Applications">MCA / Computer Applications</option>
                <option value="Hotel Management & Catering">Hotel Management &amp; Catering</option>
              </select>
            </div>

            <div>
              <label htmlFor="routeCode" className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Statutory Regulatory Route *
              </label>
              <select
                id="routeCode"
                value={routeCode}
                onChange={(e) => setRouteCode(e.target.value)}
                className="w-full text-xs font-medium px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="SCRUTINY_ONLY">Route A: Scrutiny Only (Standard EoA - Fast Track)</option>
                <option value="SCRUTINY_EVC">Route B: Scrutiny + EVC (Expansion / Infrastructure Check)</option>
              </select>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Determines the regulatory committee stages mandated under APH 2026-27.
              </span>
            </div>

            <div>
              <label htmlFor="intakeApplied" className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Total Intake Applied (Seats) *
              </label>
              <input
                id="intakeApplied"
                type="number"
                min="30"
                max="1200"
                step="30"
                value={intakeApplied}
                onChange={(e) => setIntakeApplied(parseInt(e.target.value, 10))}
                className="w-full text-xs font-bold px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label htmlFor="notes" className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Applicant Remarks / Docket Reference
              </label>
              <input
                id="notes"
                type="text"
                placeholder="e.g. Regular annual EoA renewal per BoG resolution"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              Draft will be saved and assigned an official AICTE application tracking reference.
            </div>

            <button
              type="submit"
              disabled={isCreatingDraft}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:bg-slate-400 text-white text-xs font-bold transition-colors shadow-2xs"
            >
              {isCreatingDraft ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating Draft...</span>
                </>
              ) : (
                <>
                  <span>Save Draft &amp; Continue to Documents</span>
                  <ArrowRightIcon className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* STEP 2: Document Upload */}
      {currentStep === 2 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                  Draft Saved: {applicationNumber}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {uploadedCount} of {mandatoryTotal} Mandatory Uploaded
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-1">
                Step 2: Upload Mandatory Statutory Attachments
              </h3>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-slate-400 block font-mono">
                Storage: Encrypted Institutional Vault
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                Max 15 MB per file &bull; PDF, PNG, JPG
              </span>
            </div>
          </div>

          {/* Document Upload Cards */}
          <div className="space-y-4">
            {MANDATORY_DOCUMENT_CATEGORIES.map((cat, idx) => {
              const docState = uploadedDocs[cat.key];
              const isUploaded = Boolean(docState && !docState.error && !docState.uploading && docState.fileName);

              return (
                <div
                  key={cat.key}
                  className={`p-4 rounded-xl border transition-all ${
                    isUploaded
                      ? "bg-emerald-50/40 border-emerald-300"
                      : docState?.error
                      ? "bg-rose-50/50 border-rose-300"
                      : "bg-slate-50/70 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                          isUploaded
                            ? "bg-emerald-600 text-white"
                            : "bg-white text-slate-500 border border-slate-200"
                        }`}
                      >
                        {isUploaded ? (
                          <CheckCircleIcon className="w-5 h-5 text-white" />
                        ) : (
                          <span className="text-xs font-mono font-bold">0{idx + 1}</span>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900">{cat.label}</h4>
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">
                            Mandatory
                          </span>
                        </div>

                        {isUploaded ? (
                          <div className="mt-1 space-y-0.5">
                            <div className="text-xs font-semibold text-emerald-900 flex items-center gap-2">
                              <FileTextIcon className="w-3.5 h-3.5 text-emerald-700" />
                              <span>{docState.fileName}</span>
                              <span className="text-[11px] text-slate-500 font-mono">
                                ({(docState.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB)
                              </span>
                            </div>
                            {docState.checksumSha256 && (
                              <div className="text-[10px] text-slate-400 font-mono truncate max-w-md">
                                SHA-256: {docState.checksumSha256.slice(0, 32)}...
                              </div>
                            )}
                          </div>
                        ) : docState?.uploading ? (
                          <div className="mt-2 flex items-center gap-2 text-xs text-teal-700">
                            <div className="w-3 h-3 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                            <span>Computing SHA-256 seal &amp; uploading to secure storage...</span>
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Upload certified copy issued or attested by competent authority.
                          </p>
                        )}

                        {docState?.error && (
                          <div className="text-xs font-semibold text-rose-700 mt-1">
                            {docState.error}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 sm:self-center shrink-0">
                      {isUploaded ? (
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-md border border-emerald-300">
                            Ready for Review
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveDocument(cat.key)}
                            className="text-xs text-rose-600 hover:text-rose-800 hover:underline px-2 py-1"
                          >
                            Replace / Remove
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-800 transition-colors shadow-2xs">
                          <span>Choose File</span>
                          <input
                            type="file"
                            accept=".pdf,image/png,image/jpeg,image/jpg"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(cat.key, file);
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              &larr; Previous Step
            </button>

            <button
              type="button"
              disabled={!isUploadComplete}
              onClick={() => setCurrentStep(3)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-bold transition-colors shadow-2xs"
            >
              <span>Review Checklist &amp; Affirmations</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Review Checklist & Affirmations */}
      {currentStep === 3 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
              Statutory Docket Review
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-1">
              Step 3: Review Mandatory Document Checklist &amp; Affirmation
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Confirm all required statutory documents and sign the digital declaration.
            </p>
          </div>

          {submitError && (
            <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
              <strong>Submission Blocked:</strong> {submitError}
            </div>
          )}

          {/* Application Summary Box */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Application Ref</span>
              <span className="font-mono font-bold text-slate-900 text-xs mt-0.5 block">{applicationNumber}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Application Category</span>
              <span className="font-bold text-slate-900 text-xs mt-0.5 block">{applicationType}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Discipline</span>
              <span className="font-bold text-slate-900 text-xs mt-0.5 block">{programType}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Assigned Route</span>
              <span className="font-mono font-bold text-blue-800 text-xs mt-0.5 block">{routeCode}</span>
            </div>
          </div>

          {/* Mandatory Document Verification Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-3 bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-between">
              <span>Statutory Document Attachment Audit</span>
              <span className="text-[11px] text-emerald-700 font-semibold">
                ✓ {uploadedCount} of {mandatoryTotal} Verified
              </span>
            </div>
            <div className="divide-y divide-slate-100 text-xs">
              {MANDATORY_DOCUMENT_CATEGORIES.map((cat) => {
                const doc = uploadedDocs[cat.key];
                return (
                  <div key={cat.key} className="p-3 flex items-center justify-between bg-white hover:bg-slate-50">
                    <div>
                      <span className="font-bold text-slate-900 block">{cat.label}</span>
                      {doc ? (
                        <span className="text-[11px] text-slate-500 font-mono">
                          File: {doc.fileName} &bull; {(doc.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB
                        </span>
                      ) : (
                        <span className="text-[11px] text-rose-600 font-semibold">Missing mandatory document</span>
                      )}
                    </div>
                    <div>
                      {doc ? (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 text-[10px]">
                          <CheckCircleIcon className="w-3 h-3" />
                          Catalogued
                        </span>
                      ) : (
                        <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-[10px] border border-rose-200">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legal Undertaking & Affirmation Checkbox */}
          <div className="p-4 rounded-xl bg-teal-50/50 border border-teal-200 space-y-3">
            <div className="flex items-start gap-2.5">
              <ShieldCheckIcon className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  Statutory Declaration &amp; Anti-Ragging Affirmation
                </h4>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  I, as the authorized Registrar / Director of {institutionName}, hereby solemnly certify that all information, documents, faculty lists, and architectural drawings submitted herein are true, authentic, and compliant with the AICTE Approval Process Handbook 2026-27. I acknowledge that any misrepresentation will lead to immediate withdrawal of approval and statutory punitive action.
                </p>
              </div>
            </div>

            <label className="flex items-center gap-2 pt-2 border-t border-teal-200/60 cursor-pointer">
              <input
                type="checkbox"
                checked={affirmationChecked}
                onChange={(e) => setAffirmationChecked(e.target.checked)}
                className="w-4 h-4 rounded text-teal-600 border-slate-300 focus:ring-teal-500"
              />
              <span className="text-xs font-bold text-slate-800">
                I agree and digitally affirm the statutory undertaking under the National Council Regulations.
              </span>
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              &larr; Back to Uploads
            </button>

            <button
              type="button"
              disabled={isSubmitting || !affirmationChecked || !isUploadComplete}
              onClick={handleSubmitToScrutiny}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-bold transition-colors shadow-2xs"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting to Scrutiny Committee...</span>
                </>
              ) : (
                <>
                  <span>Formally Submit Application</span>
                  <CheckCircleIcon className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Submission Confirmation */}
      {currentStep === 4 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto ring-8 ring-emerald-50">
            <CheckCircleIcon className="w-8 h-8" />
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
              Statutory Application Formally Submitted
            </span>
            <h3 className="text-xl font-black text-slate-900 mt-3 font-mono">
              {submittedRef || applicationNumber}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Your application has been sealed and routed to the Regional Scrutiny Officer queue. An automated audit trail entry has been recorded in the National Ledger.
            </p>
          </div>

          <div className="max-w-md mx-auto p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Institution:</span>
              <span className="font-bold text-slate-900">{institutionName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Regulatory Route:</span>
              <span className="font-mono font-bold text-blue-700">{routeCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Next Action:</span>
              <span className="font-semibold text-slate-800">Scrutiny Checklist Review by Regional Office</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Target SLA Turnaround:</span>
              <span className="font-mono text-slate-700">15 Working Days</span>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            {applicationId && (
              <Link
                href={`/institution/applications/${applicationId}`}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors shadow-2xs"
              >
                <span>Track Flight Recorder</span>
                <ArrowRightIcon className="w-3.5 h-3.5" />
              </Link>
            )}

            <Link
              href="/institution"
              className="px-5 py-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
            >
              Return to Institution Dashboard
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
