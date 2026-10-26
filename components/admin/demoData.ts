import type { StatusDistributionItem, RegionDistributionItem } from "./DistributionCharts";
import type { ApplicationRow } from "./ApplicationsTable";

export interface ActivityFeedItem {
  id: string;
  applicationNumber: string;
  eventType: string;
  description: string;
  actorName: string;
  actorRole: string;
  timestamp: string;
  isSimulated?: boolean;
}

export interface DashboardStats {
  totalApplications: number;
  pendingReview: number;
  evcVisitsScheduled: number;
  decisionsPending: number;
  approvedApplications: number;
  rejectedApplications: number;
  isDemo: boolean;
  statusDistribution: StatusDistributionItem[];
  regionDistribution: RegionDistributionItem[];
  recentApplications: ApplicationRow[];
  recentActivity: ActivityFeedItem[];
}

export const DEMO_ACTIVITY_FEED: ActivityFeedItem[] = [
  {
    id: "act-1",
    applicationNumber: "AICTE-2026-ENGG-00124",
    eventType: "STATUS_TRANSITION",
    description: "Application progressed to Council Decision Pending following SAC review clearance",
    actorName: "Dr. K. Balasubramanian",
    actorRole: "council_admin",
    timestamp: "2026-10-25T11:42:15Z",
  },
  {
    id: "act-2",
    applicationNumber: "AICTE-2026-MGMT-00088",
    eventType: "EVC_SCHEDULED",
    description: "Expert Visiting Committee scheduled for 04 Nov 2026 under Lead Expert Prof. S. Ranganathan",
    actorName: "Shri Rajesh Deshmukh",
    actorRole: "regional_officer",
    timestamp: "2026-10-25T09:15:30Z",
  },
  {
    id: "act-3",
    applicationNumber: "AICTE-2026-ARCH-00007",
    eventType: "CLARIFICATION_SOUGHT",
    description: "Deficiency notice issued regarding Land Title Sub-Lease deed validity under Appendix 16",
    actorName: "Dr. Sunita Murthy",
    actorRole: "scrutiny_officer",
    timestamp: "2026-10-24T16:20:00Z",
  },
  {
    id: "act-4",
    applicationNumber: "AICTE-2026-PHAR-00042",
    eventType: "APPLICATION_APPROVED",
    description: "Letter of Extension of Approval (EoA) issued for AY 2026-27 with 100 intake capacity",
    actorName: "Approval Bureau Executive",
    actorRole: "council_admin",
    timestamp: "2026-10-24T14:10:00Z",
  },
  {
    id: "act-5",
    applicationNumber: "AICTE-2026-MCA-00019",
    eventType: "SCRUTINY_COMMENCED",
    description: "Physical and statutory document scrutiny initiated at Northern Regional Office",
    actorName: "Shri Rajesh Deshmukh",
    actorRole: "regional_officer",
    timestamp: "2026-10-23T11:30:00Z",
  },
];

/**
 * High-fidelity labelled demo data matching actual schema enums, tables, and workflows.
 * Displayed cleanly when database contains 0 rows or is awaiting migration.
 */
export const DEMO_DASHBOARD_DATA: DashboardStats = {
  totalApplications: 412,
  // Pending review = submitted + under_scrutiny + scrutiny_clarification_sought + sac_review
  pendingReview: 148,
  // EVC Scheduled
  evcVisitsScheduled: 37,
  // Decisions pending at council gate
  decisionsPending: 42,
  // Approved
  approvedApplications: 161,
  // Rejected
  rejectedApplications: 24,
  isDemo: true,
  statusDistribution: [
    {
      status: "approved",
      label: "Approved",
      count: 161,
      percentage: 39,
      colorClass: "bg-emerald-500",
    },
    {
      status: "under_scrutiny",
      label: "Under Scrutiny",
      count: 74,
      percentage: 18,
      colorClass: "bg-yellow-500",
    },
    {
      status: "council_decision_pending",
      label: "Council Decision Pending",
      count: 42,
      percentage: 10,
      colorClass: "bg-purple-500",
    },
    {
      status: "evc_scheduled",
      label: "EVC Scheduled",
      count: 37,
      percentage: 9,
      colorClass: "bg-cyan-500",
    },
    {
      status: "submitted",
      label: "Submitted",
      count: 46,
      percentage: 11,
      colorClass: "bg-sky-500",
    },
    {
      status: "sac_review",
      label: "SAC Review",
      count: 28,
      percentage: 7,
      colorClass: "bg-indigo-500",
    },
    {
      status: "rejected",
      label: "Rejected",
      count: 24,
      percentage: 6,
      colorClass: "bg-rose-500",
    },
  ],
  regionDistribution: [
    {
      regionCode: "WRO",
      regionName: "Western Regional Office (Mumbai)",
      applicationCount: 112,
      institutionCount: 420,
      percentage: 27,
    },
    {
      regionCode: "SRO",
      regionName: "Southern Regional Office (Chennai)",
      applicationCount: 98,
      institutionCount: 385,
      percentage: 24,
    },
    {
      regionCode: "NRO",
      regionName: "Northern Regional Office (Kanpur)",
      applicationCount: 76,
      institutionCount: 310,
      percentage: 18,
    },
    {
      regionCode: "SWRO",
      regionName: "South-Western Regional Office (Bengaluru)",
      applicationCount: 64,
      institutionCount: 260,
      percentage: 16,
    },
    {
      regionCode: "ERO",
      regionName: "Eastern Regional Office (Kolkata)",
      applicationCount: 38,
      institutionCount: 175,
      percentage: 9,
    },
    {
      regionCode: "NWRO",
      regionName: "North-Western Regional Office (Chandigarh)",
      applicationCount: 24,
      institutionCount: 120,
      percentage: 6,
    },
  ],
  recentApplications: [
    {
      id: "app-101",
      applicationNumber: "AICTE-2026-ENGG-00124",
      institutionName: "K.J. Somaiya College of Engineering",
      permanentInstituteId: "1-4251781",
      regionName: "Western Region",
      programType: "Engineering & Technology",
      academicYear: "2026-2027",
      status: "council_decision_pending",
      currentStage: "council_review",
      routeCode: "SCRUTINY_EVC",
      submittedAt: "2026-09-12T10:30:00Z",
      targetDecisionDate: "2026-11-15T00:00:00Z",
    },
    {
      id: "app-102",
      applicationNumber: "AICTE-2026-MGMT-00088",
      institutionName: "T.A. Pai Management Institute",
      permanentInstituteId: "1-1289456",
      regionName: "South-Western Region",
      programType: "Management (PGDM)",
      academicYear: "2026-2027",
      status: "evc_scheduled",
      currentStage: "evc_inspection",
      routeCode: "SCRUTINY_EVC",
      submittedAt: "2026-09-18T14:15:00Z",
      targetDecisionDate: "2026-11-30T00:00:00Z",
    },
    {
      id: "app-103",
      applicationNumber: "AICTE-2026-PHAR-00042",
      institutionName: "PSG College of Pharmacy",
      permanentInstituteId: "1-7893214",
      regionName: "Southern Region",
      programType: "Pharmacy",
      academicYear: "2026-2027",
      status: "approved",
      currentStage: "decision_issued",
      routeCode: "EVC_SAC",
      submittedAt: "2026-08-05T09:00:00Z",
      targetDecisionDate: "2026-10-20T00:00:00Z",
    },
    {
      id: "app-104",
      applicationNumber: "AICTE-2026-MCA-00019",
      institutionName: "Harcourt Butler Technical University",
      permanentInstituteId: "1-3344556",
      regionName: "Northern Region",
      programType: "MCA / Computer Applications",
      academicYear: "2026-2027",
      status: "under_scrutiny",
      currentStage: "scrutiny",
      routeCode: "SCRUTINY_ONLY",
      submittedAt: "2026-10-02T11:45:00Z",
      targetDecisionDate: "2026-12-05T00:00:00Z",
    },
    {
      id: "app-105",
      applicationNumber: "AICTE-2026-ARCH-00007",
      institutionName: "Jadavpur University School of Architecture",
      permanentInstituteId: "1-9988771",
      regionName: "Eastern Region",
      programType: "Architecture & Planning",
      academicYear: "2026-2027",
      status: "scrutiny_clarification_sought",
      currentStage: "scrutiny",
      routeCode: "SCRUTINY_ONLY",
      submittedAt: "2026-09-28T16:20:00Z",
      targetDecisionDate: "2026-12-10T00:00:00Z",
    },
    {
      id: "app-106",
      applicationNumber: "AICTE-2026-DIPL-00311",
      institutionName: "Guru Nanak Dev Polytechnic",
      permanentInstituteId: "1-5566778",
      regionName: "North-Western Region",
      programType: "Diploma / Polytechnic",
      academicYear: "2026-2027",
      status: "rejected",
      currentStage: "decision_issued",
      routeCode: "ONLY_EVC",
      submittedAt: "2026-08-11T13:10:00Z",
      targetDecisionDate: "2026-10-15T00:00:00Z",
    },
  ],
  recentActivity: DEMO_ACTIVITY_FEED,
};
