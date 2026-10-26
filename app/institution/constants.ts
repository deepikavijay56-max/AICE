export interface DocumentCategoryDefinition {
  key: string;
  label: string;
  required: boolean;
}

export const MANDATORY_DOCUMENT_CATEGORIES: readonly DocumentCategoryDefinition[] = [
  { key: "land_document", label: "Land Ownership Title Deed & Contiguity Certificate", required: true },
  { key: "building_plan", label: "Approved Master Building Plan & Sanction Order", required: true },
  { key: "fire_safety", label: "Fire Safety NOC / State Fire Authority Clearance", required: true },
  { key: "affidavit", label: "Anti-Ragging and Statutory Compliance Affidavit", required: true },
  { key: "faculty_list", label: "Cadre-Ratio Faculty Roster & RTGS Salary Statement", required: true },
] as const;
