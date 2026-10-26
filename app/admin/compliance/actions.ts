"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";

export interface MutationResult {
  success: boolean;
  message: string;
  error?: string;
}

/**
 * Server action for an authorized regional or scrutiny officer to review compliance submissions
 */
export async function reviewComplianceSubmission(
  submissionId: string,
  decision: "completed" | "returned",
  comments: string
): Promise<MutationResult> {
  if (!submissionId || !decision) {
    return { success: false, message: "Missing required submission ID or decision" };
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
    return { success: false, message: "Missing undertaking ID" };
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

/**
 * Server action to transition EVC Visit status
 */
export async function updateEvcVisitStatus(
  visitId: string,
  newStatus: "in_progress" | "report_submitted" | "verified" | "cancelled",
  findingsSummary?: string,
  complianceScore?: number
): Promise<MutationResult> {
  if (!visitId || !newStatus) {
    return { success: false, message: "Missing required visit ID or status" };
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
        message: `EVC update rejected: ${updateError.message}`,
        error: updateError.message,
      };
    }

    revalidatePath("/admin/evc-visits");
    revalidatePath("/admin/compliance");
    return {
      success: true,
      message: `EVC visit status updated to ${newStatus.toUpperCase()}.`,
    };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Server error updating EVC visit",
      error: "SERVER_ERROR",
    };
  }
}
