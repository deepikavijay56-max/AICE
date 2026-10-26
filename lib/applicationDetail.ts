import { createServerClient } from "@/lib/supabase/server";
import { DEMO_DASHBOARD_DATA } from "@/components/admin/demoData";
import { EXPLAINABLE_ALERTS } from "@/components/admin/explainableAlerts";
import type { FullApplicationDetail, QueryApplicationEvent, QueryEvcVisit, QueryComplianceSubmission, QueryWorkflowTask, QueryUndertaking, QueryDocument } from "@/types/admin";

export interface FlightRecorderTimelineItem {
  id: string;
  source: "DATABASE_EVENT" | "APPLICATION_STATE" | "OPERATIONAL_WARNING" | "DEMO_SIMULATION";
  eventType: string;
  title: string;
  description: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  badgeColor: string;
  metadata?: Record<string, unknown>;
}

export interface DetailedApplicationResult {
  application: FullApplicationDetail;
  flightRecorder: FlightRecorderTimelineItem[];
  isDemo: boolean;
}

/**
 * Builds synthetic high-fidelity detail data when database has no row matching ID yet
 */
function getSyntheticDetail(id: string): DetailedApplicationResult {
  const baseDemo = DEMO_DASHBOARD_DATA.recentApplications.find((a) => a.id === id) ||
    DEMO_DASHBOARD_DATA.recentApplications[0];

  const app: FullApplicationDetail = {
    id: baseDemo.id,
    application_number: baseDemo.applicationNumber,
    academic_year: baseDemo.academicYear,
    application_type: baseDemo.programType,
    status: baseDemo.status,
    current_stage: baseDemo.currentStage,
    submission_date: baseDemo.submittedAt,
    target_decision_date: baseDemo.targetDecisionDate,
    metadata: {
      program: baseDemo.programType,
      intake_applied: 120,
      existing_intake: 60,
      shift: "First Shift",
      level: "Undergraduate / Post Graduate",
      nba_accredited: true,
      naac_grade: "A++",
    },
    created_at: baseDemo.submittedAt || "2026-09-01T08:00:00Z",
    updated_at: "2026-10-25T11:42:00Z",
    institution: {
      id: "inst-synthetic-1",
      name: baseDemo.institutionName,
      aicte_id: baseDemo.permanentInstituteId,
      legal_entity_type: "Registered Educational Trust / Society",
      state: "Maharashtra",
      city: "Mumbai",
      address_line1: "Vidyanagar, Vidyavihar East",
    },
    region: {
      id: "reg-synthetic-1",
      name: baseDemo.regionName,
      code: "WRO",
      regional_officer_name: "Shri Rajesh Deshmukh",
      office_address: "Industrial Assurance Building, Churchgate, Mumbai",
    },
    evc_visits: [
      {
        id: "evc-101",
        scheduled_start: "2026-10-18T10:00:00Z",
        status: "verified",
        findings_summary: "Physical infrastructure verified. 12 Laboratories, 1 Central Library, Fire Safety and Geotagged Classroom boundaries fully compliant with APH Appendix 4.",
        lead_expert: {
          full_name: "Prof. S. Ranganathan (IIT Bombay)",
        },
      },
    ],
    compliance_submissions: [
      {
        id: "comp-101",
        deficiency_notice_ref: "AICTE/WRO/DEF-0082/2026",
        compliance_remarks: "Submitted renewed Fire Safety Certificate issued by Municipal Corporation and updated faculty roster for Computer Science & Engineering.",
        status: "completed",
        review_comments: "Verified by Regional Officer. Deficiencies resolved.",
        reviewed_at: "2026-10-20T16:00:00Z",
        created_at: "2026-10-15T12:00:00Z",
        submitted_by_profile: {
          full_name: "Dr. Registrar (Institution Admin)",
        },
      },
    ],
    workflow_tasks: [
      {
        id: "task-101",
        stage_key: "scrutiny",
        task_name: "Document & Land Title Scrutiny",
        assigned_role: "scrutiny_officer",
        status: "completed",
        due_date: "2026-09-25T18:00:00Z",
        completed_at: "2026-09-22T14:30:00Z",
        remarks: "Clear title deed verified under Section 3 of Approval Process Handbook.",
        assigned_profile: { full_name: "Dr. Sunita Murthy" },
      },
      {
        id: "task-102",
        stage_key: "evc_inspection",
        task_name: "Surprise / Scheduled On-Site Expert Visit",
        assigned_role: "evc_expert",
        status: "completed",
        due_date: "2026-10-19T18:00:00Z",
        completed_at: "2026-10-18T17:15:00Z",
        remarks: "Geo-tagged photo audit completed. Compliant score: 94.5%",
        assigned_profile: { full_name: "Prof. S. Ranganathan" },
      },
      {
        id: "task-103",
        stage_key: "council_review",
        task_name: "Final Executive Council Approval Sanction",
        assigned_role: "council_admin",
        status: baseDemo.status === "approved" ? "completed" : "pending",
        due_date: baseDemo.targetDecisionDate,
        completed_at: baseDemo.status === "approved" ? "2026-10-24T14:10:00Z" : null,
        remarks: "Statutory order awaiting Member Secretary signature",
        assigned_profile: { full_name: "Council Secretariat Officer" },
      },
    ],
    undertakings: [
      {
        id: "und-1",
        undertaking_type: "anti_ragging_and_safety",
        title: "Statutory Undertaking on Anti-Ragging and Student Safety",
        clause_text: "I hereby solemnly declare that the institution adheres to all statutory norms promulgated by AICTE.",
        digital_signature_hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        signed_at: "2026-09-12T10:15:00Z",
        is_verified: true,
        signer_profile: { full_name: "Head of Institution / Director" },
      },
    ],
    documents: [
      {
        id: "doc-1",
        category: "building_plan",
        file_name: "Approved_Master_Building_Plan_2026.pdf",
        storage_key: `applications/${baseDemo.id}/building_plan.pdf`,
        mime_type: "application/pdf",
        file_size_bytes: 4280192,
        checksum_sha256: "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9",
        is_verified: true,
        verified_at: "2026-09-20T11:00:00Z",
        created_at: "2026-09-12T10:20:00Z",
      },
      {
        id: "doc-2",
        category: "fire_safety",
        file_name: "NOC_Fire_Department_Valid_2027.pdf",
        storage_key: `applications/${baseDemo.id}/fire_safety_noc.pdf`,
        mime_type: "application/pdf",
        file_size_bytes: 1845120,
        checksum_sha256: "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4",
        is_verified: true,
        verified_at: "2026-10-20T16:00:00Z",
        created_at: "2026-10-15T11:55:00Z",
      },
    ],
  };

  // Build Flight Recorder timeline
  const flightRecorder: FlightRecorderTimelineItem[] = [
    {
      id: "fr-state-current",
      source: "APPLICATION_STATE",
      eventType: "CURRENT_ACTIVE_STATE",
      title: `Current Stage: ${app.current_stage.toUpperCase().replace(/_/g, " ")}`,
      description: `Application is currently in status "${app.status.replace(/_/g, " ")}". Target decision SLA: ${app.target_decision_date ? new Date(app.target_decision_date).toLocaleDateString("en-IN") : "Pending"}`,
      timestamp: app.updated_at,
      actorName: "Regulatory State Engine",
      actorRole: "system",
      badgeColor: "bg-teal-500 text-white",
    },
    {
      id: "fr-ev-3",
      source: "DEMO_SIMULATION",
      eventType: "SCRUTINY_EVALUATION",
      title: "Scrutiny Completed & Cleared",
      description: "Sub-committee verified Land, Building, and Academic faculty requirements.",
      timestamp: "2026-09-22T14:30:00Z",
      actorName: "Dr. Sunita Murthy",
      actorRole: "scrutiny_officer",
      badgeColor: "bg-blue-500 text-white",
    },
    {
      id: "fr-ev-2",
      source: "DEMO_SIMULATION",
      eventType: "UNDER_SCRUTINY",
      title: "Application Assigned to Regional Scrutiny",
      description: "Regional office in Western Region initiated scrutiny checklist validation.",
      timestamp: "2026-09-15T11:00:00Z",
      actorName: "Shri Rajesh Deshmukh",
      actorRole: "regional_officer",
      badgeColor: "bg-amber-500 text-white",
    },
    {
      id: "fr-ev-1",
      source: "DEMO_SIMULATION",
      eventType: "SUBMITTED",
      title: "Statutory Application Formally Submitted",
      description: "Application submitted along with digital affirmation hash and requisite fees.",
      timestamp: app.submission_date || app.created_at,
      actorName: "Head of Institution",
      actorRole: "institution_admin",
      badgeColor: "bg-emerald-500 text-white",
    },
  ];

  // Check for any operational warning
  const alert = EXPLAINABLE_ALERTS.find((a) => a.applicationNumber === app.application_number);
  if (alert) {
    flightRecorder.unshift({
      id: `fr-warn-${alert.id}`,
      source: "OPERATIONAL_WARNING",
      eventType: "SLA_OPERATIONAL_ALERT",
      title: `Warning: ${alert.ruleName}`,
      description: `${alert.reason} Action Required: ${alert.actionRequired}`,
      timestamp: new Date().toISOString(),
      actorName: alert.responsibleOwner,
      actorRole: "compliance_monitor",
      badgeColor: "bg-rose-500 text-white",
    });
  }

  return {
    application: app,
    flightRecorder,
    isDemo: true,
  };
}

/**
 * Fetches an application and all authorized relational data from Supabase
 */
export async function getApplicationDetail(id: string): Promise<DetailedApplicationResult> {
  try {
    const supabase = await createServerClient();

    // 1. Fetch Application + Institution + Region
    const { data: rawApp, error: appError } = await (supabase.from("applications") as unknown as {
      select: (cols: string) => {
        eq: (col: string, val: string) => {
          single: () => Promise<{
            data: {
              id: string;
              application_number: string;
              academic_year: string;
              application_type: string;
              status: string;
              current_stage: string;
              submission_date: string | null;
              target_decision_date: string | null;
              metadata: Record<string, unknown>;
              created_at: string;
              updated_at: string;
              institution?: {
                id: string;
                name: string;
                aicte_id: string | null;
                legal_entity_type: string;
                state: string;
                city: string;
                address_line1: string | null;
              } | null;
              region?: {
                id: string;
                name: string;
                code: string;
                regional_officer_name?: string | null;
                office_address?: string | null;
              } | null;
            } | null;
            error: unknown;
          }>;
        };
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
        metadata,
        created_at,
        updated_at,
        institution:institutions (
          id,
          name,
          aicte_id,
          legal_entity_type,
          state,
          city,
          address_line1
        ),
        region:regions (
          id,
          name,
          code,
          regional_officer_name,
          office_address
        )
      `)
      .eq("id", id)
      .single();

    if (appError || !rawApp) {
      // Check if ID matches a demo row ID or demo applicationNumber
      return getSyntheticDetail(id);
    }

    // 2. Fetch Application Events (append-only ledger)
    const { data: eventsData } = await (supabase.from("application_events") as unknown as {
      select: (cols: string) => {
        eq: (col: string, val: string) => {
          order: (col: string, opts: { ascending: boolean }) => Promise<{
            data: QueryApplicationEvent[] | null;
            error: unknown;
          }>;
        };
      };
    })
      .select(`
        id,
        application_id,
        actor_id,
        event_type,
        from_status,
        to_status,
        description,
        created_at,
        actor:profiles (
          full_name,
          role
        )
      `)
      .eq("application_id", id)
      .order("created_at", { ascending: false });

    // 3. Fetch EVC Visits
    const { data: evcData } = await (supabase.from("evc_visits") as unknown as {
      select: (cols: string) => {
        eq: (col: string, val: string) => {
          order: (col: string, opts: { ascending: boolean }) => Promise<{
            data: QueryEvcVisit[] | null;
            error: unknown;
          }>;
        };
      };
    })
      .select(`
        id,
        scheduled_start,
        status,
        findings_summary,
        lead_expert:profiles (
          full_name
        )
      `)
      .eq("application_id", id)
      .order("scheduled_start", { ascending: false });

    // 4. Fetch Compliance Submissions
    const { data: complianceData } = await (supabase.from("compliance_submissions") as unknown as {
      select: (cols: string) => {
        eq: (col: string, val: string) => {
          order: (col: string, opts: { ascending: boolean }) => Promise<{
            data: QueryComplianceSubmission[] | null;
            error: unknown;
          }>;
        };
      };
    })
      .select(`
        id,
        deficiency_notice_ref,
        compliance_remarks,
        status,
        review_comments,
        reviewed_at,
        created_at,
        submitted_by_profile:profiles!submitted_by (
          full_name
        )
      `)
      .eq("application_id", id)
      .order("created_at", { ascending: false });

    // 5. Fetch Workflow Tasks
    const { data: tasksData } = await (supabase.from("workflow_tasks") as unknown as {
      select: (cols: string) => {
        eq: (col: string, val: string) => {
          order: (col: string, opts: { ascending: boolean }) => Promise<{
            data: QueryWorkflowTask[] | null;
            error: unknown;
          }>;
        };
      };
    })
      .select(`
        id,
        stage_key,
        task_name,
        assigned_role,
        status,
        due_date,
        completed_at,
        remarks,
        assigned_profile:profiles!assigned_to (
          full_name
        )
      `)
      .eq("application_id", id)
      .order("created_at", { ascending: true });

    // 6. Fetch Documents
    const { data: docsData } = await (supabase.from("documents") as unknown as {
      select: (cols: string) => {
        eq: (col: string, val: string) => {
          order: (col: string, opts: { ascending: boolean }) => Promise<{
            data: QueryDocument[] | null;
            error: unknown;
          }>;
        };
      };
    })
      .select(`
        id,
        category,
        file_name,
        storage_key,
        mime_type,
        file_size_bytes,
        checksum_sha256,
        is_verified,
        verified_at,
        created_at
      `)
      .eq("application_id", id)
      .order("created_at", { ascending: false });

    // 7. Fetch Undertakings
    const { data: undertakingsData } = await (supabase.from("undertakings") as unknown as {
      select: (cols: string) => {
        eq: (col: string, val: string) => {
          order: (col: string, opts: { ascending: boolean }) => Promise<{
            data: QueryUndertaking[] | null;
            error: unknown;
          }>;
        };
      };
    })
      .select(`
        id,
        undertaking_type,
        title,
        clause_text,
        digital_signature_hash,
        signed_at,
        is_verified,
        signer_profile:profiles!signed_by_profile_id (
          full_name
        )
      `)
      .eq("application_id", id)
      .order("signed_at", { ascending: false });

    const application: FullApplicationDetail = {
      ...rawApp,
      application_events: eventsData || [],
      evc_visits: evcData || [],
      compliance_submissions: complianceData || [],
      workflow_tasks: tasksData || [],
      documents: docsData || [],
      undertakings: undertakingsData || [],
    };

    // Synthesize Case Flight Recorder Items
    const flightRecorder: FlightRecorderTimelineItem[] = [];

    // Current State Anchor
    flightRecorder.push({
      id: `state-${application.id}`,
      source: "APPLICATION_STATE",
      eventType: "CURRENT_ACTIVE_STATE",
      title: `Current Stage: ${application.current_stage.toUpperCase().replace(/_/g, " ")}`,
      description: `Application is in status: "${application.status.replace(/_/g, " ")}". Target Decision SLA: ${application.target_decision_date ? new Date(application.target_decision_date).toLocaleDateString("en-IN") : "Not Set"}`,
      timestamp: application.updated_at,
      actorName: "PostgreSQL Regulatory Trigger",
      actorRole: "system",
      badgeColor: "bg-teal-600 text-white",
    });

    // Real Recorded Database Events from public.application_events
    if (eventsData && eventsData.length > 0) {
      eventsData.forEach((evt) => {
        flightRecorder.push({
          id: evt.id,
          source: "DATABASE_EVENT",
          eventType: evt.event_type,
          title: `Recorded Event: ${evt.event_type.replace(/_/g, " ")}`,
          description: evt.description,
          timestamp: evt.created_at,
          actorName: evt.actor?.full_name || "System Actor",
          actorRole: evt.actor?.role || "regulatory_agent",
          badgeColor: "bg-blue-600 text-white",
        });
      });
    }

    // Operational SLA Warning Check
    if (application.target_decision_date) {
      const now = new Date();
      const target = new Date(application.target_decision_date);
      const diffDays = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays <= 3 && !["approved", "rejected", "withdrawn"].includes(application.status)) {
        flightRecorder.push({
          id: `warn-${application.id}`,
          source: "OPERATIONAL_WARNING",
          eventType: "DEADLINE_PRESSURE_ALERT",
          title: diffDays < 0 ? "Statutory SLA Overdue" : "Urgent SLA Window (<= 3 Days)",
          description: diffDays < 0
            ? `Decision SLA breached by ${Math.abs(diffDays)} days under AICTE APH Turnaround Rules.`
            : `Statutory turnaround expires in ${diffDays} days. Prioritize committee sanction or clarification follow-up.`,
          timestamp: new Date().toISOString(),
          actorName: "SAKSHAM Compliance Engine",
          actorRole: "sla_monitor",
          badgeColor: diffDays < 0 ? "bg-rose-600 text-white" : "bg-amber-600 text-white",
        });
      }
    }

    // Sort all timeline items chronologically descending
    flightRecorder.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return {
      application,
      flightRecorder,
      isDemo: false,
    };
  } catch (err) {
    console.warn("getApplicationDetail error, falling back to synthetic detail", err);
    return getSyntheticDetail(id);
  }
}
