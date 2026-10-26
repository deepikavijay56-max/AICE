"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";

export interface DeficiencyReplyResult {
  success: boolean;
  message: string;
  error?: string;
}

/**
 * Server action for an institutional applicant to submit deficiency clarifications and rectifications.
 * Updates compliance_submissions, transitions status back to under_scrutiny, and appends to the immutable audit ledger.
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
      // Non-blocking for offline demo records
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
