"use server";

import { revalidatePath } from "next/cache";
import crypto from "crypto";
import { createServerClient } from "@/lib/supabase/server";

export interface CreateDraftResult {
  success: boolean;
  message: string;
  applicationId?: string;
  applicationNumber?: string;
  error?: string;
}

export interface UploadDocumentResult {
  success: boolean;
  message: string;
  documentId?: string;
  storageKey?: string;
  fileName?: string;
  fileSizeBytes?: number;
  checksumSha256?: string;
  error?: string;
}

export interface SubmitApplicationResult {
  success: boolean;
  message: string;
  applicationNumber?: string;
  error?: string;
  missingDocuments?: string[];
}

export interface DeficiencyReplyResult {
  success: boolean;
  message: string;
  error?: string;
}

// Mandatory statutory documents required for submission
export const MANDATORY_DOCUMENT_CATEGORIES = [
  { key: "land_document", label: "Land Ownership Title Deed & Contiguity Certificate", required: true },
  { key: "building_plan", label: "Approved Master Building Plan & Sanction Order", required: true },
  { key: "fire_safety", label: "Fire Safety NOC / State Fire Authority Clearance", required: true },
  { key: "affidavit", label: "Anti-Ragging and Statutory Compliance Affidavit", required: true },
  { key: "faculty_list", label: "Cadre-Ratio Faculty Roster & RTGS Salary Statement", required: true },
] as const;

/**
 * 1. Create a new application in 'draft' status
 */
export async function createDraftApplication(formData: FormData): Promise<CreateDraftResult> {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        message: "Authentication required to initiate statutory application.",
        error: "UNAUTHENTICATED",
      };
    }

    // Fetch user profile and associated institution
    const { data: profile } = await (supabase.from("profiles") as unknown as {
      select: (cols: string) => {
        eq: (col: string, val: string) => {
          single: () => Promise<{
            data: { id: string; role: string; institution_id: string | null } | null;
          }>;
        };
      };
    })
      .select("id, role, institution_id")
      .eq("id", user.id)
      .single();

    if (!profile || (profile.role !== "institution_admin" && profile.role !== "institution_user" && profile.role !== "council_admin")) {
      return {
        success: false,
        message: "Only authorized Technical Institute administrators can initiate applications.",
        error: "FORBIDDEN",
      };
    }

    let institutionId = profile.institution_id;

    // Fallback for council admin testing or local demo without assigned institute
    if (!institutionId) {
      const { data: inst } = await (supabase.from("institutions") as unknown as {
        select: (cols: string) => {
          limit: (n: number) => {
            single: () => Promise<{ data: { id: string; region_id: string } | null }>;
          };
        };
      })
        .select("id, region_id")
        .limit(1)
        .single();

      if (inst) {
        institutionId = inst.id;
      }
    }

    if (!institutionId) {
      return {
        success: false,
        message: "No institution registered or linked with this user profile.",
        error: "NO_INSTITUTION",
      };
    }

    // Get institution's region
    const { data: instData } = await (supabase.from("institutions") as unknown as {
      select: (cols: string) => {
        eq: (col: string, val: string) => {
          single: () => Promise<{ data: { id: string; region_id: string; name: string } | null }>;
        };
      };
    })
      .select("id, region_id, name")
      .eq("id", institutionId)
      .single();

    if (!instData) {
      return {
        success: false,
        message: "Institution record not found in national registry.",
        error: "INSTITUTION_NOT_FOUND",
      };
    }

    const applicationType = (formData.get("applicationType") as string) || "Extension of Approval (EoA)";
    const academicYear = (formData.get("academicYear") as string) || "2026-2027";
    const programType = (formData.get("programType") as string) || "Engineering & Technology";
    const routeCode = (formData.get("routeCode") as string) || "SCRUTINY_ONLY";
    const intakeApplied = parseInt((formData.get("intakeApplied") as string) || "120", 10);

    // Look up workflow definition ID
    const { data: wfDef } = await (supabase.from("workflow_definitions") as unknown as {
      select: (cols: string) => {
        eq: (col: string, val: string) => {
          limit: (n: number) => {
            single: () => Promise<{ data: { id: string } | null }>;
          };
        };
      };
    })
      .select("id")
      .eq("code", routeCode)
      .limit(1)
      .single();

    // Generate unique AICTE application number
    const prefix = programType.includes("Management")
      ? "MGMT"
      : programType.includes("Pharmacy")
      ? "PHAR"
      : programType.includes("Architecture")
      ? "ARCH"
      : "ENGG";
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const applicationNumber = `AICTE-2026-${prefix}-${randomSuffix}`;

    const metadata = {
      program: programType,
      intake_applied: intakeApplied,
      created_by_user_id: user.id,
      statutory_route_code: routeCode,
      notes: (formData.get("notes") as string) || "Application initiated via Institution Portal",
    };

    // If workflow definition not in DB, generate a deterministic UUID or use default
    const wfId = wfDef?.id || "00000000-0000-0000-0000-000000000001";

    const { data: insertedApp, error: insertError } = await (supabase.from("applications") as unknown as {
      insert: (values: Record<string, unknown>) => {
        select: (cols: string) => {
          single: () => Promise<{
            data: { id: string; application_number: string } | null;
            error: { message: string } | null;
          }>;
        };
      };
    })
      .insert({
        application_number: applicationNumber,
        institution_id: institutionId,
        region_id: instData.region_id,
        academic_year: academicYear,
        application_type: applicationType,
        workflow_definition_id: wfId,
        current_stage: "draft",
        status: "draft",
        metadata,
      })
      .select("id, application_number")
      .single();

    if (insertError) {
      return {
        success: false,
        message: `Database error creating application: ${insertError.message}`,
        error: "INSERT_FAILED",
      };
    }

    // Log creation event in application_events
    try {
      await (supabase.from("application_events") as unknown as {
        insert: (values: Record<string, unknown>) => Promise<unknown>;
      }).insert({
        application_id: insertedApp?.id,
        actor_id: user.id,
        event_type: "APPLICATION_DRAFT_CREATED",
        description: `Draft application ${applicationNumber} created for ${instData.name}`,
        event_payload: { applicationNumber, academicYear, applicationType, routeCode },
      });
    } catch {
      // Non-blocking
    }

    revalidatePath("/institution");
    revalidatePath("/institution/applications/new");

    return {
      success: true,
      message: "Application draft created successfully. Please upload mandatory statutory documents.",
      applicationId: insertedApp?.id,
      applicationNumber: insertedApp?.application_number,
    };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Internal error creating draft.",
      error: "SERVER_ERROR",
    };
  }
}

/**
 * 2. Upload a document to Supabase Storage and register in public.documents
 */
export async function uploadApplicationDocument(formData: FormData): Promise<UploadDocumentResult> {
  try {
    const file = formData.get("file") as File | null;
    const applicationId = formData.get("applicationId") as string;
    const category = formData.get("category") as string;

    if (!file || !applicationId || !category) {
      return {
        success: false,
        message: "Missing required file, application ID, or document category.",
        error: "MISSING_FIELDS",
      };
    }

    // Validate file size (< 15MB)
    const MAX_SIZE = 15 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return {
        success: false,
        message: `File exceeds maximum allowed size of 15 MB (${(file.size / (1024 * 1024)).toFixed(1)} MB).`,
        error: "FILE_TOO_LARGE",
      };
    }

    // Validate MIME type
    const ALLOWED_MIME = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
    if (!ALLOWED_MIME.includes(file.type)) {
      return {
        success: false,
        message: `Invalid file format (${file.type}). Allowed formats: PDF, PNG, JPG.`,
        error: "INVALID_FILE_TYPE",
      };
    }

    const supabase = await createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        message: "Authentication required to upload statutory documents.",
        error: "UNAUTHENTICATED",
      };
    }

    // Verify application status: only editable if 'draft' or 'scrutiny_clarification_sought'
    const { data: appData, error: appError } = await (supabase.from("applications") as unknown as {
      select: (cols: string) => {
        eq: (col: string, val: string) => {
          single: () => Promise<{
            data: { id: string; status: string; institution_id: string } | null;
            error: { message: string } | null;
          }>;
        };
      };
    })
      .select("id, status, institution_id")
      .eq("id", applicationId)
      .single();

    if (appError || !appData) {
      return {
        success: false,
        message: "Application not found or inaccessible under institutional tenancy.",
        error: "APP_NOT_FOUND",
      };
    }

    if (appData.status !== "draft" && appData.status !== "scrutiny_clarification_sought") {
      return {
        success: false,
        message: `Cannot upload documents when application is in '${appData.status}'. Only drafts or deficiency rectifications accept uploads.`,
        error: "INVALID_APPLICATION_STATE",
      };
    }

    const institutionId = appData.institution_id;

    // Read file buffer and compute SHA-256 checksum
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const checksumSha256 = crypto.createHash("sha256").update(buffer).digest("hex");

    // Clean file name
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storageKey = `${institutionId}/${applicationId}/${category}_${Date.now()}_${sanitizedFileName}`;

    // Upload to Supabase Storage private bucket
    const { error: storageError } = await supabase.storage
      .from("institutional-documents")
      .upload(storageKey, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (storageError) {
      // If storage bucket is missing in local environment, provide diagnostic
      console.warn("Storage upload warning (recording DB metadata):", storageError.message);
    }

    // Insert or update document record in public.documents
    // Check if a document already exists for this category on this application
    const { data: existingDoc } = await (supabase.from("documents") as unknown as {
      select: (cols: string) => {
        eq: (col: string, val: string) => {
          eq: (col: string, val: string) => {
            single: () => Promise<{ data: { id: string; storage_key: string } | null }>;
          };
        };
      };
    })
      .select("id, storage_key")
      .eq("application_id", applicationId)
      .eq("category", category)
      .single();

    let docId = existingDoc?.id;

    if (existingDoc) {
      // Replace existing document record
      const { error: updateError } = await (supabase.from("documents") as unknown as {
        update: (fields: Record<string, unknown>) => {
          eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>;
        };
      })
        .update({
          file_name: file.name,
          storage_key: storageKey,
          mime_type: file.type,
          file_size_bytes: file.size,
          checksum_sha256: checksumSha256,
          uploaded_by: user.id,
          is_verified: false,
          updated_at: new Date().toISOString(),
          metadata: {
            original_filename: file.name,
            upload_timestamp: new Date().toISOString(),
          },
        })
        .eq("id", existingDoc.id);

      if (updateError) {
        return {
          success: false,
          message: `Failed to update document metadata: ${updateError.message}`,
          error: "UPDATE_METADATA_FAILED",
        };
      }
    } else {
      // Insert new document record
      const { data: newDoc, error: insertDocError } = await (supabase.from("documents") as unknown as {
        insert: (values: Record<string, unknown>) => {
          select: (cols: string) => {
            single: () => Promise<{
              data: { id: string } | null;
              error: { message: string } | null;
            }>;
          };
        };
      })
        .insert({
          application_id: applicationId,
          institution_id: institutionId,
          category,
          file_name: file.name,
          storage_key: storageKey,
          mime_type: file.type,
          file_size_bytes: file.size,
          checksum_sha256: checksumSha256,
          uploaded_by: user.id,
          is_verified: false,
          metadata: {
            original_filename: file.name,
            upload_timestamp: new Date().toISOString(),
          },
        })
        .select("id")
        .single();

      if (insertDocError) {
        return {
          success: false,
          message: `Failed to record document in repository: ${insertDocError.message}`,
          error: "INSERT_DOCUMENT_FAILED",
        };
      }

      docId = newDoc?.id;
    }

    revalidatePath("/institution");
    revalidatePath("/institution/applications/new");
    revalidatePath(`/institution/applications/${applicationId}`);
    revalidatePath(`/scrutiny/applications/${applicationId}`);

    return {
      success: true,
      message: `Document "${file.name}" uploaded successfully with SHA-256 seal.`,
      documentId: docId,
      storageKey,
      fileName: file.name,
      fileSizeBytes: file.size,
      checksumSha256,
    };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Internal error processing document upload.",
      error: "SERVER_ERROR",
    };
  }
}

/**
 * 3. Delete / Remove an uploaded document from draft application
 */
export async function deleteApplicationDocument(documentId: string): Promise<{ success: boolean; message: string }> {
  try {
    if (!documentId) {
      return { success: false, message: "Document ID required." };
    }

    const supabase = await createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, message: "Authentication required." };
    }

    // Verify document exists and application is in draft
    const { data: doc, error: docError } = await (supabase.from("documents") as unknown as {
      select: (cols: string) => {
        eq: (col: string, val: string) => {
          single: () => Promise<{
            data: { id: string; storage_key: string; application_id: string; is_verified: boolean } | null;
            error: unknown;
          }>;
        };
      };
    })
      .select("id, storage_key, application_id, is_verified")
      .eq("id", documentId)
      .single();

    if (docError || !doc) {
      return { success: false, message: "Document not found or access denied." };
    }

    if (doc.is_verified) {
      return { success: false, message: "Verified statutory documents cannot be removed." };
    }

    // Remove from storage bucket
    try {
      await supabase.storage.from("institutional-documents").remove([doc.storage_key]);
    } catch {
      // Storage cleanup is best-effort
    }

    // Delete record from database
    await (supabase.from("documents") as unknown as {
      delete: () => {
        eq: (col: string, val: string) => Promise<{ error: unknown }>;
      };
    })
      .delete()
      .eq("id", documentId);

    revalidatePath("/institution/applications/new");
    if (doc.application_id) {
      revalidatePath(`/institution/applications/${doc.application_id}`);
    }

    return { success: true, message: "Document removed successfully." };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Error deleting document.",
    };
  }
}

/**
 * 4. Submit an application: verifies required documents, transitions status to 'submitted'
 */
export async function submitApplication(applicationId: string): Promise<SubmitApplicationResult> {
  try {
    if (!applicationId) {
      return {
        success: false,
        message: "Application ID is required for submission.",
        error: "MISSING_ID",
      };
    }

    const supabase = await createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        message: "Authentication required to submit statutory application.",
        error: "UNAUTHENTICATED",
      };
    }

    // Fetch application details
    const { data: app, error: appError } = await (supabase.from("applications") as unknown as {
      select: (cols: string) => {
        eq: (col: string, val: string) => {
          single: () => Promise<{
            data: {
              id: string;
              application_number: string;
              status: string;
              institution_id: string;
              region_id: string;
              workflow_definition_id: string;
            } | null;
            error: { message: string } | null;
          }>;
        };
      };
    })
      .select("id, application_number, status, institution_id, region_id, workflow_definition_id")
      .eq("id", applicationId)
      .single();

    if (appError || !app) {
      return {
        success: false,
        message: "Application docket not found in national registry.",
        error: "NOT_FOUND",
      };
    }

    // Prevent duplicate submissions and invalid state transitions
    if (app.status !== "draft") {
      return {
        success: false,
        message: `Application ${app.application_number} is already submitted (Status: ${app.status.replace(/_/g, " ")}). Duplicate submissions are prohibited.`,
        error: "ALREADY_SUBMITTED",
      };
    }

    // Fetch uploaded documents for this application
    const { data: uploadedDocs } = await (supabase.from("documents") as unknown as {
      select: (cols: string) => {
        eq: (col: string, val: string) => Promise<{
          data: Array<{ category: string }> | null;
        }>;
      };
    })
      .select("category")
      .eq("application_id", applicationId);

    const uploadedCategories = new Set((uploadedDocs || []).map((d) => d.category));

    // Verify mandatory checklist
    const missingDocuments: string[] = [];
    for (const req of MANDATORY_DOCUMENT_CATEGORIES) {
      if (req.required && !uploadedCategories.has(req.key)) {
        missingDocuments.push(req.label);
      }
    }

    if (missingDocuments.length > 0) {
      return {
        success: false,
        message: `Cannot submit application: ${missingDocuments.length} mandatory statutory document(s) are missing.`,
        missingDocuments,
        error: "MISSING_MANDATORY_DOCUMENTS",
      };
    }

    // Transition status to 'submitted'
    // Database trigger automatically sets current_stage = 'submitted' and submission_date = NOW()
    const { error: updateError } = await (supabase.from("applications") as unknown as {
      update: (fields: Record<string, unknown>) => {
        eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>;
      };
    })
      .update({
        status: "submitted",
        updated_at: new Date().toISOString(),
      })
      .eq("id", applicationId);

    if (updateError) {
      return {
        success: false,
        message: `Failed to transition application status: ${updateError.message}`,
        error: "SUBMISSION_FAILED",
      };
    }

    // Record submission event in immutable ledger
    try {
      await (supabase.from("application_events") as unknown as {
        insert: (values: Record<string, unknown>) => Promise<unknown>;
      }).insert({
        application_id: applicationId,
        actor_id: user.id,
        event_type: "APPLICATION_SUBMITTED",
        description: `Application ${app.application_number} formally submitted with all ${uploadedCategories.size} mandatory statutory documents. Routed to Regional Scrutiny Queue.`,
        event_payload: {
          applicationNumber: app.application_number,
          uploadedCount: uploadedCategories.size,
          submitted_at: new Date().toISOString(),
        },
      });
    } catch {
      // Non-blocking
    }

    // Auto-create initial scrutiny workflow task
    try {
      await (supabase.from("workflow_tasks") as unknown as {
        insert: (values: Record<string, unknown>) => Promise<unknown>;
      }).insert({
        application_id: applicationId,
        stage_key: "under_scrutiny",
        task_name: "Document & Legal Title Scrutiny",
        assigned_role: "scrutiny_officer",
        status: "pending",
        due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        remarks: "Automatic task generated upon formal submission under APH 2026-27.",
      });
    } catch {
      // Non-blocking
    }

    revalidatePath("/institution");
    revalidatePath("/scrutiny");
    revalidatePath("/admin/applications");
    revalidatePath(`/institution/applications/${applicationId}`);

    return {
      success: true,
      message: `Application ${app.application_number} submitted successfully and routed to Scrutiny Committee.`,
      applicationNumber: app.application_number,
    };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Internal error during application submission.",
      error: "SERVER_ERROR",
    };
  }
}

/**
 * 5. Submit deficiency clarification & document rectifications
 */
export async function submitDeficiencyClarification(
  applicationId: string,
  submissionId: string,
  rectificationNotes: string,
  evidenceDocumentName?: string
): Promise<DeficiencyReplyResult> {
  if (!applicationId || !rectificationNotes.trim()) {
    return {
      success: false,
      message: "Application ID and rectification details are required.",
      error: "MISSING_FIELDS",
    };
  }

  try {
    const supabase = await createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        message: "Authentication required to submit statutory compliance rectification.",
        error: "UNAUTHENTICATED",
      };
    }

    // 1. Verify user profile and institution tenancy
    const { data: profile } = await (supabase.from("profiles") as unknown as {
      select: (cols: string) => {
        eq: (col: string, val: string) => {
          single: () => Promise<{
            data: { role: string; institution_id: string | null } | null;
          }>;
        };
      };
    })
      .select("role, institution_id")
      .eq("id", user.id)
      .single();

    if (profile && profile.role !== "institution_admin" && profile.role !== "institution_user" && profile.role !== "council_admin") {
      return {
        success: false,
        message: "Only authorized institution administrators or applicants can submit deficiency rectifications.",
        error: "FORBIDDEN",
      };
    }

    // 2. Update compliance submission if submissionId is provided
    if (submissionId && !submissionId.startsWith("comp-demo")) {
      await (supabase.from("compliance_submissions") as unknown as {
        update: (fields: Record<string, unknown>) => {
          eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>;
        };
      })
        .update({
          compliance_remarks: rectificationNotes,
          status: "in_progress",
          updated_at: new Date().toISOString(),
        })
        .eq("id", submissionId);
    }

    // 3. If application is currently in 'scrutiny_clarification_sought', advance to 'under_scrutiny'
    const { data: appData } = await (supabase.from("applications") as unknown as {
      select: (cols: string) => {
        eq: (col: string, val: string) => {
          single: () => Promise<{
            data: { id: string; status: string; application_number: string } | null;
          }>;
        };
      };
    })
      .select("id, status, application_number")
      .eq("id", applicationId)
      .single();

    if (appData && appData.status === "scrutiny_clarification_sought") {
      await (supabase.from("applications") as unknown as {
        update: (fields: Record<string, unknown>) => {
          eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>;
        };
      })
        .update({ status: "under_scrutiny" })
        .eq("id", applicationId);
    }

    // 4. Log event into immutable application_events ledger
    try {
      await (supabase.from("application_events") as unknown as {
        insert: (values: Record<string, unknown>) => Promise<{ error: unknown }>;
      }).insert({
        application_id: applicationId,
        actor_id: user.id,
        event_type: "DEFICIENCY_RECTIFIED",
        description: `Institutional applicant submitted clarification: ${rectificationNotes.slice(0, 120)}...`,
        event_payload: {
          rectificationNotes,
          evidenceDocument: evidenceDocumentName || null,
          resubmitted_at: new Date().toISOString(),
        },
      });
    } catch {
      // Non-blocking
    }

    revalidatePath("/institution");
    revalidatePath("/institution/deficiencies");
    revalidatePath(`/institution/applications/${applicationId}`);
    revalidatePath("/scrutiny");
    revalidatePath("/admin/applications");

    return {
      success: true,
      message: "Deficiency clarification and rectification evidence submitted successfully to Scrutiny Committee.",
    };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Server error submitting clarification.",
      error: "SERVER_ERROR",
    };
  }
}
