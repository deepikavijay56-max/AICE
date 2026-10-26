"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";

export interface MutationResult {
  success: boolean;
  message: string;
  error?: string;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Server action for an authorized regional or scrutiny officer to review compliance submissions
 */
export async function reviewComplianceSubmission(
  submissionId: string,
  decision: "completed" | "returned",
  comments: string
): Promise<MutationResult> {
  if (!submissionId || !decision) {
    return { success: false, message: "Missing required submission ID or decision", error: "INVALID_INPUT" };
  }

  // Gracefully handle synthetic demo/sample submission IDs
  if (!UUID_REGEX.test(submissionId)) {
    return {
      success: true,
      message: `[Demonstration Mode] Compliance submission ${submissionId} marked as ${decision.toUpperCase()}. In production mode, this records the verified determination in the statutory registry.`,
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
        message: "Authentication required to review statutory compliance.",
        error: "UNAUTHENTICATED",
      };
    }

    // Check if the record actually exists in compliance_submissions
    const { data: existingRecord, error: fetchError } = await (supabase.from("compliance_submissions") as unknown as {
      select: (cols: string) => {
        eq: (col: string, val: string) => {
          single: () => Promise<{
            data: { id: string; status: string; application_id: string } | null;
            error: { message: string } | null;
          }>;
        };
      };
    })
      .select("id, status, application_id")
      .eq("id", submissionId)
      .single();

    if (fetchError || !existingRecord) {
      return {
        success: false,
        message: `Compliance submission record "${submissionId}" was not found in the database.`,
        error: "RECORD_NOT_FOUND",
      };
    }

    // Update compliance submission (protected by RLS and database triggers)
    const { error: updateError } = await (supabase.from("compliance_submissions") as unknown as {
      update: (fields: Record<string, unknown>) => {
        eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>;
      };
    })
      .update({
        status: decision,
        review_comments: comments || "Compliance verified against deficiency notice.",
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", submissionId);

    if (updateError) {
      return {
        success: false,
        message: `Database rejected review: ${updateError.message}`,
        error: updateError.message,
      };
    }

    revalidatePath("/admin/compliance");
    revalidatePath("/admin/applications");
    revalidatePath("/admin/workflows");

    return {
      success: true,
      message: `Compliance submission ${submissionId} marked as ${decision.toUpperCase()}.`,
    };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Server error reviewing compliance",
      error: "SERVER_ERROR",
    };
  }
}

/**
 * Server action for verifying digital undertakings
 */
export async function verifyUndertaking(undertakingId: string): Promise<MutationResult> {
  if (!undertakingId) {
    return { success: false, message: "Missing undertaking ID", error: "INVALID_INPUT" };
  }

  // Gracefully handle synthetic demo/sample undertaking IDs
  if (!UUID_REGEX.test(undertakingId)) {
    return {
      success: true,
      message: `[Demonstration Mode] Statutory undertaking ${undertakingId} digitally verified and recorded.`,
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
        message: "Authentication required to verify undertaking affirmations.",
        error: "UNAUTHENTICATED",
      };
    }

    const { error: updateError } = await (supabase.from("undertakings") as unknown as {
      update: (fields: Record<string, unknown>) => {
        eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>;
      };
    })
      .update({
        is_verified: true,
        verified_by: user.id,
        verified_at: new Date().toISOString(),
      })
      .eq("id", undertakingId);

    if (updateError) {
      return {
        success: false,
        message: `Verification rejected: ${updateError.message}`,
        error: updateError.message,
      };
    }

    revalidatePath("/admin/compliance");
    return {
      success: true,
      message: `Statutory undertaking ${undertakingId} digitally verified and recorded.`,
    };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Server error",
      error: "SERVER_ERROR",
    };
  }
}

export interface EvcMutationResult extends MutationResult {
  nextStage?: string;
  nextResponsibleRole?: string;
  applicationNumber?: string;
  routeCode?: string;
}

/**
 * Server action to transition EVC Visit status, persist report findings and compliance score,
 * record audit trail, and determine the application's next stage strictly per its configured statutory route.
 */
export async function updateEvcVisitStatus(
  visitId: string,
  newStatus: "in_progress" | "report_submitted" | "verified" | "cancelled",
  findingsSummary?: string,
  complianceScore?: number
): Promise<EvcMutationResult> {
  if (!visitId || !newStatus) {
    return { success: false, message: "Missing required visit ID or status", error: "INVALID_INPUT" };
  }

  // Gracefully handle synthetic demo/sample visit IDs
  if (!UUID_REGEX.test(visitId)) {
    let demoNextStage = "Regional Officer Appraisal Review";
    let demoNextRole = "regional_officer";
    if (newStatus === "verified") {
      demoNextStage = "Standing Appellate Committee (SAC) or Executive Council";
      demoNextRole = "council_admin";
    }

    return {
      success: true,
      message: `[Demonstration Mode] EVC inspection status updated to "${newStatus.replace(/_/g, " ").toUpperCase()}". Next Queue: ${demoNextStage} (${demoNextRole}).`,
      nextStage: demoNextStage,
      nextResponsibleRole: demoNextRole,
      routeCode: "SCRUTINY_EVC",
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
        message: "Authentication required to update EVC inspection status.",
        error: "UNAUTHENTICATED",
      };
    }

    // 1. Fetch user profile
    const { data: profile } = await (supabase.from("profiles") as unknown as {
      select: (cols: string) => {
        eq: (col: string, val: string) => {
          single: () => Promise<{
            data: { id: string; role: string; full_name: string } | null;
          }>;
        };
      };
    })
      .select("id, role, full_name")
      .eq("id", user.id)
      .single();

    // 2. Fetch existing EVC Visit and associated Application
    const { data: visitRecord, error: visitFetchError } = await (supabase.from("evc_visits") as unknown as {
      select: (cols: string) => {
        eq: (col: string, val: string) => {
          single: () => Promise<{
            data: {
              id: string;
              application_id: string;
              status: string;
              application?: {
                id: string;
                application_number: string;
                status: string;
                current_stage: string;
                workflow_definition_id: string;
                metadata: Record<string, unknown>;
                workflow_definition?: {
                  code: string;
                  title: string;
                  stage_sequence: Array<{ stageKey: string; roleRequired: string; stageName: string }>;
                } | null;
              } | null;
            } | null;
            error: { message: string } | null;
          }>;
        };
      };
    })
      .select(`
        id,
        application_id,
        status,
        application:applications (
          id,
          application_number,
          status,
          current_stage,
          workflow_definition_id,
          metadata,
          workflow_definition:workflow_definitions (
            code,
            title,
            stage_sequence
          )
        )
      `)
      .eq("id", visitId)
      .single();

    if (visitFetchError || !visitRecord) {
      return {
        success: false,
        message: "EVC Visit record not found in national registry.",
        error: "NOT_FOUND",
      };
    }

    // 3. Update EVC visit record in public.evc_visits
    const updatePayload: Record<string, unknown> = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    };

    if (findingsSummary) {
      updatePayload.findings_summary = findingsSummary;
    }
    if (complianceScore !== undefined) {
      updatePayload.compliance_score = complianceScore;
    }

    const { error: updateError } = await (supabase.from("evc_visits") as unknown as {
      update: (fields: Record<string, unknown>) => {
        eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>;
      };
    })
      .update(updatePayload)
      .eq("id", visitId);

    if (updateError) {
      return {
        success: false,
        message: `Database rejected EVC update: ${updateError.message}`,
        error: updateError.message,
      };
    }

    const app = visitRecord.application;
    let nextStage = "In Progress";
    let nextResponsibleRole = "evc_expert";
    const routeCode =
      (app?.metadata?.statutory_route_code as string) ||
      app?.workflow_definition?.code ||
      "SCRUTINY_EVC";

    // 4. Progress Application State based on Configured Route when Report is Submitted or Verified
    if (app && (newStatus === "report_submitted" || newStatus === "verified")) {
      // Determine next status per configured route:
      // Route C (EVC_SAC): requires Standing Appellate Committee (SAC) review -> 'sac_review'
      // Route B (SCRUTINY_EVC) & Route D (ONLY_EVC): EVC complete -> moves to regional appraisal then 'council_decision_pending'
      let targetAppStatus: "evc_completed" | "sac_review" | "council_decision_pending" = "evc_completed";

      if (newStatus === "report_submitted") {
        targetAppStatus = "evc_completed";
        nextStage = "Regional Officer Inspection Appraisal";
        nextResponsibleRole = "regional_officer";
      } else if (newStatus === "verified") {
        if (routeCode === "EVC_SAC" || (complianceScore !== undefined && complianceScore < 70)) {
          targetAppStatus = "sac_review";
          nextStage = "Standing Appellate Committee (SAC) Hearing";
          nextResponsibleRole = "council_admin";
        } else {
          targetAppStatus = "council_decision_pending";
          nextStage = "Executive Council Statutory Determination";
          nextResponsibleRole = "council_admin";
        }
      }

      // Update application status
      await (supabase.from("applications") as unknown as {
        update: (fields: Record<string, unknown>) => {
          eq: (col: string, val: string) => Promise<{ error: unknown }>;
        };
      })
        .update({
          status: targetAppStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", app.id);

      // 5. Create immutable audit ledger event in application_events
      try {
        await (supabase.from("application_events") as unknown as {
          insert: (values: Record<string, unknown>) => Promise<unknown>;
        }).insert({
          application_id: app.id,
          actor_id: user.id,
          event_type: newStatus === "report_submitted" ? "EVC_REPORT_LODGED" : "EVC_REPORT_VERIFIED",
          description: `EVC Inspection Report submitted by ${profile?.full_name || "Lead Expert"} with compliance score ${complianceScore ?? "N/A"}%. Progressed along Route [${routeCode}] to next milestone: ${nextStage}.`,
          event_payload: {
            visitId,
            status: newStatus,
            complianceScore,
            findingsSummary: findingsSummary ? findingsSummary.slice(0, 200) : null,
            routeCode,
            nextStage,
            nextResponsibleRole,
            actorRole: profile?.role || "evc_expert",
            timestamp: new Date().toISOString(),
          },
        });
      } catch {
        // Non-blocking
      }
    }

    revalidatePath("/admin/evc-visits");
    revalidatePath("/admin/compliance");
    revalidatePath("/expert");
    revalidatePath("/expert/reports");
    revalidatePath("/regional");
    revalidatePath("/regional/evc");
    if (app?.id) {
      revalidatePath(`/admin/applications/${app.id}`);
      revalidatePath(`/institution/applications/${app.id}`);
    }

    return {
      success: true,
      message: `EVC report saved to repository. Inspection status: "${newStatus.replace(/_/g, " ").toUpperCase()}". Next Stage: ${nextStage} (${nextResponsibleRole}).`,
      nextStage,
      nextResponsibleRole,
      applicationNumber: app?.application_number,
      routeCode,
    };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Server error updating EVC visit",
      error: "SERVER_ERROR",
    };
  }
}
