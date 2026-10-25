export interface ExplainableAlert {
  id: string;
  applicationNumber: string;
  institutionName: string;
  region: string;
  severity: "low" | "medium" | "high" | "critical";
  ruleName: string;
  deadlineDate: string;
  daysRemainingOrOverdue: number;
  isOverdue: boolean;
  responsibleOwner: string;
  actionRequired: string;
  reason: string;
}

export const EXPLAINABLE_ALERTS: ExplainableAlert[] = [
  {
    id: "alt-1",
    applicationNumber: "AICTE-2026-ENGG-00124",
    institutionName: "K.J. Somaiya College of Engineering",
    region: "Western Region (WRO)",
    severity: "critical",
    ruleName: "APH Chapter II — Rule 2.14 (Council Final Decision SLA)",
    deadlineDate: "2026-11-15T00:00:00Z",
    daysRemainingOrOverdue: -3,
    isOverdue: true,
    responsibleOwner: "Council Member Secretary / Approval Bureau",
    actionRequired: "Issue Final Approval/Rejection Statutory Order",
    reason: "Application has completed SAC review and cleared all inspections. Statutory 10-day decision deadline has been exceeded.",
  },
  {
    id: "alt-2",
    applicationNumber: "AICTE-2026-MGMT-00088",
    institutionName: "T.A. Pai Management Institute",
    region: "South-Western Region (SWRO)",
    severity: "high",
    ruleName: "APH Chapter III — Rule 3.4 (EVC Inspection Scheduling SLA)",
    deadlineDate: "2026-11-04T00:00:00Z",
    daysRemainingOrOverdue: 2,
    isOverdue: false,
    responsibleOwner: "Regional Officer (SWRO) & EVC Lead Expert",
    actionRequired: "Confirm Expert Committee arrival and virtual link dispatch",
    reason: "EVC visit scheduled within 48 hours. Ensure committee members have completed conflict-of-interest undertakings.",
  },
  {
    id: "alt-3",
    applicationNumber: "AICTE-2026-ARCH-00007",
    institutionName: "Jadavpur University School of Architecture",
    region: "Eastern Region (ERO)",
    severity: "medium",
    ruleName: "APH Appendix 16 — Deficiency Clarification Window",
    deadlineDate: "2026-11-08T00:00:00Z",
    daysRemainingOrOverdue: 5,
    isOverdue: false,
    responsibleOwner: "Institution Admin & Scrutiny Committee",
    actionRequired: "Await institution compliance upload or issue reminder",
    reason: "Fire Safety NOC deficiency clarification sought on 2026-10-24. Institute allotted 7 statutory days.",
  },
  {
    id: "alt-4",
    applicationNumber: "AICTE-2026-MCA-00019",
    institutionName: "Harcourt Butler Technical University",
    region: "Northern Region (NRO)",
    severity: "high",
    ruleName: "APH Chapter I — Rule 1.9 (Initial Scrutiny SLA 15-Day Limit)",
    deadlineDate: "2026-10-30T00:00:00Z",
    daysRemainingOrOverdue: -1,
    isOverdue: true,
    responsibleOwner: "Regional Scrutiny Committee (NRO)",
    actionRequired: "Complete scrutiny checklist verification",
    reason: "15-day statutory scrutiny threshold lapsed. Automatic escalation to Regional Officer dispatched.",
  },
];
