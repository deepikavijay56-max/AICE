import { createServerClient } from "@/lib/supabase/server";
import { EXPLAINABLE_ALERTS } from "@/components/admin/explainableAlerts";
import type { QueryDeadlinePolicy } from "@/types/admin";

export interface ConfiguredWorkflowRoute {
  id: string;
  code: string;
  title: string;
  description: string;
  stageSequence: Array<{
    stageKey: string;
    stageName: string;
    roleRequired: string;
    turnaroundDays: number;
    warningThresholdDays: number;
  }>;
  isDefault?: boolean;
}

export interface LiveDeadlineRadarItem {
  id: string;
  applicationId: string;
  applicationNumber: string;
  institutionName: string;
  regionName: string;
  stageKey: string;
  stageName: string;
  stageStartTime: string;
  configuredDueDate: string;
  turnaroundDays: number;
  warningThresholdDays: number;
  daysRemainingOrOverdue: number;
  isOverdue: boolean;
  status: "DUE_NOW" | "UPCOMING" | "OVERDUE" | "ON_TRACK";
  severity: "low" | "medium" | "high" | "critical";
  responsibleOwner: string;
  responsibleRole: string;
  ruleName: string;
  reason: string;
  recommendedAction: string;
  isSimulated?: boolean;
  remindersPending?: number;
  escalationStatus?: "NONE" | "PENDING_REGIONAL_OFFICER" | "ESCALATED_COUNCIL_BUREAU";
}

export interface WorkflowRoutingAndRadarResult {
  routes: ConfiguredWorkflowRoute[];
  deadlineRadar: LiveDeadlineRadarItem[];
  stats: {
    totalMonitored: number;
    dueNowCount: number;
    upcomingCount: number;
    overdueCount: number;
  };
  isDemo: boolean;
}

/**
 * Standard statutory workflow routes under AICTE Approval Process Handbook (APH 2026-27).
 * Maps cleanly to workflow_definitions.stage_sequence.
 */
export const STATUTORY_WORKFLOW_ROUTES: ConfiguredWorkflowRoute[] = [
  {
    id: "route-scrutiny-only",
    code: "SCRUTINY_ONLY",
    title: "Route A: Scrutiny Only (Standard EoA)",
    description: "For standard Extension of Approval (EoA) without change in intake, course alteration, or land variation.",
    isDefault: true,
    stageSequence: [
      { stageKey: "submitted", stageName: "Application Formal Inception", roleRequired: "institution_admin", turnaroundDays: 3, warningThresholdDays: 1 },
      { stageKey: "under_scrutiny", stageName: "Document & Legal Title Scrutiny", roleRequired: "scrutiny_officer", turnaroundDays: 15, warningThresholdDays: 3 },
      { stageKey: "council_decision_pending", stageName: "Executive Council Endorsement", roleRequired: "council_admin", turnaroundDays: 10, warningThresholdDays: 2 },
    ],
  },
  {
    id: "route-scrutiny-evc",
    code: "SCRUTINY_EVC",
    title: "Route B: Scrutiny + EVC (Expansion / New Programs)",
    description: "Mandatory for institutes applying for Increase in Intake, New Technical Programs, or Division additions.",
    stageSequence: [
      { stageKey: "submitted", stageName: "Application Submission", roleRequired: "institution_admin", turnaroundDays: 3, warningThresholdDays: 1 },
      { stageKey: "under_scrutiny", stageName: "Scrutiny Verification", roleRequired: "scrutiny_officer", turnaroundDays: 15, warningThresholdDays: 3 },
      { stageKey: "evc_scheduled", stageName: "Expert Visiting Committee (EVC)", roleRequired: "evc_expert", turnaroundDays: 14, warningThresholdDays: 2 },
      { stageKey: "council_decision_pending", stageName: "Final Council Decision", roleRequired: "council_admin", turnaroundDays: 10, warningThresholdDays: 2 },
    ],
  },
  {
    id: "route-evc-sac",
    code: "EVC_SAC",
    title: "Route C: EVC + SAC (Appellate Appeal Track)",
    description: "Triggered when EVC inspection uncovers physical discrepancies requiring Standing Appellate Committee (SAC) hearing.",
    stageSequence: [
      { stageKey: "evc_scheduled", stageName: "EVC Surprise / Scheduled Audit", roleRequired: "evc_expert", turnaroundDays: 14, warningThresholdDays: 2 },
      { stageKey: "evc_completed", stageName: "Appraisal & Report Lodging", roleRequired: "regional_officer", turnaroundDays: 5, warningThresholdDays: 1 },
      { stageKey: "sac_review", stageName: "Standing Appellate Committee Hearing", roleRequired: "council_admin", turnaroundDays: 21, warningThresholdDays: 4 },
      { stageKey: "council_decision_pending", stageName: "Council Statutory Order", roleRequired: "council_admin", turnaroundDays: 10, warningThresholdDays: 2 },
    ],
  },
  {
    id: "route-only-evc",
    code: "ONLY_EVC",
    title: "Route D: Only EVC (Surprise Infrastructure Audit)",
    description: "Regulatory inspection directed by Council Bureau for complaint redressal or random quality benchmarking.",
    stageSequence: [
      { stageKey: "evc_scheduled", stageName: "Physical Inspection Dispatch", roleRequired: "evc_expert", turnaroundDays: 7, warningThresholdDays: 2 },
      { stageKey: "council_decision_pending", stageName: "Inspection Report Determination", roleRequired: "council_admin", turnaroundDays: 10, warningThresholdDays: 2 },
    ],
  },
];

/**
 * Derives live Radar items from Explainable Alerts and database records
 */
function getSyntheticRadar(): LiveDeadlineRadarItem[] {
  return EXPLAINABLE_ALERTS.map((alert) => {
    const isOverdue = alert.daysRemainingOrOverdue < 0;
    const isDueNow = alert.daysRemainingOrOverdue >= 0 && alert.daysRemainingOrOverdue <= 2;
    const isUpcoming = alert.daysRemainingOrOverdue > 2 && alert.daysRemainingOrOverdue <= 7;

    const status: LiveDeadlineRadarItem["status"] = isOverdue
      ? "OVERDUE"
      : isDueNow
      ? "DUE_NOW"
      : isUpcoming
      ? "UPCOMING"
      : "ON_TRACK";

    let escalation: LiveDeadlineRadarItem["escalationStatus"] = "NONE";
    if (alert.severity === "critical" || alert.daysRemainingOrOverdue < -3) {
      escalation = "ESCALATED_COUNCIL_BUREAU";
    } else if (isOverdue) {
      escalation = "PENDING_REGIONAL_OFFICER";
    }

    return {
      id: `radar-${alert.id}`,
      applicationId: alert.id.replace("alt", "app"),
      applicationNumber: alert.applicationNumber,
      institutionName: alert.institutionName,
      regionName: alert.region,
      stageKey: alert.id === "alt-4" ? "under_scrutiny" : alert.id === "alt-2" ? "evc_scheduled" : "council_decision_pending",
      stageName: alert.id === "alt-4" ? "Regional Scrutiny" : alert.id === "alt-2" ? "EVC Inspection" : "Council Decision Review",
      stageStartTime: "2026-09-15T10:00:00Z",
      configuredDueDate: alert.deadlineDate,
      turnaroundDays: alert.id === "alt-4" ? 15 : alert.id === "alt-2" ? 14 : 10,
      warningThresholdDays: 3,
      daysRemainingOrOverdue: alert.daysRemainingOrOverdue,
      isOverdue: alert.isOverdue,
      status,
      severity: alert.severity,
      responsibleOwner: alert.responsibleOwner,
      responsibleRole: alert.severity === "critical" ? "council_admin" : "regional_officer",
      ruleName: alert.ruleName,
      reason: alert.reason,
      recommendedAction: alert.actionRequired,
      isSimulated: true,
      remindersPending: isOverdue ? 2 : 1,
      escalationStatus: escalation,
    };
  });
}

/**
 * Evaluates live application records against active deadline_policies in Supabase
 */
export async function getWorkflowRoutingAndRadar(): Promise<WorkflowRoutingAndRadarResult> {
  let routes = STATUTORY_WORKFLOW_ROUTES;

  try {
    const supabase = await createServerClient();

    // 1. Fetch workflow definitions if configured
    const { data: dbDefinitions } = await (supabase.from("workflow_definitions") as unknown as {
      select: (cols: string) => Promise<{
        data: Array<{
          id: string;
          code: string;
          title: string;
          description: string | null;
          stage_sequence: Array<{
            stageKey: string;
            stageName: string;
            roleRequired: string;
            turnaroundDays: number;
            warningThresholdDays: number;
          }>;
        }> | null;
        error: unknown;
      }>;
    }).select("id, code, title, description, stage_sequence");

    if (dbDefinitions && dbDefinitions.length > 0) {
      routes = dbDefinitions.map((d) => ({
        id: d.id,
        code: d.code,
        title: d.title,
        description: d.description || "",
        stageSequence: Array.isArray(d.stage_sequence) && d.stage_sequence.length > 0
          ? d.stage_sequence
          : STATUTORY_WORKFLOW_ROUTES[0].stageSequence,
      }));
    }

    // 2. Fetch deadline policies
    const { data: dbPolicies } = await (supabase.from("deadline_policies") as unknown as {
      select: (cols: string) => Promise<{
        data: QueryDeadlinePolicy[] | null;
        error: unknown;
      }>;
    }).select("id, stage_key, turnaround_days, warning_threshold_days, auto_escalation_enabled");

    const policyMap = new Map<string, QueryDeadlinePolicy>();
    if (dbPolicies) {
      dbPolicies.forEach((p) => policyMap.set(p.stage_key, p));
    }

    // 3. Query active non-terminal applications
    const { data: rawApps } = await (supabase.from("applications") as unknown as {
      select: (cols: string) => {
        not: (col: string, op: string, val: string[]) => {
          order: (col: string, opts: { ascending: boolean }) => Promise<{
            data: Array<{
              id: string;
              application_number: string;
              current_stage: string;
              status: string;
              submission_date: string | null;
              target_decision_date: string | null;
              created_at: string;
              institution?: { name: string } | null;
              region?: { name: string } | null;
            }> | null;
            error: unknown;
          }>;
        };
      };
    })
      .select(`
        id,
        application_number,
        current_stage,
        status,
        submission_date,
        target_decision_date,
        created_at,
        institution:institutions (name),
        region:regions (name)
      `)
      .not("status", "in", ["approved", "rejected", "withdrawn"])
      .order("created_at", { ascending: false });

    if (rawApps && rawApps.length > 0) {
      const now = new Date();

      const radarItems: LiveDeadlineRadarItem[] = rawApps.map((app) => {
        const stagePolicy = policyMap.get(app.current_stage) || {
          id: "default",
          stage_key: app.current_stage,
          turnaround_days: 15,
          warning_threshold_days: 3,
          auto_escalation_enabled: true,
        };

        const stageStart = app.submission_date || app.created_at;
        const targetDate = app.target_decision_date
          ? new Date(app.target_decision_date)
          : new Date(new Date(stageStart).getTime() + stagePolicy.turnaround_days * 24 * 60 * 60 * 1000);

        const diffMs = targetDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        const isOverdue = diffDays < 0;

        let status: LiveDeadlineRadarItem["status"] = "ON_TRACK";
        let severity: LiveDeadlineRadarItem["severity"] = "low";

        if (diffDays < -3) {
          status = "OVERDUE";
          severity = "critical";
        } else if (diffDays <= 0) {
          status = "OVERDUE";
          severity = "high";
        } else if (diffDays <= stagePolicy.warning_threshold_days) {
          status = "DUE_NOW";
          severity = "high";
        } else if (diffDays <= 7) {
          status = "UPCOMING";
          severity = "medium";
        }

        const isCouncilStage = ["council_decision_pending", "sac_review"].includes(app.status);
        const responsibleOwner = isCouncilStage
          ? "Approval Bureau / Council Secretary"
          : `${app.region?.name || "Regional"} Scrutiny Officer`;

        const responsibleRole = isCouncilStage ? "council_admin" : "regional_officer";

        return {
          id: `radar-db-${app.id}`,
          applicationId: app.id,
          applicationNumber: app.application_number,
          institutionName: app.institution?.name || "Registered Institute",
          regionName: app.region?.name || "Central Jurisdiction",
          stageKey: app.current_stage,
          stageName: app.current_stage.replace(/_/g, " ").toUpperCase(),
          stageStartTime: stageStart,
          configuredDueDate: targetDate.toISOString(),
          turnaroundDays: stagePolicy.turnaround_days,
          warningThresholdDays: stagePolicy.warning_threshold_days,
          daysRemainingOrOverdue: diffDays,
          isOverdue,
          status,
          severity,
          responsibleOwner,
          responsibleRole,
          ruleName: `APH Rule (${stagePolicy.stage_key}) — ${stagePolicy.turnaround_days}d Turnaround`,
          reason: isOverdue
            ? `Turnaround breached by ${Math.abs(diffDays)} days in stage "${app.current_stage.replace(/_/g, " ")}".`
            : `Statutory deadline expires in ${diffDays} days.`,
          recommendedAction: isCouncilStage
            ? "Convene Approval Bureau executive determination and execute digital signature"
            : "Complete document review or dispatch deficiency notice",
          isSimulated: false,
          remindersPending: isOverdue ? 1 : 0,
          escalationStatus: isOverdue ? "PENDING_REGIONAL_OFFICER" : "NONE",
        };
      });

      // Sort with critical/overdue first
      radarItems.sort((a, b) => a.daysRemainingOrOverdue - b.daysRemainingOrOverdue);

      return {
        routes,
        deadlineRadar: radarItems,
        stats: {
          totalMonitored: radarItems.length,
          dueNowCount: radarItems.filter((r) => r.status === "DUE_NOW").length,
          upcomingCount: radarItems.filter((r) => r.status === "UPCOMING").length,
          overdueCount: radarItems.filter((r) => r.status === "OVERDUE").length,
        },
        isDemo: false,
      };
    }
  } catch (err) {
    console.warn("getWorkflowRoutingAndRadar: fallback to synthetic radar", err);
  }

  const syntheticRadar = getSyntheticRadar();
  return {
    routes,
    deadlineRadar: syntheticRadar,
    stats: {
      totalMonitored: syntheticRadar.length,
      dueNowCount: syntheticRadar.filter((r) => r.status === "DUE_NOW").length,
      upcomingCount: syntheticRadar.filter((r) => r.status === "UPCOMING").length,
      overdueCount: syntheticRadar.filter((r) => r.status === "OVERDUE").length,
    },
    isDemo: true,
  };
}
