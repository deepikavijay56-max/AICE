import { createServerClient } from "@/lib/supabase/server";
import { DEMO_DASHBOARD_DATA, DEMO_ACTIVITY_FEED, type DashboardStats, type ActivityFeedItem } from "./demoData";
import type { ApplicationStatus } from "@/types/database";
import type { QueryApplication, QueryApplicationEvent, QueryAuditLog } from "@/types/admin";

export interface DashboardAuthContext {
  userId: string | null;
  role: string | null;
  isCouncilAdmin: boolean;
  isAuthorized: boolean;
}

/**
 * Server-side authorization verification helper for Council Admin operations.
 * Strictly verifies user authentication and council_admin role against the profiles table.
 */
export async function getCouncilAdminAuthContext(): Promise<DashboardAuthContext> {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        userId: null,
        role: null,
        isCouncilAdmin: false,
        isAuthorized: false,
      };
    }

    const { data: profile } = await (supabase.from("profiles") as unknown as {
      select: (cols: string) => {
        eq: (col: string, val: string) => {
          single: () => Promise<{
            data: { role?: string } | null;
            error: unknown;
          }>;
        };
      };
    })
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role || "authenticated";
    const isCouncilAdmin = role === "council_admin";

    return {
      userId: user.id,
      role,
      isCouncilAdmin,
      isAuthorized: isCouncilAdmin,
    };
  } catch (err) {
    console.warn("getCouncilAdminAuthContext error:", err);
    return {
      userId: null,
      role: null,
      isCouncilAdmin: false,
      isAuthorized: false,
    };
  }
}

export async function fetchAdminDashboardStats(): Promise<DashboardStats> {
  try {
    const supabase = await createServerClient();

    // 1. Fetch applications
    const { data: rawApps, error: appsError } = await (supabase.from("applications") as unknown as {
      select: (query: string) => {
        order: (col: string, opts: { ascending: boolean }) => Promise<{
          data: QueryApplication[] | null;
          error: unknown;
        }>;
      };
    })
      .select(`
        id,
        application_number,
        academic_year,
        application_type,
        status,
        current_stage,
        submission_date,
        target_decision_date,
        institution:institutions (
          name,
          aicte_id
        ),
        region:regions (
          name,
          code
        )
      `)
      .order("created_at", { ascending: false });

    // 2. Fetch live recent events from application_events or audit_logs
    let recentActivity: ActivityFeedItem[] = DEMO_ACTIVITY_FEED;

    try {
      const { data: rawEvents } = await (supabase.from("application_events") as unknown as {
        select: (query: string) => {
          order: (col: string, opts: { ascending: boolean }) => {
            limit: (n: number) => Promise<{
              data: QueryApplicationEvent[] | null;
              error: unknown;
            }>;
          };
        };
      })
        .select(`
          id,
          application_id,
          event_type,
          from_status,
          to_status,
          description,
          created_at,
          application:applications (
            application_number
          ),
          actor:profiles!application_events_actor_id_fkey (
            full_name,
            role
          )
        `)
        .order("created_at", { ascending: false })
        .limit(5);

      if (rawEvents && rawEvents.length > 0) {
        recentActivity = rawEvents.map((evt) => ({
          id: evt.id,
          applicationNumber: evt.application?.application_number || "Application",
          eventType: evt.event_type,
          description: evt.description,
          actorName: evt.actor?.full_name || "Authorized Officer",
          actorRole: evt.actor?.role || "officer",
          timestamp: evt.created_at,
          isSimulated: false,
        }));
      } else {
        // Fallback to audit_logs if application_events has no entries
        const { data: rawAudits } = await (supabase.from("audit_logs") as unknown as {
          select: (query: string) => {
            order: (col: string, opts: { ascending: boolean }) => {
              limit: (n: number) => Promise<{
                data: QueryAuditLog[] | null;
                error: unknown;
              }>;
            };
          };
        })
          .select(`
            id,
            table_name,
            operation,
            record_id,
            changed_by,
            created_at,
            changed_by_profile:profiles!audit_logs_changed_by_fkey (
              full_name,
              role
            )
          `)
          .order("created_at", { ascending: false })
          .limit(5);

        if (rawAudits && rawAudits.length > 0) {
          recentActivity = rawAudits.map((aud) => ({
            id: aud.id,
            applicationNumber: `Record #${aud.record_id.slice(0, 8)}`,
            eventType: `AUDIT_${aud.operation}`,
            description: `${aud.operation} operation recorded on '${aud.table_name}' table`,
            actorName: aud.changed_by_profile?.full_name || "System Operator",
            actorRole: aud.changed_by_profile?.role || "system",
            timestamp: aud.created_at,
            isSimulated: false,
          }));
        }
      }
    } catch (actErr) {
      console.warn("fetchAdminDashboardStats: falling back to demo activity feed", actErr);
    }

    if (appsError || !rawApps || rawApps.length === 0) {
      return {
        ...DEMO_DASHBOARD_DATA,
        recentActivity,
      };
    }

    const apps = rawApps;
    const totalApplications = apps.length;

    const pendingReviewStatuses: ApplicationStatus[] = [
      "submitted",
      "under_scrutiny",
      "scrutiny_clarification_sought",
      "sac_review",
    ];
    const pendingReview = apps.filter((a) =>
      pendingReviewStatuses.includes(a.status as ApplicationStatus)
    ).length;

    const evcVisitsScheduled = apps.filter((a) => a.status === "evc_scheduled").length;

    const decisionsPending = apps.filter(
      (a) => a.status === "council_decision_pending"
    ).length;

    const approvedApplications = apps.filter((a) => a.status === "approved").length;
    const rejectedApplications = apps.filter((a) => a.status === "rejected").length;

    const statusCounts: Record<string, number> = {};
    apps.forEach((a) => {
      statusCounts[a.status] = (statusCounts[a.status] || 0) + 1;
    });

    const statusPalette: Record<string, { label: string; color: string }> = {
      approved: { label: "Approved", color: "bg-emerald-500" },
      rejected: { label: "Rejected", color: "bg-rose-500" },
      council_decision_pending: { label: "Council Decision Pending", color: "bg-purple-500" },
      evc_scheduled: { label: "EVC Scheduled", color: "bg-cyan-500" },
      evc_completed: { label: "EVC Completed", color: "bg-teal-500" },
      sac_review: { label: "SAC Review", color: "bg-indigo-500" },
      scrutiny_cleared: { label: "Scrutiny Cleared", color: "bg-blue-500" },
      under_scrutiny: { label: "Under Scrutiny", color: "bg-yellow-500" },
      scrutiny_clarification_sought: { label: "Clarification Sought", color: "bg-amber-500" },
      submitted: { label: "Submitted", color: "bg-sky-500" },
      draft: { label: "Draft", color: "bg-slate-400" },
      withdrawn: { label: "Withdrawn", color: "bg-stone-400" },
    };

    const statusDistribution = Object.entries(statusCounts).map(([status, count]) => {
      const meta = statusPalette[status] || {
        label: status.replace(/_/g, " "),
        color: "bg-slate-400",
      };
      return {
        status,
        label: meta.label,
        count,
        percentage: Math.round((count / (totalApplications || 1)) * 100),
        colorClass: meta.color,
      };
    });

    const regionCounts: Record<string, { name: string; count: number }> = {};
    apps.forEach((a) => {
      const reg = a.region;
      const code = reg?.code || "UNASSIGNED";
      const name = reg?.name || "General Jurisdiction";
      if (!regionCounts[code]) {
        regionCounts[code] = { name, count: 0 };
      }
      regionCounts[code].count += 1;
    });

    const regionDistribution = Object.entries(regionCounts).map(([code, val]) => ({
      regionCode: code,
      regionName: val.name,
      applicationCount: val.count,
      institutionCount: val.count,
      percentage: Math.round((val.count / (totalApplications || 1)) * 100),
    }));

    const recentApplications = apps.slice(0, 10).map((a) => {
      const inst = a.institution;
      const reg = a.region;

      return {
        id: a.id,
        applicationNumber: a.application_number,
        institutionName: inst?.name || "Unknown Institution",
        permanentInstituteId: inst?.aicte_id || "N/A",
        regionName: reg?.name || "Central",
        programType: a.application_type || "Technical Education",
        academicYear: a.academic_year,
        status: a.status as ApplicationStatus,
        currentStage: a.current_stage || "scrutiny",
        submittedAt: a.submission_date,
        targetDecisionDate: a.target_decision_date,
      };
    });

    return {
      totalApplications,
      pendingReview,
      evcVisitsScheduled,
      decisionsPending,
      approvedApplications,
      rejectedApplications,
      isDemo: false,
      statusDistribution,
      regionDistribution: regionDistribution.length > 0 ? regionDistribution : DEMO_DASHBOARD_DATA.regionDistribution,
      recentApplications,
      recentActivity,
    };
  } catch (err) {
    console.warn("fetchAdminDashboardStats: falling back to demo data", err);
    return DEMO_DASHBOARD_DATA;
  }
}
