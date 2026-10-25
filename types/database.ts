/**
 * AICTE SAKSHAM - Supabase Database TypeScript Definitions
 *
 * Generated to match migration: supabase/migrations/20261025164500_initial_schema.sql
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole =
  | "institution_admin"
  | "institution_user"
  | "regional_officer"
  | "scrutiny_officer"
  | "evc_expert"
  | "council_admin"
  | "system_auditor";

export type ApplicationStatus =
  | "draft"
  | "submitted"
  | "under_scrutiny"
  | "scrutiny_clarification_sought"
  | "scrutiny_cleared"
  | "evc_scheduled"
  | "evc_completed"
  | "sac_review"
  | "council_decision_pending"
  | "approved"
  | "rejected"
  | "withdrawn";

export type TaskStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "returned"
  | "escalated"
  | "cancelled";

export type EvcStatus =
  | "scheduled"
  | "in_progress"
  | "report_submitted"
  | "verified"
  | "cancelled";

export type DocumentCategory =
  | "land_document"
  | "building_plan"
  | "fire_safety"
  | "affidavit"
  | "financial_audit"
  | "faculty_list"
  | "evc_geotagged_photo"
  | "evc_video"
  | "compliance_proof"
  | "other";

export type EscalationStatus =
  | "open"
  | "acknowledged"
  | "resolved"
  | "closed";

export interface Database {
  public: {
    Tables: {
      regions: {
        Row: {
          id: string;
          code: string;
          name: string;
          states_covered: string[];
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          states_covered?: string[];
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          states_covered?: string[];
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      institutions: {
        Row: {
          id: string;
          aicte_id: string | null;
          name: string;
          legal_entity_type: string;
          region_id: string;
          address_line1: string;
          address_line2: string | null;
          city: string;
          state: string;
          pincode: string;
          contact_email: string;
          contact_phone: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          aicte_id?: string | null;
          name: string;
          legal_entity_type: string;
          region_id: string;
          address_line1: string;
          address_line2?: string | null;
          city: string;
          state: string;
          pincode: string;
          contact_email: string;
          contact_phone: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          aicte_id?: string | null;
          name?: string;
          legal_entity_type?: string;
          region_id?: string;
          address_line1?: string;
          address_line2?: string | null;
          city?: string;
          state?: string;
          pincode?: string;
          contact_email?: string;
          contact_phone?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: UserRole;
          institution_id: string | null;
          region_id: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          role?: UserRole;
          institution_id?: string | null;
          region_id?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          role?: UserRole;
          institution_id?: string | null;
          region_id?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      workflow_definitions: {
        Row: {
          id: string;
          code: string;
          version: number;
          title: string;
          description: string | null;
          stage_sequence: Json;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          version?: number;
          title: string;
          description?: string | null;
          stage_sequence?: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          version?: number;
          title?: string;
          description?: string | null;
          stage_sequence?: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      deadline_policies: {
        Row: {
          id: string;
          workflow_definition_id: string;
          stage_key: string;
          turnaround_days: number;
          warning_threshold_days: number;
          auto_escalation_enabled: boolean;
          version: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workflow_definition_id: string;
          stage_key: string;
          turnaround_days: number;
          warning_threshold_days: number;
          auto_escalation_enabled?: boolean;
          version?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workflow_definition_id?: string;
          stage_key?: string;
          turnaround_days?: number;
          warning_threshold_days?: number;
          auto_escalation_enabled?: boolean;
          version?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      applications: {
        Row: {
          id: string;
          application_number: string;
          institution_id: string;
          region_id: string;
          academic_year: string;
          application_type: string;
          workflow_definition_id: string;
          current_stage: string;
          status: ApplicationStatus;
          submission_date: string | null;
          target_decision_date: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          application_number: string;
          institution_id: string;
          region_id: string;
          academic_year: string;
          application_type: string;
          workflow_definition_id: string;
          current_stage?: string;
          status?: ApplicationStatus;
          submission_date?: string | null;
          target_decision_date?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          application_number?: string;
          institution_id?: string;
          region_id?: string;
          academic_year?: string;
          application_type?: string;
          workflow_definition_id?: string;
          current_stage?: string;
          status?: ApplicationStatus;
          submission_date?: string | null;
          target_decision_date?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      workflow_tasks: {
        Row: {
          id: string;
          application_id: string;
          stage_key: string;
          task_name: string;
          assigned_to: string | null;
          assigned_role: UserRole | null;
          status: TaskStatus;
          due_date: string | null;
          completed_at: string | null;
          remarks: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          application_id: string;
          stage_key: string;
          task_name: string;
          assigned_to?: string | null;
          assigned_role?: UserRole | null;
          status?: TaskStatus;
          due_date?: string | null;
          completed_at?: string | null;
          remarks?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          application_id?: string;
          stage_key?: string;
          task_name?: string;
          assigned_to?: string | null;
          assigned_role?: UserRole | null;
          status?: TaskStatus;
          due_date?: string | null;
          completed_at?: string | null;
          remarks?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      application_events: {
        Row: {
          id: string;
          application_id: string;
          actor_id: string | null;
          event_type: string;
          from_status: ApplicationStatus | null;
          to_status: ApplicationStatus | null;
          description: string;
          event_payload: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          application_id: string;
          actor_id?: string | null;
          event_type: string;
          from_status?: ApplicationStatus | null;
          to_status?: ApplicationStatus | null;
          description: string;
          event_payload?: Json;
          created_at?: string;
        };
        Update: never;
      };
      evc_visits: {
        Row: {
          id: string;
          application_id: string;
          scheduled_start: string;
          scheduled_end: string;
          status: EvcStatus;
          lead_expert_id: string | null;
          committee_members: Json;
          report_storage_key: string | null;
          findings_summary: string | null;
          compliance_score: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          application_id: string;
          scheduled_start: string;
          scheduled_end: string;
          status?: EvcStatus;
          lead_expert_id?: string | null;
          committee_members?: Json;
          report_storage_key?: string | null;
          findings_summary?: string | null;
          compliance_score?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          application_id?: string;
          scheduled_start?: string;
          scheduled_end?: string;
          status?: EvcStatus;
          lead_expert_id?: string | null;
          committee_members?: Json;
          report_storage_key?: string | null;
          findings_summary?: string | null;
          compliance_score?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      undertakings: {
        Row: {
          id: string;
          application_id: string;
          undertaking_type: string;
          title: string;
          clause_text: string;
          signed_by_profile_id: string;
          digital_signature_hash: string;
          signed_at: string;
          ip_address: string | null;
          is_verified: boolean;
          verified_by: string | null;
          verified_at: string | null;
          is_valid: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          application_id: string;
          undertaking_type: string;
          title: string;
          clause_text: string;
          signed_by_profile_id: string;
          digital_signature_hash: string;
          signed_at?: string;
          ip_address?: string | null;
          is_verified?: boolean;
          verified_by?: string | null;
          verified_at?: string | null;
          is_valid?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          application_id?: string;
          undertaking_type?: string;
          title?: string;
          clause_text?: string;
          signed_by_profile_id?: string;
          digital_signature_hash?: string;
          signed_at?: string;
          ip_address?: string | null;
          is_verified?: boolean;
          verified_by?: string | null;
          verified_at?: string | null;
          is_valid?: boolean;
          created_at?: string;
        };
      };
      documents: {
        Row: {
          id: string;
          application_id: string | null;
          institution_id: string;
          category: DocumentCategory;
          file_name: string;
          storage_key: string;
          mime_type: string;
          file_size_bytes: number;
          checksum_sha256: string;
          uploaded_by: string;
          is_verified: boolean;
          verified_by: string | null;
          verified_at: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          application_id?: string | null;
          institution_id: string;
          category: DocumentCategory;
          file_name: string;
          storage_key: string;
          mime_type: string;
          file_size_bytes: number;
          checksum_sha256: string;
          uploaded_by: string;
          is_verified?: boolean;
          verified_by?: string | null;
          verified_at?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          application_id?: string | null;
          institution_id?: string;
          category?: DocumentCategory;
          file_name?: string;
          storage_key?: string;
          mime_type?: string;
          file_size_bytes?: number;
          checksum_sha256?: string;
          uploaded_by?: string;
          is_verified?: boolean;
          verified_by?: string | null;
          verified_at?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      compliance_submissions: {
        Row: {
          id: string;
          application_id: string;
          institution_id: string;
          deficiency_notice_ref: string | null;
          compliance_remarks: string;
          document_ids: string[];
          submitted_by: string;
          status: TaskStatus;
          review_comments: string | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          application_id: string;
          institution_id: string;
          deficiency_notice_ref?: string | null;
          compliance_remarks: string;
          document_ids?: string[];
          submitted_by: string;
          status?: TaskStatus;
          review_comments?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          application_id?: string;
          institution_id?: string;
          deficiency_notice_ref?: string | null;
          compliance_remarks?: string;
          document_ids?: string[];
          submitted_by?: string;
          status?: TaskStatus;
          review_comments?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      escalations: {
        Row: {
          id: string;
          application_id: string;
          task_id: string | null;
          severity: "low" | "medium" | "high" | "critical";
          reason: string;
          status: EscalationStatus;
          escalated_to_role: UserRole;
          resolution_notes: string | null;
          resolved_by: string | null;
          resolved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          application_id: string;
          task_id?: string | null;
          severity?: "low" | "medium" | "high" | "critical";
          reason: string;
          status?: EscalationStatus;
          escalated_to_role: UserRole;
          resolution_notes?: string | null;
          resolved_by?: string | null;
          resolved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          application_id?: string;
          task_id?: string | null;
          severity?: "low" | "medium" | "high" | "critical";
          reason?: string;
          status?: EscalationStatus;
          escalated_to_role?: UserRole;
          resolution_notes?: string | null;
          resolved_by?: string | null;
          resolved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      notification_events: {
        Row: {
          id: string;
          recipient_profile_id: string;
          application_id: string | null;
          channel: "email" | "sms" | "in_app";
          title: string;
          content: string;
          is_read: boolean;
          delivered_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          recipient_profile_id: string;
          application_id?: string | null;
          channel: "email" | "sms" | "in_app";
          title: string;
          content: string;
          is_read?: boolean;
          delivered_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          recipient_profile_id?: string;
          application_id?: string | null;
          channel?: "email" | "sms" | "in_app";
          title?: string;
          content?: string;
          is_read?: boolean;
          delivered_at?: string | null;
          created_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          table_name: string;
          record_id: string;
          operation: "INSERT" | "UPDATE" | "DELETE";
          changed_by: string | null;
          old_data: Json | null;
          new_data: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          table_name: string;
          record_id: string;
          operation: "INSERT" | "UPDATE" | "DELETE";
          changed_by?: string | null;
          old_data?: Json | null;
          new_data?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: never;
      };
    };
  };
}
