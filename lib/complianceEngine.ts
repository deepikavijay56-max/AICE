import { createServerClient } from "@/lib/supabase/server";

export interface ComplianceCentreItem {
  id: string;
  applicationId: string;
  applicationNumber: string;
  institutionId: string;
  institutionName: string;
  permanentInstituteId: string;
  regionName: string;
  deficiencyRef: string;
  complianceRemarks: string;
  submissionDate: string;
  status: "pending" | "in_progress" | "completed" | "returned" | "escalated" | "cancelled";
  reviewerName: string | null;
  reviewerRole: string | null;
  reviewedAt: string | null;
  reviewComments: string | null;
  evidenceDocsCount: number;
  undertakingsCount: number;
  isOverdue: boolean;
  dueDate: string;
  isSimulated?: boolean;
}

export interface EvcManagementItem {
  id: string;
  applicationId: string;
  applicationNumber: string;
  institutionName: string;
  permanentInstituteId: string;
  regionName: string;
  leadExpertName: string;
  leadExpertEmail: string | null;
  scheduledStart: string;
  scheduledEnd: string;
  status: "scheduled" | "in_progress" | "report_submitted" | "verified" | "cancelled";
  findingsSummary: string | null;
  complianceScore: number | null;
  reportStorageKey: string | null;
  committeeMembersCount: number;
  isOverdue: boolean;
  isSimulated?: boolean;
}

export interface UndertakingItem {
  id: string;
  applicationId: string;
  applicationNumber: string;
  institutionName: string;
  title: string;
  undertakingType: string;
  clauseExcerpt: string;
  digitalSignatureHash: string;
  signedBy: string;
  signedAt: string;
  isVerified: boolean;
  verifiedBy: string | null;
  verifiedAt: string | null;
  isSimulated?: boolean;
}

export interface ComplianceDashboardData {
  complianceItems: ComplianceCentreItem[];
  evcItems: EvcManagementItem[];
  undertakings: UndertakingItem[];
  stats: {
    pendingReviews: number;
    completedCompliance: number;
    scheduledEvc: number;
    evcReportsPendingReview: number;
    verifiedUndertakings: number;
    overdueComplianceItems: number;
  };
  isDemo: boolean;
}

const DEMO_COMPLIANCE_ITEMS: ComplianceCentreItem[] = [
  {
    id: "comp-1",
    applicationId: "app-105",
    applicationNumber: "AICTE-2026-ARCH-00007",
    institutionId: "inst-5",
    institutionName: "Jadavpur University School of Architecture",
    permanentInstituteId: "1-9988771",
    regionName: "Eastern Region",
    deficiencyRef: "AICTE/ERO/DEF-0082/2026",
    complianceRemarks: "Submitted renewed Fire Safety NOC issued by West Bengal Fire & Emergency Services valid till AY 2027.",
    submissionDate: "2026-10-15T11:55:00Z",
    status: "pending",
    reviewerName: "Dr. Sunita Murthy",
    reviewerRole: "scrutiny_officer",
    reviewedAt: null,
    reviewComments: null,
    evidenceDocsCount: 2,
    undertakingsCount: 1,
    isOverdue: false,
    dueDate: "2026-11-08T00:00:00Z",
    isSimulated: true,
  },
  {
    id: "comp-2",
    applicationId: "app-101",
    applicationNumber: "AICTE-2026-ENGG-00124",
    institutionId: "inst-1",
    institutionName: "K.J. Somaiya College of Engineering",
    permanentInstituteId: "1-4251781",
    regionName: "Western Region",
    deficiencyRef: "AICTE/WRO/DEF-0014/2026",
    complianceRemarks: "Rectified faculty roster disparity by appointing 4 Adjunct Professors in Computer Engineering per Cadre Ratio.",
    submissionDate: "2026-10-12T14:30:00Z",
    status: "completed",
    reviewerName: "Shri Rajesh Deshmukh",
    reviewerRole: "regional_officer",
    reviewedAt: "2026-10-20T16:00:00Z",
    reviewComments: "Cadre ratio compliance verified. Formally endorsed for Council Sanction.",
    evidenceDocsCount: 4,
    undertakingsCount: 2,
    isOverdue: false,
    dueDate: "2026-10-25T00:00:00Z",
    isSimulated: true,
  },
  {
    id: "comp-3",
    applicationId: "app-104",
    applicationNumber: "AICTE-2026-MCA-00019",
    institutionId: "inst-4",
    institutionName: "Harcourt Butler Technical University",
    permanentInstituteId: "1-3344556",
    regionName: "Northern Region",
    deficiencyRef: "AICTE/NRO/DEF-0041/2026",
    complianceRemarks: "Clarification sought on Central Computer Center carpet area deficiency (Shortfall of 85 sq.m).",
    submissionDate: "2026-10-05T09:15:00Z",
    status: "pending",
    reviewerName: "Regional Scrutiny Officer (NRO)",
    reviewerRole: "scrutiny_officer",
    reviewedAt: null,
    reviewComments: null,
    evidenceDocsCount: 1,
    undertakingsCount: 1,
    isOverdue: true,
    dueDate: "2026-10-24T00:00:00Z",
    isSimulated: true,
  },
];

const DEMO_EVC_ITEMS: EvcManagementItem[] = [
  {
    id: "evc-1",
    applicationId: "app-102",
    applicationNumber: "AICTE-2026-MGMT-00088",
    institutionName: "T.A. Pai Management Institute",
    permanentInstituteId: "1-1289456",
    regionName: "South-Western Region",
    leadExpertName: "Prof. S. Ranganathan",
    leadExpertEmail: "ranganathan@iimb.ac.in",
    scheduledStart: "2026-11-04T10:00:00Z",
    scheduledEnd: "2026-11-04T17:00:00Z",
    status: "scheduled",
    findingsSummary: null,
    complianceScore: null,
    reportStorageKey: null,
    committeeMembersCount: 3,
    isOverdue: false,
    isSimulated: true,
  },
  {
    id: "evc-2",
    applicationId: "app-101",
    applicationNumber: "AICTE-2026-ENGG-00124",
    institutionName: "K.J. Somaiya College of Engineering",
    permanentInstituteId: "1-4251781",
    regionName: "Western Region",
    leadExpertName: "Dr. A. Verma",
    leadExpertEmail: "averma@iitb.ac.in",
    scheduledStart: "2026-10-18T10:00:00Z",
    scheduledEnd: "2026-10-18T18:00:00Z",
    status: "report_submitted",
    findingsSummary: "Physical infrastructure verified. 12 Laboratories, 1 Central Library, Geotagged classroom boundaries verified. Recommended for 120 intake extension.",
    complianceScore: 94.5,
    reportStorageKey: "evc_reports/evc-2-report.pdf",
    committeeMembersCount: 3,
    isOverdue: false,
    isSimulated: true,
  },
  {
    id: "evc-3",
    applicationId: "app-103",
    applicationNumber: "AICTE-2026-PHAR-00042",
    institutionName: "PSG College of Pharmacy",
    permanentInstituteId: "1-7893214",
    regionName: "Southern Region",
    leadExpertName: "Prof. M. Kalyani",
    leadExpertEmail: "kalyani@mmc.edu.in",
    scheduledStart: "2026-10-15T09:30:00Z",
    scheduledEnd: "2026-10-15T16:30:00Z",
    status: "verified",
    findingsSummary: "Compliant with Pharmacy Council & AICTE joint safety guidelines. Clean audit report.",
    complianceScore: 98.0,
    reportStorageKey: "evc_reports/evc-3-verified.pdf",
    committeeMembersCount: 3,
    isOverdue: false,
    isSimulated: true,
  },
  {
    id: "evc-4",
    applicationId: "app-105",
    applicationNumber: "AICTE-2026-ARCH-00007",
    institutionName: "Jadavpur University School of Architecture",
    permanentInstituteId: "1-9988771",
    regionName: "Eastern Region",
    leadExpertName: "Ar. D. Banerjee",
    leadExpertEmail: "dbanerjee@iiests.ac.in",
    scheduledStart: "2026-10-24T10:00:00Z",
    scheduledEnd: "2026-10-24T17:00:00Z",
    status: "in_progress",
    findingsSummary: "Inspection in progress. Initial lab walkthrough completed.",
    complianceScore: null,
    reportStorageKey: null,
    committeeMembersCount: 3,
    isOverdue: false,
    isSimulated: true,
  },
];

const DEMO_UNDERTAKINGS: UndertakingItem[] = [
  {
    id: "und-1",
    applicationId: "app-101",
    applicationNumber: "AICTE-2026-ENGG-00124",
    institutionName: "K.J. Somaiya College of Engineering",
    title: "Statutory Undertaking on Anti-Ragging and Student Safety",
    undertakingType: "anti_ragging_and_safety",
    clauseExcerpt: "Institution strictly conforms to AICTE Anti-Ragging Regulation and CCTV statutory mandates.",
    digitalSignatureHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    signedBy: "Director / Principal",
    signedAt: "2026-09-12T10:15:00Z",
    isVerified: true,
    verifiedBy: "Regional Scrutiny Officer",
    verifiedAt: "2026-09-20T14:00:00Z",
    isSimulated: true,
  },
  {
    id: "und-2",
    applicationId: "app-102",
    applicationNumber: "AICTE-2026-MGMT-00088",
    institutionName: "T.A. Pai Management Institute",
    title: "Faculty Cadre & Pay Scale Statutory Affirmation",
    undertakingType: "faculty_pay_scale",
    clauseExcerpt: "Teaching faculty disbursed salaries through nationalized bank accounts adhering to 7th Central Pay Commission norms.",
    digitalSignatureHash: "7d793037a0760186574b0282f2f435e70d73a4e728d32214c609970ce5262a56",
    signedBy: "Dean (Academic Governance)",
    signedAt: "2026-09-18T12:00:00Z",
    isVerified: true,
    verifiedBy: "Regional Officer (SWRO)",
    verifiedAt: "2026-09-25T11:30:00Z",
    isSimulated: true,
  },
  {
    id: "und-3",
    applicationId: "app-105",
    applicationNumber: "AICTE-2026-ARCH-00007",
    institutionName: "Jadavpur University School of Architecture",
    title: "Land Title Possession & Non-Alienation Undertaking",
    undertakingType: "land_ownership_affirmation",
    clauseExcerpt: "Contiguous land plot verified free from encumbrances, registered in favor of society/trust for minimum 30 years.",
    digitalSignatureHash: "bfb87beea6cc53ff24f8d5519db8a70908ea0e80bc8a87b0a8528aa7ebc85fcb",
    signedBy: "Authorized Trustee / Registrar",
    signedAt: "2026-09-28T15:45:00Z",
    isVerified: false,
    verifiedBy: null,
    verifiedAt: null,
    isSimulated: true,
  },
];

export async function getComplianceMonitoringData(): Promise<ComplianceDashboardData> {
  let complianceItems = DEMO_COMPLIANCE_ITEMS;
  let evcItems = DEMO_EVC_ITEMS;
  let undertakings = DEMO_UNDERTAKINGS;
  let isDemo = true;

  try {
    const supabase = await createServerClient();

    // 1. Fetch compliance submissions with relational joins
    const { data: compData } = await (supabase.from("compliance_submissions") as unknown as {
      select: (cols: string) => {
        order: (col: string, opts: { ascending: boolean }) => Promise<{
          data: Array<{
            id: string;
            application_id: string;
            institution_id: string;
            deficiency_notice_ref: string | null;
            compliance_remarks: string;
            status: string;
            review_comments: string | null;
            reviewed_at: string | null;
            created_at: string;
            application?: { application_number: string; target_decision_date: string | null } | null;
            institution?: { name: string; aicte_id: string | null; region?: { name: string } | null } | null;
            reviewed_by_profile?: { full_name: string; role: string } | null;
          }> | null;
          error: unknown;
        }>;
      };
    })
      .select(`
        id,
        application_id,
        institution_id,
        deficiency_notice_ref,
        compliance_remarks,
        status,
        review_comments,
        reviewed_at,
        created_at,
        application:applications (
          application_number,
          target_decision_date
        ),
        institution:institutions (
          name,
          aicte_id,
          region:regions (name)
        ),
        reviewed_by_profile:profiles!reviewed_by (
          full_name,
          role
        )
      `)
      .order("created_at", { ascending: false });

    // 2. Fetch EVC Visits
    const { data: evcData } = await (supabase.from("evc_visits") as unknown as {
      select: (cols: string) => {
        order: (col: string, opts: { ascending: boolean }) => Promise<{
          data: Array<{
            id: string;
            application_id: string;
            scheduled_start: string;
            scheduled_end: string;
            status: string;
            findings_summary: string | null;
            compliance_score: number | null;
            report_storage_key: string | null;
            committee_members: unknown[];
            application?: {
              application_number: string;
              institution?: { name: string; aicte_id: string | null } | null;
              region?: { name: string } | null;
            } | null;
            lead_expert?: { full_name: string; email: string } | null;
          }> | null;
          error: unknown;
        }>;
      };
    })
      .select(`
        id,
        application_id,
        scheduled_start,
        scheduled_end,
        status,
        findings_summary,
        compliance_score,
        report_storage_key,
        committee_members,
        application:applications (
          application_number,
          institution:institutions (name, aicte_id),
          region:regions (name)
        ),
        lead_expert:profiles!lead_expert_id (
          full_name,
          email
        )
      `)
      .order("scheduled_start", { ascending: false });

    // 3. Fetch Undertakings
    const { data: undData } = await (supabase.from("undertakings") as unknown as {
      select: (cols: string) => {
        order: (col: string, opts: { ascending: boolean }) => Promise<{
          data: Array<{
            id: string;
            application_id: string;
            title: string;
            undertaking_type: string;
            clause_text: string;
            digital_signature_hash: string;
            signed_at: string;
            is_verified: boolean;
            verified_at: string | null;
            application?: {
              application_number: string;
              institution?: { name: string } | null;
            } | null;
            signer_profile?: { full_name: string } | null;
            verifier_profile?: { full_name: string } | null;
          }> | null;
          error: unknown;
        }>;
      };
    })
      .select(`
        id,
        application_id,
        title,
        undertaking_type,
        clause_text,
        digital_signature_hash,
        signed_at,
        is_verified,
        verified_at,
        application:applications (
          application_number,
          institution:institutions (name)
        ),
        signer_profile:profiles!signed_by_profile_id (full_name),
        verifier_profile:profiles!verified_by (full_name)
      `)
      .order("signed_at", { ascending: false });

    if (compData && compData.length > 0) {
      isDemo = false;
      const now = new Date();
      complianceItems = compData.map((c) => {
        const dueDate = c.application?.target_decision_date || new Date(new Date(c.created_at).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
        const isOverdue = c.status === "pending" && new Date(dueDate).getTime() < now.getTime();

        return {
          id: c.id,
          applicationId: c.application_id,
          applicationNumber: c.application?.application_number || "APP-UNKNOWN",
          institutionId: c.institution_id,
          institutionName: c.institution?.name || "Technical Institute",
          permanentInstituteId: c.institution?.aicte_id || "N/A",
          regionName: c.institution?.region?.name || "Central Jurisdiction",
          deficiencyRef: c.deficiency_notice_ref || "Formal Scrutiny Query",
          complianceRemarks: c.compliance_remarks,
          submissionDate: c.created_at,
          status: c.status as ComplianceCentreItem["status"],
          reviewerName: c.reviewed_by_profile?.full_name || null,
          reviewerRole: c.reviewed_by_profile?.role || null,
          reviewedAt: c.reviewed_at,
          reviewComments: c.review_comments,
          evidenceDocsCount: 1,
          undertakingsCount: 1,
          isOverdue,
          dueDate,
          isSimulated: false,
        };
      });
    }

    if (evcData && evcData.length > 0) {
      isDemo = false;
      const now = new Date();
      evcItems = evcData.map((e) => {
        const isOverdue = ["scheduled", "in_progress"].includes(e.status) && new Date(e.scheduled_end).getTime() < now.getTime();

        return {
          id: e.id,
          applicationId: e.application_id,
          applicationNumber: e.application?.application_number || "APP-UNKNOWN",
          institutionName: e.application?.institution?.name || "Institute",
          permanentInstituteId: e.application?.institution?.aicte_id || "N/A",
          regionName: e.application?.region?.name || "Central",
          leadExpertName: e.lead_expert?.full_name || "Nominated Senior Expert",
          leadExpertEmail: e.lead_expert?.email || null,
          scheduledStart: e.scheduled_start,
          scheduledEnd: e.scheduled_end,
          status: e.status as EvcManagementItem["status"],
          findingsSummary: e.findings_summary,
          complianceScore: e.compliance_score ? Number(e.compliance_score) : null,
          reportStorageKey: e.report_storage_key,
          committeeMembersCount: Array.isArray(e.committee_members) ? e.committee_members.length : 3,
          isOverdue,
          isSimulated: false,
        };
      });
    }

    if (undData && undData.length > 0) {
      isDemo = false;
      undertakings = undData.map((u) => ({
        id: u.id,
        applicationId: u.application_id,
        applicationNumber: u.application?.application_number || "APP-UNKNOWN",
        institutionName: u.application?.institution?.name || "Institute",
        title: u.title,
        undertakingType: u.undertaking_type,
        clauseExcerpt: u.clause_text.slice(0, 140) + "...",
        digitalSignatureHash: u.digital_signature_hash,
        signedBy: u.signer_profile?.full_name || "Authorized Signatory",
        signedAt: u.signed_at,
        isVerified: u.is_verified,
        verifiedBy: u.verifier_profile?.full_name || null,
        verifiedAt: u.verified_at,
        isSimulated: false,
      }));
    }
  } catch (err) {
    console.warn("getComplianceMonitoringData: fallback to demo", err);
  }

  const stats = {
    pendingReviews: complianceItems.filter((c) => c.status === "pending").length,
    completedCompliance: complianceItems.filter((c) => c.status === "completed").length,
    scheduledEvc: evcItems.filter((e) => e.status === "scheduled").length,
    evcReportsPendingReview: evcItems.filter((e) => e.status === "report_submitted").length,
    verifiedUndertakings: undertakings.filter((u) => u.isVerified).length,
    overdueComplianceItems: complianceItems.filter((c) => c.isOverdue).length,
  };

  return {
    complianceItems,
    evcItems,
    undertakings,
    stats,
    isDemo,
  };
}
