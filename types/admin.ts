export interface QueryApplication {
  id: string;
  application_number: string;
  academic_year: string;
  application_type: string;
  status: string;
  current_stage: string;
  submission_date: string | null;
  target_decision_date: string | null;
  institution?: {
    name?: string;
    aicte_id?: string;
  } | null;
  region?: {
    name?: string;
    code?: string;
  } | null;
}

export interface QueryEvcVisit {
  id: string;
  scheduled_start: string;
  status: string;
  findings_summary: string | null;
  application?: {
    institution?: { name?: string; aicte_id?: string };
    region?: { name?: string };
  } | null;
  lead_expert?: {
    full_name?: string;
  } | null;
}

export interface QueryAuditLog {
  id: string;
  table_name: string;
  operation: string;
  record_id: string;
  changed_by: string;
  created_at: string;
  changed_by_profile?: {
    full_name?: string;
    role?: string;
  } | null;
}

export interface QueryApplicationEvent {
  id: string;
  application_id: string;
  actor_id: string | null;
  event_type: string;
  from_status: string | null;
  to_status: string | null;
  description: string;
  created_at: string;
  application?: {
    application_number?: string;
  } | null;
  actor?: {
    full_name?: string;
    role?: string;
  } | null;
}

export interface QueryInstitution {
  id: string;
  name: string;
  aicte_id: string | null;
  legal_entity_type: string;
  state: string;
  city: string;
}

export interface QueryRegion {
  id: string;
  code: string;
  name: string;
  states_covered: string[] | null;
}

export interface QueryProfile {
  id: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
  region?: { name?: string } | null;
  institution?: { name?: string } | null;
}

export interface QueryDeadlinePolicy {
  id: string;
  stage_key: string;
  turnaround_days: number;
  warning_threshold_days: number;
  auto_escalation_enabled: boolean;
}
