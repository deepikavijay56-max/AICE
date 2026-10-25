-- ==============================================================================
-- AICTE SAKSHAM - Hardened Initial Database Schema & Security Migration
-- Migration: 20261025164500_initial_schema.sql
-- Description:
--   Establishes core domain tables, foreign keys, constraints, indexes,
--   tamper-proof triggers, and hardened non-recursive Row Level Security (RLS) policies.
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM (
        'institution_admin',
        'institution_user',
        'regional_officer',
        'scrutiny_officer',
        'evc_expert',
        'council_admin',
        'system_auditor'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE application_status AS ENUM (
        'draft',
        'submitted',
        'under_scrutiny',
        'scrutiny_clarification_sought',
        'scrutiny_cleared',
        'evc_scheduled',
        'evc_completed',
        'sac_review',
        'council_decision_pending',
        'approved',
        'rejected',
        'withdrawn'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE task_status AS ENUM (
        'pending',
        'in_progress',
        'completed',
        'returned',
        'escalated',
        'cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE evc_status AS ENUM (
        'scheduled',
        'in_progress',
        'report_submitted',
        'verified',
        'cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE document_category AS ENUM (
        'land_document',
        'building_plan',
        'fire_safety',
        'affidavit',
        'financial_audit',
        'faculty_list',
        'evc_geotagged_photo',
        'evc_video',
        'compliance_proof',
        'other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE escalation_status AS ENUM (
        'open',
        'acknowledged',
        'resolved',
        'closed'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. CORE HELPER FUNCTIONS: Updated At
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
SECURITY INVOKER
SET search_path = pg_catalog, pg_temp
LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- 4. TABLES

-- Table 1: regions
CREATE TABLE IF NOT EXISTS public.regions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    states_covered TEXT[] NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_regions_updated_at ON public.regions;
CREATE TRIGGER trg_regions_updated_at BEFORE UPDATE ON public.regions
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Table 2: institutions
CREATE TABLE IF NOT EXISTS public.institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aicte_id TEXT UNIQUE,
    name TEXT NOT NULL,
    legal_entity_type TEXT NOT NULL,
    region_id UUID NOT NULL REFERENCES public.regions(id) ON DELETE RESTRICT,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    contact_email TEXT NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_institutions_updated_at ON public.institutions;
CREATE TRIGGER trg_institutions_updated_at BEFORE UPDATE ON public.institutions
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Table 3: profiles (references auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'institution_user',
    institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
    region_id UUID REFERENCES public.regions(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_profile_assignment CHECK (
        (role IN ('institution_admin', 'institution_user') AND institution_id IS NOT NULL) OR
        (role IN ('regional_officer', 'scrutiny_officer') AND region_id IS NOT NULL) OR
        (role IN ('council_admin', 'system_auditor', 'evc_expert'))
    )
);

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Table 4: workflow_definitions
CREATE TABLE IF NOT EXISTS public.workflow_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    title TEXT NOT NULL,
    description TEXT,
    stage_sequence JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_workflow_code_version UNIQUE (code, version)
);

DROP TRIGGER IF EXISTS trg_workflow_definitions_updated_at ON public.workflow_definitions;
CREATE TRIGGER trg_workflow_definitions_updated_at BEFORE UPDATE ON public.workflow_definitions
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Table 5: deadline_policies
CREATE TABLE IF NOT EXISTS public.deadline_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_definition_id UUID NOT NULL REFERENCES public.workflow_definitions(id) ON DELETE RESTRICT,
    stage_key TEXT NOT NULL,
    turnaround_days INTEGER NOT NULL CHECK (turnaround_days > 0),
    warning_threshold_days INTEGER NOT NULL CHECK (warning_threshold_days > 0),
    auto_escalation_enabled BOOLEAN NOT NULL DEFAULT false,
    version INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_deadline_stage_version UNIQUE (workflow_definition_id, stage_key, version)
);

DROP TRIGGER IF EXISTS trg_deadline_policies_updated_at ON public.deadline_policies;
CREATE TRIGGER trg_deadline_policies_updated_at BEFORE UPDATE ON public.deadline_policies
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Table 6: applications
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_number TEXT NOT NULL UNIQUE,
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE RESTRICT,
    region_id UUID NOT NULL REFERENCES public.regions(id) ON DELETE RESTRICT,
    academic_year VARCHAR(10) NOT NULL,
    application_type TEXT NOT NULL,
    workflow_definition_id UUID NOT NULL REFERENCES public.workflow_definitions(id) ON DELETE RESTRICT,
    current_stage TEXT NOT NULL DEFAULT 'draft',
    status application_status NOT NULL DEFAULT 'draft',
    submission_date TIMESTAMPTZ,
    target_decision_date TIMESTAMPTZ,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_applications_updated_at ON public.applications;
CREATE TRIGGER trg_applications_updated_at BEFORE UPDATE ON public.applications
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Table 7: workflow_tasks
CREATE TABLE IF NOT EXISTS public.workflow_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    stage_key TEXT NOT NULL,
    task_name TEXT NOT NULL,
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    assigned_role user_role,
    status task_status NOT NULL DEFAULT 'pending',
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_workflow_tasks_updated_at ON public.workflow_tasks;
CREATE TRIGGER trg_workflow_tasks_updated_at BEFORE UPDATE ON public.workflow_tasks
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Table 8: application_events (Append-only)
CREATE TABLE IF NOT EXISTS public.application_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    from_status application_status,
    to_status application_status,
    description TEXT NOT NULL,
    event_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 9: evc_visits (Expert Visiting Committee)
CREATE TABLE IF NOT EXISTS public.evc_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    scheduled_start TIMESTAMPTZ NOT NULL,
    scheduled_end TIMESTAMPTZ NOT NULL,
    status evc_status NOT NULL DEFAULT 'scheduled',
    lead_expert_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    committee_members JSONB NOT NULL DEFAULT '[]'::jsonb,
    report_storage_key TEXT,
    findings_summary TEXT,
    compliance_score NUMERIC(5, 2) CHECK (compliance_score IS NULL OR (compliance_score >= 0.0 AND compliance_score <= 100.0)),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_evc_schedule CHECK (scheduled_end >= scheduled_start)
);

DROP TRIGGER IF EXISTS trg_evc_visits_updated_at ON public.evc_visits;
CREATE TRIGGER trg_evc_visits_updated_at BEFORE UPDATE ON public.evc_visits
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Table 10: undertakings (Append-only signed affirmations)
CREATE TABLE IF NOT EXISTS public.undertakings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    undertaking_type TEXT NOT NULL,
    title TEXT NOT NULL,
    clause_text TEXT NOT NULL,
    signed_by_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    digital_signature_hash TEXT NOT NULL,
    signed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address INET,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    is_valid BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 11: documents (Storage keys only, never public URLs)
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    category document_category NOT NULL,
    file_name TEXT NOT NULL,
    storage_key TEXT NOT NULL UNIQUE,
    mime_type TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL CHECK (file_size_bytes > 0),
    checksum_sha256 VARCHAR(64) NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_documents_updated_at ON public.documents;
CREATE TRIGGER trg_documents_updated_at BEFORE UPDATE ON public.documents
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Table 12: compliance_submissions
CREATE TABLE IF NOT EXISTS public.compliance_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE RESTRICT,
    deficiency_notice_ref TEXT,
    compliance_remarks TEXT NOT NULL,
    document_ids UUID[] NOT NULL DEFAULT '{}',
    submitted_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    status task_status NOT NULL DEFAULT 'pending',
    review_comments TEXT,
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_compliance_submissions_updated_at ON public.compliance_submissions;
CREATE TRIGGER trg_compliance_submissions_updated_at BEFORE UPDATE ON public.compliance_submissions
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Table 13: escalations
CREATE TABLE IF NOT EXISTS public.escalations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    task_id UUID REFERENCES public.workflow_tasks(id) ON DELETE SET NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    reason TEXT NOT NULL,
    status escalation_status NOT NULL DEFAULT 'open',
    escalated_to_role user_role NOT NULL,
    resolution_notes TEXT,
    resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_escalations_updated_at ON public.escalations;
CREATE TRIGGER trg_escalations_updated_at BEFORE UPDATE ON public.escalations
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Table 14: notification_events (Append-only notification dispatch ledger)
CREATE TABLE IF NOT EXISTS public.notification_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
    channel VARCHAR(20) NOT NULL CHECK (channel IN ('email', 'sms', 'in_app')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 15: audit_logs (Append-only system audit ledger)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    operation VARCHAR(10) NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
    changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. INDEXES FOR QUERY OPTIMIZATION
CREATE INDEX IF NOT EXISTS idx_institutions_region ON public.institutions(region_id);
CREATE INDEX IF NOT EXISTS idx_profiles_institution ON public.profiles(institution_id);
CREATE INDEX IF NOT EXISTS idx_profiles_region ON public.profiles(region_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

CREATE INDEX IF NOT EXISTS idx_applications_institution ON public.applications(institution_id);
CREATE INDEX IF NOT EXISTS idx_applications_region ON public.applications(region_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_stage ON public.applications(current_stage);

CREATE INDEX IF NOT EXISTS idx_workflow_tasks_app ON public.workflow_tasks(application_id);
CREATE INDEX IF NOT EXISTS idx_workflow_tasks_assigned_to ON public.workflow_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_workflow_tasks_status ON public.workflow_tasks(status);

CREATE INDEX IF NOT EXISTS idx_app_events_app ON public.application_events(application_id);
CREATE INDEX IF NOT EXISTS idx_app_events_actor ON public.application_events(actor_id);

CREATE INDEX IF NOT EXISTS idx_evc_visits_app ON public.evc_visits(application_id);
CREATE INDEX IF NOT EXISTS idx_documents_app ON public.documents(application_id);
CREATE INDEX IF NOT EXISTS idx_documents_inst ON public.documents(institution_id);
CREATE INDEX IF NOT EXISTS idx_documents_storage_key ON public.documents(storage_key);

CREATE INDEX IF NOT EXISTS idx_compliance_app ON public.compliance_submissions(application_id);
CREATE INDEX IF NOT EXISTS idx_compliance_inst ON public.compliance_submissions(institution_id);

CREATE INDEX IF NOT EXISTS idx_escalations_app ON public.escalations(application_id);
CREATE INDEX IF NOT EXISTS idx_escalations_task ON public.escalations(task_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notification_events(recipient_profile_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_record ON public.audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_changed_by ON public.audit_logs(changed_by);

-- 6. SECURITY HELPER FUNCTIONS
-- All helpers are defined with SECURITY DEFINER, SET search_path = pg_catalog, public, pg_temp,
-- and REVOKE EXECUTE from PUBLIC. Inactive profiles return NULL to reject unauthorized access.

CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS public.user_role
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
LANGUAGE sql STABLE AS $$
    SELECT p.role
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.is_active = true
    LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_auth_institution_id()
RETURNS UUID
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
LANGUAGE sql STABLE AS $$
    SELECT p.institution_id
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.is_active = true
    LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_auth_region_id()
RETURNS UUID
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
LANGUAGE sql STABLE AS $$
    SELECT p.region_id
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.is_active = true
    LIMIT 1;
$$;

-- Helper to safely verify if authenticated officer is authorized for a given application
CREATE OR REPLACE FUNCTION public.is_officer_assigned_to_application(p_application_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
LANGUAGE sql STABLE AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.applications a
        WHERE a.id = p_application_id
        AND (
            public.get_auth_role() = 'council_admin'
            OR (
                public.get_auth_role() IN ('regional_officer', 'scrutiny_officer')
                AND a.region_id = public.get_auth_region_id()
            )
        )
    );
$$;

-- Helper to safely verify if expert is assigned to application via an EVC visit
CREATE OR REPLACE FUNCTION public.is_expert_assigned_to_application(p_application_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
LANGUAGE sql STABLE AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.evc_visits ev
        WHERE ev.application_id = p_application_id
        AND (
            ev.lead_expert_id = auth.uid()
            OR ev.committee_members @> to_jsonb(auth.uid()::text)
        )
    );
$$;

-- Restrict function execution strictly to authenticated callers
REVOKE EXECUTE ON FUNCTION public.get_auth_role() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_auth_role() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_auth_institution_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_auth_institution_id() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_auth_region_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_auth_region_id() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.is_officer_assigned_to_application(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_officer_assigned_to_application(UUID) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.is_expert_assigned_to_application(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_expert_assigned_to_application(UUID) TO authenticated;

-- 7. ENFORCEMENT TRIGGERS (Tamper-proofing critical columns)

-- Enforce Profile Security: Non-council users cannot alter their role, institution, region, or active state
CREATE OR REPLACE FUNCTION public.enforce_profile_update_integrity()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
LANGUAGE plpgsql AS $$
DECLARE
    v_caller_role public.user_role;
BEGIN
    v_caller_role := public.get_auth_role();

    IF v_caller_role IS DISTINCT FROM 'council_admin' THEN
        IF NEW.role IS DISTINCT FROM OLD.role THEN
            RAISE EXCEPTION 'Unauthorized: Users cannot alter their own role.';
        END IF;
        IF NEW.institution_id IS DISTINCT FROM OLD.institution_id THEN
            RAISE EXCEPTION 'Unauthorized: Users cannot change their assigned institution.';
        END IF;
        IF NEW.region_id IS DISTINCT FROM OLD.region_id THEN
            RAISE EXCEPTION 'Unauthorized: Users cannot change their assigned region.';
        END IF;
        IF NEW.is_active IS DISTINCT FROM OLD.is_active THEN
            RAISE EXCEPTION 'Unauthorized: Users cannot modify account activation status.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_enforce_integrity ON public.profiles;
CREATE TRIGGER trg_profiles_enforce_integrity BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.enforce_profile_update_integrity();

-- Enforce Application Security: Rigorous field-level authorization and status transitions
CREATE OR REPLACE FUNCTION public.enforce_application_integrity()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
LANGUAGE plpgsql AS $$
DECLARE
    v_caller_role public.user_role;
    v_inst_id UUID;
    v_inst_region UUID;
    v_valid_transition BOOLEAN := false;
BEGIN
    v_caller_role := public.get_auth_role();

    -- On ALL INSERTS: Ensure region strictly matches registered institution's region
    IF TG_OP = 'INSERT' THEN
        SELECT i.region_id INTO v_inst_region
        FROM public.institutions i
        WHERE i.id = NEW.institution_id;

        IF v_inst_region IS NULL THEN
            RAISE EXCEPTION 'Referenced institution does not exist or has no registered region.';
        END IF;

        IF NEW.region_id IS DISTINCT FROM v_inst_region THEN
            RAISE EXCEPTION 'Unauthorized: Application region must match institution registered region.';
        END IF;

        IF v_caller_role IN ('institution_admin', 'institution_user') THEN
            v_inst_id := public.get_auth_institution_id();
            IF NEW.institution_id IS DISTINCT FROM v_inst_id THEN
                RAISE EXCEPTION 'Unauthorized: Cannot create application for another institution.';
            END IF;

            -- New applications must start in draft
            IF NEW.status IS DISTINCT FROM 'draft' THEN
                RAISE EXCEPTION 'Unauthorized: New applications must be created in draft status.';
            END IF;
            IF NEW.current_stage IS DISTINCT FROM 'draft' THEN
                RAISE EXCEPTION 'Unauthorized: New applications must start in draft stage.';
            END IF;
            IF NEW.submission_date IS NOT NULL THEN
                RAISE EXCEPTION 'Unauthorized: submission_date cannot be set on creation.';
            END IF;
            IF NEW.target_decision_date IS NOT NULL THEN
                RAISE EXCEPTION 'Unauthorized: target_decision_date cannot be set by applicant.';
            END IF;
        END IF;
    END IF;

    -- On UPDATE: Rigorous field-level validation across every role
    IF TG_OP = 'UPDATE' THEN
        -- Universal Immutable Primary & Foreign Key Protections
        IF NEW.id IS DISTINCT FROM OLD.id THEN
            RAISE EXCEPTION 'Cannot alter application primary key.';
        END IF;
        IF NEW.institution_id IS DISTINCT FROM OLD.institution_id THEN
            RAISE EXCEPTION 'Cannot alter application institution assignment.';
        END IF;
        IF NEW.region_id IS DISTINCT FROM OLD.region_id THEN
            RAISE EXCEPTION 'Cannot alter application region.';
        END IF;
        IF NEW.application_number IS DISTINCT FROM OLD.application_number THEN
            RAISE EXCEPTION 'Cannot alter application number.';
        END IF;
        IF NEW.created_at IS DISTINCT FROM OLD.created_at THEN
            RAISE EXCEPTION 'Cannot alter application creation timestamp.';
        END IF;

        -- Prevent direct manual alteration of current_stage without an authorized status change
        IF NEW.current_stage IS DISTINCT FROM OLD.current_stage AND NEW.status IS NOT DISTINCT FROM OLD.status THEN
            RAISE EXCEPTION 'Unauthorized: current_stage cannot be altered directly without an authorized status transition.';
        END IF;

        -- 1. ROLE: institution_admin & institution_user
        IF v_caller_role IN ('institution_admin', 'institution_user') THEN
            IF OLD.status IS DISTINCT FROM 'draft' THEN
                RAISE EXCEPTION 'Unauthorized: Institutions cannot modify an application once submitted.';
            END IF;

            IF NEW.workflow_definition_id IS DISTINCT FROM OLD.workflow_definition_id THEN
                RAISE EXCEPTION 'Unauthorized: Institutions cannot alter workflow definition.';
            END IF;
            IF NEW.target_decision_date IS DISTINCT FROM OLD.target_decision_date THEN
                RAISE EXCEPTION 'Unauthorized: Institutions cannot alter target decision date.';
            END IF;
            IF NEW.academic_year IS DISTINCT FROM OLD.academic_year THEN
                RAISE EXCEPTION 'Unauthorized: Institutions cannot alter academic year after creation.';
            END IF;
            IF NEW.application_type IS DISTINCT FROM OLD.application_type THEN
                RAISE EXCEPTION 'Unauthorized: Institutions cannot alter application type after creation.';
            END IF;

            -- Status transition check for institutions
            IF NEW.status = 'submitted' THEN
                NEW.current_stage := 'submitted';
                NEW.submission_date := NOW();
            ELSIF NEW.status IS DISTINCT FROM 'draft' THEN
                RAISE EXCEPTION 'Unauthorized: Invalid status transition for institution.';
            END IF;

        -- 2. ROLE: scrutiny_officer
        ELSIF v_caller_role = 'scrutiny_officer' THEN
            -- Scrutiny officers cannot alter applicant metadata, submission dates, or workflow assignment
            IF NEW.metadata IS DISTINCT FROM OLD.metadata THEN
                RAISE EXCEPTION 'Unauthorized: Scrutiny officers cannot alter applicant application metadata.';
            END IF;
            IF NEW.submission_date IS DISTINCT FROM OLD.submission_date THEN
                RAISE EXCEPTION 'Unauthorized: Scrutiny officers cannot alter submission date.';
            END IF;
            IF NEW.target_decision_date IS DISTINCT FROM OLD.target_decision_date THEN
                RAISE EXCEPTION 'Unauthorized: Scrutiny officers cannot alter target decision date.';
            END IF;
            IF NEW.workflow_definition_id IS DISTINCT FROM OLD.workflow_definition_id THEN
                RAISE EXCEPTION 'Unauthorized: Scrutiny officers cannot alter workflow definition.';
            END IF;
            IF NEW.academic_year IS DISTINCT FROM OLD.academic_year OR NEW.application_type IS DISTINCT FROM OLD.application_type THEN
                RAISE EXCEPTION 'Unauthorized: Scrutiny officers cannot alter application type or academic year.';
            END IF;

            IF NEW.status IS DISTINCT FROM OLD.status THEN
                IF OLD.status = 'submitted' AND NEW.status = 'under_scrutiny' THEN
                    v_valid_transition := true;
                ELSIF OLD.status = 'under_scrutiny' AND NEW.status IN ('scrutiny_clarification_sought', 'scrutiny_cleared') THEN
                    v_valid_transition := true;
                ELSIF OLD.status = 'scrutiny_clarification_sought' AND NEW.status = 'under_scrutiny' THEN
                    v_valid_transition := true;
                ELSE
                    v_valid_transition := false;
                END IF;

                IF NOT v_valid_transition THEN
                    RAISE EXCEPTION 'Unauthorized: Scrutiny officer not permitted transition from % to %.', OLD.status, NEW.status;
                END IF;
                NEW.current_stage := NEW.status::text;
            END IF;

        -- 3. ROLE: regional_officer
        ELSIF v_caller_role = 'regional_officer' THEN
            -- Regional officers cannot alter applicant metadata, submission date, or workflow assignment
            IF NEW.metadata IS DISTINCT FROM OLD.metadata THEN
                RAISE EXCEPTION 'Unauthorized: Regional officers cannot alter applicant application metadata.';
            END IF;
            IF NEW.submission_date IS DISTINCT FROM OLD.submission_date THEN
                RAISE EXCEPTION 'Unauthorized: Regional officers cannot alter submission date.';
            END IF;
            IF NEW.workflow_definition_id IS DISTINCT FROM OLD.workflow_definition_id THEN
                RAISE EXCEPTION 'Unauthorized: Regional officers cannot alter workflow definition.';
            END IF;
            IF NEW.academic_year IS DISTINCT FROM OLD.academic_year OR NEW.application_type IS DISTINCT FROM OLD.application_type THEN
                RAISE EXCEPTION 'Unauthorized: Regional officers cannot alter application type or academic year.';
            END IF;

            IF NEW.status IS DISTINCT FROM OLD.status THEN
                IF OLD.status = 'submitted' AND NEW.status IN ('under_scrutiny', 'withdrawn') THEN
                    v_valid_transition := true;
                ELSIF OLD.status = 'under_scrutiny' AND NEW.status IN ('scrutiny_clarification_sought', 'scrutiny_cleared') THEN
                    v_valid_transition := true;
                ELSIF OLD.status = 'scrutiny_clarification_sought' AND NEW.status IN ('under_scrutiny', 'withdrawn') THEN
                    v_valid_transition := true;
                ELSIF OLD.status = 'scrutiny_cleared' AND NEW.status IN ('evc_scheduled', 'council_decision_pending') THEN
                    v_valid_transition := true;
                ELSIF OLD.status = 'evc_scheduled' AND NEW.status IN ('evc_completed', 'scrutiny_clarification_sought') THEN
                    v_valid_transition := true;
                ELSIF OLD.status = 'evc_completed' AND NEW.status IN ('sac_review', 'council_decision_pending') THEN
                    v_valid_transition := true;
                ELSIF OLD.status = 'sac_review' AND NEW.status IN ('council_decision_pending', 'scrutiny_clarification_sought') THEN
                    v_valid_transition := true;
                ELSE
                    v_valid_transition := false;
                END IF;

                IF NOT v_valid_transition THEN
                    RAISE EXCEPTION 'Unauthorized: Regional officer not permitted transition from % to %. Final approval/rejection requires council administration.', OLD.status, NEW.status;
                END IF;
                NEW.current_stage := NEW.status::text;
            END IF;

        -- 4. ROLE: council_admin
        ELSIF v_caller_role = 'council_admin' THEN
            -- Council administrators can manage authorized workflow fields but must not bypass required status-transition rules
            IF NEW.status IS DISTINCT FROM OLD.status THEN
                CASE OLD.status
                    WHEN 'draft' THEN v_valid_transition := (NEW.status = 'submitted');
                    WHEN 'submitted' THEN v_valid_transition := (NEW.status IN ('under_scrutiny', 'withdrawn', 'rejected'));
                    WHEN 'under_scrutiny' THEN v_valid_transition := (NEW.status IN ('scrutiny_clarification_sought', 'scrutiny_cleared', 'rejected'));
                    WHEN 'scrutiny_clarification_sought' THEN v_valid_transition := (NEW.status IN ('under_scrutiny', 'withdrawn', 'rejected'));
                    WHEN 'scrutiny_cleared' THEN v_valid_transition := (NEW.status IN ('evc_scheduled', 'council_decision_pending', 'rejected'));
                    WHEN 'evc_scheduled' THEN v_valid_transition := (NEW.status IN ('evc_completed', 'scrutiny_clarification_sought', 'rejected'));
                    WHEN 'evc_completed' THEN v_valid_transition := (NEW.status IN ('sac_review', 'council_decision_pending', 'rejected'));
                    WHEN 'sac_review' THEN v_valid_transition := (NEW.status IN ('council_decision_pending', 'scrutiny_clarification_sought', 'rejected'));
                    WHEN 'council_decision_pending' THEN v_valid_transition := (NEW.status IN ('approved', 'rejected'));
                    ELSE v_valid_transition := false;
                END CASE;

                IF NOT v_valid_transition THEN
                    RAISE EXCEPTION 'Unauthorized: Council admin transition from % to % violates workflow rules.', OLD.status, NEW.status;
                END IF;
                NEW.current_stage := NEW.status::text;
            END IF;
        END IF;

        -- Automatically log application status change event if status changed
        IF NEW.status IS DISTINCT FROM OLD.status THEN
            INSERT INTO public.application_events (
                application_id,
                actor_id,
                event_type,
                from_status,
                to_status,
                description,
                event_payload,
                created_at
            ) VALUES (
                NEW.id,
                auth.uid(),
                'STATUS_CHANGE',
                OLD.status,
                NEW.status,
                'Application transition from ' || OLD.status::text || ' to ' || NEW.status::text,
                jsonb_build_object('by_role', v_caller_role::text, 'stage', NEW.current_stage),
                NOW()
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_applications_enforce_integrity ON public.applications;
CREATE TRIGGER trg_applications_enforce_integrity BEFORE INSERT OR UPDATE ON public.applications
FOR EACH ROW EXECUTE FUNCTION public.enforce_application_integrity();

-- Enforce Application Events Integrity: Clients cannot insert bogus STATUS_CHANGE events
CREATE OR REPLACE FUNCTION public.enforce_application_event_integrity()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
LANGUAGE plpgsql AS $$
DECLARE
    v_caller_role public.user_role;
BEGIN
    v_caller_role := public.get_auth_role();

    -- Authoritative STATUS_CHANGE events can ONLY be emitted by the database application trigger
    IF NEW.event_type = 'STATUS_CHANGE' AND v_caller_role IS NOT NULL THEN
        RAISE EXCEPTION 'Unauthorized: STATUS_CHANGE events are managed automatically by the application workflow engine.';
    END IF;

    -- Ensure actor matches caller
    IF v_caller_role IS NOT NULL AND NEW.actor_id IS DISTINCT FROM auth.uid() THEN
        RAISE EXCEPTION 'Unauthorized: Event actor_id must match authenticated user.';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_application_events_enforce_integrity ON public.application_events;
CREATE TRIGGER trg_application_events_enforce_integrity BEFORE INSERT ON public.application_events
FOR EACH ROW EXECUTE FUNCTION public.enforce_application_event_integrity();

-- Enforce Document Integrity: Must match application institution and lock storage/identity columns on update
CREATE OR REPLACE FUNCTION public.enforce_document_integrity()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
LANGUAGE plpgsql AS $$
DECLARE
    v_app_inst_id UUID;
    v_caller_role public.user_role;
BEGIN
    v_caller_role := public.get_auth_role();

    -- Verify application institution matches document institution
    IF NEW.application_id IS NOT NULL THEN
        SELECT institution_id INTO v_app_inst_id
        FROM public.applications
        WHERE id = NEW.application_id;

        IF v_app_inst_id IS NULL OR v_app_inst_id IS DISTINCT FROM NEW.institution_id THEN
            RAISE EXCEPTION 'Unauthorized: Document institution does not match application institution.';
        END IF;
    END IF;

    -- Protect immutable fields on update
    IF TG_OP = 'UPDATE' THEN
        IF NEW.id IS DISTINCT FROM OLD.id THEN
            RAISE EXCEPTION 'Cannot alter document primary key.';
        END IF;
        IF NEW.institution_id IS DISTINCT FROM OLD.institution_id THEN
            RAISE EXCEPTION 'Cannot alter document institution.';
        END IF;
        IF NEW.application_id IS DISTINCT FROM OLD.application_id THEN
            RAISE EXCEPTION 'Cannot rebind document to a different application.';
        END IF;
        IF NEW.storage_key IS DISTINCT FROM OLD.storage_key THEN
            RAISE EXCEPTION 'Cannot alter document storage key.';
        END IF;
        IF NEW.checksum_sha256 IS DISTINCT FROM OLD.checksum_sha256 THEN
            RAISE EXCEPTION 'Cannot alter document checksum.';
        END IF;
        IF NEW.file_size_bytes IS DISTINCT FROM OLD.file_size_bytes THEN
            RAISE EXCEPTION 'Cannot alter document file size.';
        END IF;
        IF NEW.uploaded_by IS DISTINCT FROM OLD.uploaded_by THEN
            RAISE EXCEPTION 'Cannot alter document uploader.';
        END IF;

        -- Non-officers cannot change verification status
        IF v_caller_role NOT IN ('council_admin', 'regional_officer', 'scrutiny_officer') THEN
            IF NEW.is_verified IS DISTINCT FROM OLD.is_verified OR
               NEW.verified_by IS DISTINCT FROM OLD.verified_by OR
               NEW.verified_at IS DISTINCT FROM OLD.verified_at THEN
                RAISE EXCEPTION 'Unauthorized: Only authorized officers can modify verification status.';
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_documents_enforce_integrity ON public.documents;
CREATE TRIGGER trg_documents_enforce_integrity BEFORE INSERT OR UPDATE ON public.documents
FOR EACH ROW EXECUTE FUNCTION public.enforce_document_integrity();

-- Enforce Compliance Submission Integrity: Must match application institution and lock submitted responses
CREATE OR REPLACE FUNCTION public.enforce_compliance_submission_integrity()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
LANGUAGE plpgsql AS $$
DECLARE
    v_app_inst_id UUID;
    v_caller_role public.user_role;
BEGIN
    v_caller_role := public.get_auth_role();

    SELECT institution_id INTO v_app_inst_id
    FROM public.applications
    WHERE id = NEW.application_id;

    IF v_app_inst_id IS NULL OR v_app_inst_id IS DISTINCT FROM NEW.institution_id THEN
        RAISE EXCEPTION 'Unauthorized: Compliance submission institution must match application institution.';
    END IF;

    IF TG_OP = 'UPDATE' THEN
        IF NEW.id IS DISTINCT FROM OLD.id THEN
            RAISE EXCEPTION 'Cannot alter compliance submission id.';
        END IF;
        IF NEW.application_id IS DISTINCT FROM OLD.application_id THEN
            RAISE EXCEPTION 'Cannot alter compliance application binding.';
        END IF;
        IF NEW.institution_id IS DISTINCT FROM OLD.institution_id THEN
            RAISE EXCEPTION 'Cannot alter compliance institution.';
        END IF;
        IF NEW.submitted_by IS DISTINCT FROM OLD.submitted_by THEN
            RAISE EXCEPTION 'Cannot alter submission author.';
        END IF;

        -- Field-level restrictions: Applicants cannot edit reviewer fields
        IF v_caller_role IN ('institution_admin', 'institution_user') THEN
            IF NEW.status IS DISTINCT FROM OLD.status OR
               NEW.review_comments IS DISTINCT FROM OLD.review_comments OR
               NEW.reviewed_by IS DISTINCT FROM OLD.reviewed_by OR
               NEW.reviewed_at IS DISTINCT FROM OLD.reviewed_at THEN
                RAISE EXCEPTION 'Unauthorized: Applicants cannot modify review status or reviewer comments.';
            END IF;
            IF OLD.status IS DISTINCT FROM 'pending' THEN
                RAISE EXCEPTION 'Unauthorized: Cannot modify compliance remarks once under officer review.';
            END IF;
        END IF;

        -- Reviewers cannot alter submitted applicant content
        IF v_caller_role IN ('regional_officer', 'scrutiny_officer') THEN
            IF NEW.compliance_remarks IS DISTINCT FROM OLD.compliance_remarks OR
               NEW.document_ids IS DISTINCT FROM OLD.document_ids OR
               NEW.deficiency_notice_ref IS DISTINCT FROM OLD.deficiency_notice_ref THEN
                RAISE EXCEPTION 'Unauthorized: Reviewers cannot alter applicant compliance remarks or submitted documents.';
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_compliance_enforce_integrity ON public.compliance_submissions;
CREATE TRIGGER trg_compliance_enforce_integrity BEFORE INSERT OR UPDATE ON public.compliance_submissions
FOR EACH ROW EXECUTE FUNCTION public.enforce_compliance_submission_integrity();

-- Enforce Undertaking Integrity: Prevent tampering with signed affirmations
CREATE OR REPLACE FUNCTION public.enforce_undertaking_integrity()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
LANGUAGE plpgsql AS $$
DECLARE
    v_caller_role public.user_role;
BEGIN
    v_caller_role := public.get_auth_role();

    IF TG_OP = 'UPDATE' THEN
        IF NEW.id IS DISTINCT FROM OLD.id THEN
            RAISE EXCEPTION 'Cannot alter undertaking primary key.';
        END IF;
        IF NEW.application_id IS DISTINCT FROM OLD.application_id THEN
            RAISE EXCEPTION 'Cannot alter undertaking application binding.';
        END IF;
        IF NEW.undertaking_type IS DISTINCT FROM OLD.undertaking_type THEN
            RAISE EXCEPTION 'Cannot alter undertaking type.';
        END IF;
        IF NEW.clause_text IS DISTINCT FROM OLD.clause_text THEN
            RAISE EXCEPTION 'Cannot alter signed clause text.';
        END IF;
        IF NEW.signed_by_profile_id IS DISTINCT FROM OLD.signed_by_profile_id THEN
            RAISE EXCEPTION 'Cannot alter signer profile reference.';
        END IF;
        IF NEW.digital_signature_hash IS DISTINCT FROM OLD.digital_signature_hash THEN
            RAISE EXCEPTION 'Cannot alter digital signature hash.';
        END IF;
        IF NEW.signed_at IS DISTINCT FROM OLD.signed_at THEN
            RAISE EXCEPTION 'Cannot alter signed timestamp.';
        END IF;
        IF NEW.ip_address IS DISTINCT FROM OLD.ip_address THEN
            RAISE EXCEPTION 'Cannot alter signer IP address.';
        END IF;

        IF v_caller_role NOT IN ('council_admin', 'regional_officer', 'scrutiny_officer') THEN
            IF NEW.is_verified IS DISTINCT FROM OLD.is_verified OR
               NEW.verified_by IS DISTINCT FROM OLD.verified_by OR
               NEW.verified_at IS DISTINCT FROM OLD.verified_at THEN
                RAISE EXCEPTION 'Unauthorized: Only authorized officers can verify undertakings.';
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_undertakings_enforce_integrity ON public.undertakings;
CREATE TRIGGER trg_undertakings_enforce_integrity BEFORE UPDATE ON public.undertakings
FOR EACH ROW EXECUTE FUNCTION public.enforce_undertaking_integrity();

-- Enforce EVC Visit Integrity: Protect committee assignment and enforce allowed visit status transitions
CREATE OR REPLACE FUNCTION public.enforce_evc_visit_integrity()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
LANGUAGE plpgsql AS $$
DECLARE
    v_caller_role public.user_role;
    v_valid_transition BOOLEAN := false;
BEGIN
    v_caller_role := public.get_auth_role();

    IF TG_OP = 'UPDATE' THEN
        IF NEW.id IS DISTINCT FROM OLD.id THEN
            RAISE EXCEPTION 'Cannot alter EVC visit primary key.';
        END IF;
        IF NEW.application_id IS DISTINCT FROM OLD.application_id THEN
            RAISE EXCEPTION 'Cannot alter EVC visit application binding.';
        END IF;

        -- Committee membership and lead expert assignment can ONLY be modified by regional officers or council admins
        IF v_caller_role = 'evc_expert' THEN
            IF NEW.lead_expert_id IS DISTINCT FROM OLD.lead_expert_id OR
               NEW.committee_members IS DISTINCT FROM OLD.committee_members OR
               NEW.scheduled_start IS DISTINCT FROM OLD.scheduled_start OR
               NEW.scheduled_end IS DISTINCT FROM OLD.scheduled_end THEN
                RAISE EXCEPTION 'Unauthorized: Experts cannot alter committee assignment or visit scheduling.';
            END IF;

            -- Allowed status transitions for EVC experts:
            -- scheduled -> in_progress -> report_submitted
            IF NEW.status IS DISTINCT FROM OLD.status THEN
                IF OLD.status = 'scheduled' AND NEW.status = 'in_progress' THEN
                    v_valid_transition := true;
                ELSIF OLD.status = 'in_progress' AND NEW.status = 'report_submitted' THEN
                    v_valid_transition := true;
                ELSE
                    v_valid_transition := false;
                END IF;

                IF NOT v_valid_transition THEN
                    RAISE EXCEPTION 'Unauthorized: EVC expert not permitted transition visit from % to %.', OLD.status, NEW.status;
                END IF;
            END IF;
        END IF;

        -- Only regional officers and council admins can mark an EVC visit as 'verified' or 'cancelled'
        IF v_caller_role IN ('regional_officer', 'council_admin') THEN
            IF NEW.status IS DISTINCT FROM OLD.status THEN
                IF OLD.status = 'report_submitted' AND NEW.status = 'verified' THEN
                    v_valid_transition := true;
                ELSIF NEW.status = 'cancelled' THEN
                    v_valid_transition := true;
                ELSIF OLD.status = 'scheduled' AND NEW.status IN ('in_progress', 'cancelled') THEN
                    v_valid_transition := true;
                ELSE
                    v_valid_transition := true; -- Administrative supervisor prerogative
                END IF;
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_evc_visits_enforce_integrity ON public.evc_visits;
CREATE TRIGGER trg_evc_visits_enforce_integrity BEFORE UPDATE ON public.evc_visits
FOR EACH ROW EXECUTE FUNCTION public.enforce_evc_visit_integrity();

-- Enforce Notification Events Integrity: Recipients may ONLY update is_read
CREATE OR REPLACE FUNCTION public.enforce_notification_integrity()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
LANGUAGE plpgsql AS $$
DECLARE
    v_caller_role public.user_role;
BEGIN
    v_caller_role := public.get_auth_role();

    IF TG_OP = 'UPDATE' THEN
        IF NEW.id IS DISTINCT FROM OLD.id OR
           NEW.recipient_profile_id IS DISTINCT FROM OLD.recipient_profile_id OR
           NEW.application_id IS DISTINCT FROM OLD.application_id OR
           NEW.channel IS DISTINCT FROM OLD.channel OR
           NEW.title IS DISTINCT FROM OLD.title OR
           NEW.content IS DISTINCT FROM OLD.content OR
           NEW.created_at IS DISTINCT FROM OLD.created_at THEN
            RAISE EXCEPTION 'Unauthorized: Cannot modify notification metadata or content.';
        END IF;

        -- Ordinary recipients cannot forge delivery timestamp
        IF v_caller_role NOT IN ('council_admin') AND NEW.delivered_at IS DISTINCT FROM OLD.delivered_at THEN
            RAISE EXCEPTION 'Unauthorized: delivered_at is managed server-side by the notification delivery worker.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notifications_enforce_integrity ON public.notification_events;
CREATE TRIGGER trg_notifications_enforce_integrity BEFORE UPDATE ON public.notification_events
FOR EACH ROW EXECUTE FUNCTION public.enforce_notification_integrity();

-- Enforce Workflow Tasks Integrity: Prevent rebinding tasks to different applications or stages
CREATE OR REPLACE FUNCTION public.enforce_task_integrity()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        IF NEW.application_id IS DISTINCT FROM OLD.application_id THEN
            RAISE EXCEPTION 'Cannot reassign task to a different application.';
        END IF;
        IF NEW.stage_key IS DISTINCT FROM OLD.stage_key THEN
            RAISE EXCEPTION 'Cannot reassign task stage key.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_workflow_tasks_enforce_integrity ON public.workflow_tasks;
CREATE TRIGGER trg_workflow_tasks_enforce_integrity BEFORE UPDATE ON public.workflow_tasks
FOR EACH ROW EXECUTE FUNCTION public.enforce_task_integrity();

-- Enforce Escalation Integrity: Validate task belongs to application
CREATE OR REPLACE FUNCTION public.enforce_escalation_integrity()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
LANGUAGE plpgsql AS $$
DECLARE
    v_task_app_id UUID;
BEGIN
    IF NEW.task_id IS NOT NULL THEN
        SELECT application_id INTO v_task_app_id
        FROM public.workflow_tasks
        WHERE id = NEW.task_id;

        IF v_task_app_id IS NULL OR v_task_app_id IS DISTINCT FROM NEW.application_id THEN
            RAISE EXCEPTION 'Unauthorized: Escalation task does not belong to the specified application.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_escalations_enforce_integrity ON public.escalations;
CREATE TRIGGER trg_escalations_enforce_integrity BEFORE INSERT OR UPDATE ON public.escalations
FOR EACH ROW EXECUTE FUNCTION public.enforce_escalation_integrity();

-- 8. AUDIT RECORDING TRIGGER FUNCTION
-- Strictly SECURITY DEFINER and writes automatically from table triggers
-- Sanitizes passwords, tokens, full signature hashes, and IP addresses
CREATE OR REPLACE FUNCTION public.record_audit_log()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
LANGUAGE plpgsql AS $$
DECLARE
    v_record_id UUID;
    v_old_data JSONB := NULL;
    v_new_data JSONB := NULL;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        v_record_id := OLD.id;
        v_old_data := to_jsonb(OLD);
    ELSIF (TG_OP = 'UPDATE') THEN
        v_record_id := NEW.id;
        v_old_data := to_jsonb(OLD);
        v_new_data := to_jsonb(NEW);
    ELSIF (TG_OP = 'INSERT') THEN
        v_record_id := NEW.id;
        v_new_data := to_jsonb(NEW);
    END IF;

    -- Strip sensitive credential keys
    IF v_old_data ? 'password' THEN v_old_data := v_old_data - 'password'; END IF;
    IF v_old_data ? 'token' THEN v_old_data := v_old_data - 'token'; END IF;
    IF v_new_data ? 'password' THEN v_new_data := v_new_data - 'password'; END IF;
    IF v_new_data ? 'token' THEN v_new_data := v_new_data - 'token'; END IF;

    -- Redact sensitive signature hashes to last 8 characters for accountability without key leakage
    IF v_old_data ? 'digital_signature_hash' THEN
        v_old_data := jsonb_set(v_old_data, '{digital_signature_hash}', to_jsonb('***' || right(v_old_data->>'digital_signature_hash', 8)));
    END IF;
    IF v_new_data ? 'digital_signature_hash' THEN
        v_new_data := jsonb_set(v_new_data, '{digital_signature_hash}', to_jsonb('***' || right(v_new_data->>'digital_signature_hash', 8)));
    END IF;

    -- Redact raw IP addresses from audit data payload
    IF v_old_data ? 'ip_address' THEN
        v_old_data := jsonb_set(v_old_data, '{ip_address}', '"REDACTED_FOR_PRIVACY"'::jsonb);
    END IF;
    IF v_new_data ? 'ip_address' THEN
        v_new_data := jsonb_set(v_new_data, '{ip_address}', '"REDACTED_FOR_PRIVACY"'::jsonb);
    END IF;

    INSERT INTO public.audit_logs (
        table_name,
        record_id,
        operation,
        changed_by,
        old_data,
        new_data,
        created_at
    ) VALUES (
        TG_TABLE_NAME,
        v_record_id,
        TG_OP,
        auth.uid(),
        v_old_data,
        v_new_data,
        NOW()
    );

    IF (TG_OP = 'DELETE') THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$;

-- Attach audit log triggers to all core domain and administrative entities
DROP TRIGGER IF EXISTS trg_audit_regions ON public.regions;
CREATE TRIGGER trg_audit_regions AFTER INSERT OR UPDATE OR DELETE ON public.regions
FOR EACH ROW EXECUTE FUNCTION public.record_audit_log();

DROP TRIGGER IF EXISTS trg_audit_institutions ON public.institutions;
CREATE TRIGGER trg_audit_institutions AFTER INSERT OR UPDATE OR DELETE ON public.institutions
FOR EACH ROW EXECUTE FUNCTION public.record_audit_log();

DROP TRIGGER IF EXISTS trg_audit_profiles ON public.profiles;
CREATE TRIGGER trg_audit_profiles AFTER INSERT OR UPDATE OR DELETE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.record_audit_log();

DROP TRIGGER IF EXISTS trg_audit_workflow_definitions ON public.workflow_definitions;
CREATE TRIGGER trg_audit_workflow_definitions AFTER INSERT OR UPDATE OR DELETE ON public.workflow_definitions
FOR EACH ROW EXECUTE FUNCTION public.record_audit_log();

DROP TRIGGER IF EXISTS trg_audit_deadline_policies ON public.deadline_policies;
CREATE TRIGGER trg_audit_deadline_policies AFTER INSERT OR UPDATE OR DELETE ON public.deadline_policies
FOR EACH ROW EXECUTE FUNCTION public.record_audit_log();

DROP TRIGGER IF EXISTS trg_audit_applications ON public.applications;
CREATE TRIGGER trg_audit_applications AFTER INSERT OR UPDATE OR DELETE ON public.applications
FOR EACH ROW EXECUTE FUNCTION public.record_audit_log();

DROP TRIGGER IF EXISTS trg_audit_workflow_tasks ON public.workflow_tasks;
CREATE TRIGGER trg_audit_workflow_tasks AFTER INSERT OR UPDATE OR DELETE ON public.workflow_tasks
FOR EACH ROW EXECUTE FUNCTION public.record_audit_log();

DROP TRIGGER IF EXISTS trg_audit_application_events ON public.application_events;
CREATE TRIGGER trg_audit_application_events AFTER INSERT OR UPDATE OR DELETE ON public.application_events
FOR EACH ROW EXECUTE FUNCTION public.record_audit_log();

DROP TRIGGER IF EXISTS trg_audit_evc_visits ON public.evc_visits;
CREATE TRIGGER trg_audit_evc_visits AFTER INSERT OR UPDATE OR DELETE ON public.evc_visits
FOR EACH ROW EXECUTE FUNCTION public.record_audit_log();

DROP TRIGGER IF EXISTS trg_audit_undertakings ON public.undertakings;
CREATE TRIGGER trg_audit_undertakings AFTER INSERT OR UPDATE OR DELETE ON public.undertakings
FOR EACH ROW EXECUTE FUNCTION public.record_audit_log();

DROP TRIGGER IF EXISTS trg_audit_documents ON public.documents;
CREATE TRIGGER trg_audit_documents AFTER INSERT OR UPDATE OR DELETE ON public.documents
FOR EACH ROW EXECUTE FUNCTION public.record_audit_log();

DROP TRIGGER IF EXISTS trg_audit_compliance_submissions ON public.compliance_submissions;
CREATE TRIGGER trg_audit_compliance_submissions AFTER INSERT OR UPDATE OR DELETE ON public.compliance_submissions
FOR EACH ROW EXECUTE FUNCTION public.record_audit_log();

DROP TRIGGER IF EXISTS trg_audit_escalations ON public.escalations;
CREATE TRIGGER trg_audit_escalations AFTER INSERT OR UPDATE OR DELETE ON public.escalations
FOR EACH ROW EXECUTE FUNCTION public.record_audit_log();

DROP TRIGGER IF EXISTS trg_audit_notification_events ON public.notification_events;
CREATE TRIGGER trg_audit_notification_events AFTER INSERT OR UPDATE OR DELETE ON public.notification_events
FOR EACH ROW EXECUTE FUNCTION public.record_audit_log();

-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- Default: Deny all operations unless explicitly permitted.

ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deadline_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evc_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.undertakings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escalations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- POLICIES: regions
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated users can view active regions" ON public.regions;
CREATE POLICY "Authenticated users can view active regions" ON public.regions FOR SELECT
TO authenticated
USING (is_active = true OR public.get_auth_role() IN ('council_admin', 'system_auditor'));

DROP POLICY IF EXISTS "Council admins can insert regions" ON public.regions;
CREATE POLICY "Council admins can insert regions" ON public.regions FOR INSERT
TO authenticated
WITH CHECK (public.get_auth_role() = 'council_admin');

DROP POLICY IF EXISTS "Council admins can update regions" ON public.regions;
CREATE POLICY "Council admins can update regions" ON public.regions FOR UPDATE
TO authenticated
USING (public.get_auth_role() = 'council_admin')
WITH CHECK (public.get_auth_role() = 'council_admin');

DROP POLICY IF EXISTS "Council admins can delete regions" ON public.regions;
CREATE POLICY "Council admins can delete regions" ON public.regions FOR DELETE
TO authenticated
USING (public.get_auth_role() = 'council_admin');

-- ------------------------------------------------------------------------------
-- POLICIES: institutions
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Institutions view own record, Officers view region, Council views all" ON public.institutions;
CREATE POLICY "Institutions view own record, Officers view region, Council views all" ON public.institutions FOR SELECT
TO authenticated
USING (
    id = public.get_auth_institution_id()
    OR (region_id = public.get_auth_region_id() AND public.get_auth_role() IN ('regional_officer', 'scrutiny_officer'))
    OR public.get_auth_role() IN ('council_admin', 'system_auditor', 'evc_expert')
);

DROP POLICY IF EXISTS "Institution admin can update own institution contact details" ON public.institutions;
CREATE POLICY "Institution admin can update own institution contact details" ON public.institutions FOR UPDATE
TO authenticated
USING (
    id = public.get_auth_institution_id()
    AND public.get_auth_role() = 'institution_admin'
)
WITH CHECK (
    id = public.get_auth_institution_id()
    AND public.get_auth_role() = 'institution_admin'
);

DROP POLICY IF EXISTS "Council admins can insert institutions" ON public.institutions;
CREATE POLICY "Council admins can insert institutions" ON public.institutions FOR INSERT
TO authenticated
WITH CHECK (public.get_auth_role() = 'council_admin');

DROP POLICY IF EXISTS "Council admins can update institutions" ON public.institutions;
CREATE POLICY "Council admins can update institutions" ON public.institutions FOR UPDATE
TO authenticated
USING (public.get_auth_role() = 'council_admin')
WITH CHECK (public.get_auth_role() = 'council_admin');

DROP POLICY IF EXISTS "Council admins can delete institutions" ON public.institutions;
CREATE POLICY "Council admins can delete institutions" ON public.institutions FOR DELETE
TO authenticated
USING (public.get_auth_role() = 'council_admin');

-- ------------------------------------------------------------------------------
-- POLICIES: profiles
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can read own profile and team profiles" ON public.profiles;
CREATE POLICY "Users can read own profile and team profiles" ON public.profiles FOR SELECT
TO authenticated
USING (
    id = auth.uid()
    OR (institution_id IS NOT NULL AND institution_id = public.get_auth_institution_id() AND public.get_auth_role() = 'institution_admin')
    OR (region_id IS NOT NULL AND region_id = public.get_auth_region_id() AND public.get_auth_role() = 'regional_officer')
    OR public.get_auth_role() IN ('council_admin', 'system_auditor')
);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Council admins can manage profiles" ON public.profiles;
CREATE POLICY "Council admins can manage profiles" ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (public.get_auth_role() = 'council_admin');

DROP POLICY IF EXISTS "Council admins can update any profile" ON public.profiles;
CREATE POLICY "Council admins can update any profile" ON public.profiles FOR UPDATE
TO authenticated
USING (public.get_auth_role() = 'council_admin')
WITH CHECK (public.get_auth_role() = 'council_admin');

DROP POLICY IF EXISTS "Council admins can delete profiles" ON public.profiles;
CREATE POLICY "Council admins can delete profiles" ON public.profiles FOR DELETE
TO authenticated
USING (public.get_auth_role() = 'council_admin');

-- ------------------------------------------------------------------------------
-- POLICIES: workflow_definitions & deadline_policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated users can view active workflows" ON public.workflow_definitions;
CREATE POLICY "Authenticated users can view active workflows" ON public.workflow_definitions FOR SELECT
TO authenticated
USING (is_active = true OR public.get_auth_role() IN ('council_admin', 'system_auditor'));

DROP POLICY IF EXISTS "Council admins can insert workflows" ON public.workflow_definitions;
CREATE POLICY "Council admins can insert workflows" ON public.workflow_definitions FOR INSERT
TO authenticated
WITH CHECK (public.get_auth_role() = 'council_admin');

DROP POLICY IF EXISTS "Council admins can update workflows" ON public.workflow_definitions;
CREATE POLICY "Council admins can update workflows" ON public.workflow_definitions FOR UPDATE
TO authenticated
USING (public.get_auth_role() = 'council_admin')
WITH CHECK (public.get_auth_role() = 'council_admin');

DROP POLICY IF EXISTS "Council admins can delete workflows" ON public.workflow_definitions;
CREATE POLICY "Council admins can delete workflows" ON public.workflow_definitions FOR DELETE
TO authenticated
USING (public.get_auth_role() = 'council_admin');

DROP POLICY IF EXISTS "Authenticated users can view active deadline policies" ON public.deadline_policies;
CREATE POLICY "Authenticated users can view active deadline policies" ON public.deadline_policies FOR SELECT
TO authenticated
USING (is_active = true OR public.get_auth_role() IN ('council_admin', 'system_auditor'));

DROP POLICY IF EXISTS "Council admins can insert deadline policies" ON public.deadline_policies;
CREATE POLICY "Council admins can insert deadline policies" ON public.deadline_policies FOR INSERT
TO authenticated
WITH CHECK (public.get_auth_role() = 'council_admin');

DROP POLICY IF EXISTS "Council admins can update deadline policies" ON public.deadline_policies;
CREATE POLICY "Council admins can update deadline policies" ON public.deadline_policies FOR UPDATE
TO authenticated
USING (public.get_auth_role() = 'council_admin')
WITH CHECK (public.get_auth_role() = 'council_admin');

DROP POLICY IF EXISTS "Council admins can delete deadline policies" ON public.deadline_policies;
CREATE POLICY "Council admins can delete deadline policies" ON public.deadline_policies FOR DELETE
TO authenticated
USING (public.get_auth_role() = 'council_admin');

-- ------------------------------------------------------------------------------
-- POLICIES: applications
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Read applications based on institution, region, or council role" ON public.applications;
CREATE POLICY "Read applications based on institution, region, or council role" ON public.applications FOR SELECT
TO authenticated
USING (
    institution_id = public.get_auth_institution_id()
    OR (region_id = public.get_auth_region_id() AND public.get_auth_role() IN ('regional_officer', 'scrutiny_officer'))
    OR public.get_auth_role() IN ('council_admin', 'system_auditor')
    OR (public.get_auth_role() = 'evc_expert' AND public.is_expert_assigned_to_application(id))
);

DROP POLICY IF EXISTS "Institutions can create draft applications" ON public.applications;
CREATE POLICY "Institutions can create draft applications" ON public.applications FOR INSERT
TO authenticated
WITH CHECK (
    institution_id = public.get_auth_institution_id()
    AND public.get_auth_role() IN ('institution_admin', 'institution_user')
    AND status = 'draft'
);

DROP POLICY IF EXISTS "Institutions can update draft applications" ON public.applications;
CREATE POLICY "Institutions can update draft applications" ON public.applications FOR UPDATE
TO authenticated
USING (
    institution_id = public.get_auth_institution_id()
    AND public.get_auth_role() IN ('institution_admin', 'institution_user')
    AND status = 'draft'
)
WITH CHECK (
    institution_id = public.get_auth_institution_id()
    AND public.get_auth_role() IN ('institution_admin', 'institution_user')
    AND status IN ('draft', 'submitted')
);

DROP POLICY IF EXISTS "Council admins and regional officers can update application statuses" ON public.applications;
CREATE POLICY "Council admins and regional officers can update application statuses" ON public.applications FOR UPDATE
TO authenticated
USING (
    public.get_auth_role() = 'council_admin'
    OR (public.get_auth_role() = 'regional_officer' AND region_id = public.get_auth_region_id())
    OR (public.get_auth_role() = 'scrutiny_officer' AND region_id = public.get_auth_region_id() AND status IN ('submitted', 'under_scrutiny', 'scrutiny_clarification_sought'))
)
WITH CHECK (
    public.get_auth_role() = 'council_admin'
    OR (public.get_auth_role() = 'regional_officer' AND region_id = public.get_auth_region_id() AND status IN ('under_scrutiny', 'scrutiny_clarification_sought', 'scrutiny_cleared', 'evc_scheduled', 'evc_completed', 'sac_review', 'council_decision_pending', 'withdrawn'))
    OR (public.get_auth_role() = 'scrutiny_officer' AND region_id = public.get_auth_region_id() AND status IN ('under_scrutiny', 'scrutiny_clarification_sought', 'scrutiny_cleared'))
);

-- ------------------------------------------------------------------------------
-- POLICIES: workflow_tasks
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Read workflow tasks based on application access" ON public.workflow_tasks;
CREATE POLICY "Read workflow tasks based on application access" ON public.workflow_tasks FOR SELECT
TO authenticated
USING (
    assigned_to = auth.uid()
    OR public.get_auth_role() IN ('council_admin', 'system_auditor')
    OR EXISTS (
        SELECT 1 FROM public.applications a
        WHERE a.id = workflow_tasks.application_id
        AND (
            a.institution_id = public.get_auth_institution_id()
            OR (a.region_id = public.get_auth_region_id() AND public.get_auth_role() IN ('regional_officer', 'scrutiny_officer'))
        )
    )
);

DROP POLICY IF EXISTS "Assigned officers or regional supervisors can update workflow tasks" ON public.workflow_tasks;
CREATE POLICY "Assigned officers or regional supervisors can update workflow tasks" ON public.workflow_tasks FOR UPDATE
TO authenticated
USING (
    (assigned_to = auth.uid() AND public.is_officer_assigned_to_application(application_id))
    OR public.get_auth_role() = 'council_admin'
    OR (public.get_auth_role() = 'regional_officer' AND public.is_officer_assigned_to_application(application_id))
)
WITH CHECK (
    (assigned_to = auth.uid() AND public.is_officer_assigned_to_application(application_id))
    OR public.get_auth_role() = 'council_admin'
    OR (public.get_auth_role() = 'regional_officer' AND public.is_officer_assigned_to_application(application_id))
);

DROP POLICY IF EXISTS "Officers and council admins can insert workflow tasks" ON public.workflow_tasks;
CREATE POLICY "Officers and council admins can insert workflow tasks" ON public.workflow_tasks FOR INSERT
TO authenticated
WITH CHECK (
    public.get_auth_role() = 'council_admin'
    OR (
        public.get_auth_role() IN ('regional_officer', 'scrutiny_officer')
        AND public.is_officer_assigned_to_application(application_id)
    )
);

-- ------------------------------------------------------------------------------
-- POLICIES: application_events (Append-only)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Read application events based on application access" ON public.application_events;
CREATE POLICY "Read application events based on application access" ON public.application_events FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.applications a
        WHERE a.id = application_events.application_id
        AND (
            a.institution_id = public.get_auth_institution_id()
            OR (a.region_id = public.get_auth_region_id() AND public.get_auth_role() IN ('regional_officer', 'scrutiny_officer'))
            OR public.get_auth_role() IN ('council_admin', 'system_auditor')
            OR (public.get_auth_role() = 'evc_expert' AND public.is_expert_assigned_to_application(a.id))
        )
    )
);

DROP POLICY IF EXISTS "Authorized users can record application events" ON public.application_events;
CREATE POLICY "Authorized users can record application events" ON public.application_events FOR INSERT
TO authenticated
WITH CHECK (
    actor_id = auth.uid()
    AND (
        (public.get_auth_role() IN ('institution_admin', 'institution_user') AND EXISTS (
            SELECT 1 FROM public.applications a
            WHERE a.id = application_events.application_id
            AND a.institution_id = public.get_auth_institution_id()
        ))
        OR (public.get_auth_role() IN ('regional_officer', 'scrutiny_officer') AND public.is_officer_assigned_to_application(application_id))
        OR (public.get_auth_role() = 'evc_expert' AND public.is_expert_assigned_to_application(application_id))
        OR public.get_auth_role() = 'council_admin'
    )
);

-- ------------------------------------------------------------------------------
-- POLICIES: evc_visits
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Read EVC visits" ON public.evc_visits;
CREATE POLICY "Read EVC visits" ON public.evc_visits FOR SELECT
TO authenticated
USING (
    lead_expert_id = auth.uid()
    OR committee_members @> to_jsonb(auth.uid()::text)
    OR public.get_auth_role() IN ('council_admin', 'system_auditor')
    OR EXISTS (
        SELECT 1 FROM public.applications a
        WHERE a.id = evc_visits.application_id
        AND (
            a.institution_id = public.get_auth_institution_id()
            OR (a.region_id = public.get_auth_region_id() AND public.get_auth_role() IN ('regional_officer', 'scrutiny_officer'))
        )
    )
);

DROP POLICY IF EXISTS "Council admins and regional officers can insert EVC visits" ON public.evc_visits;
CREATE POLICY "Council admins and regional officers can insert EVC visits" ON public.evc_visits FOR INSERT
TO authenticated
WITH CHECK (
    public.get_auth_role() = 'council_admin'
    OR (public.get_auth_role() = 'regional_officer' AND public.is_officer_assigned_to_application(application_id))
);

DROP POLICY IF EXISTS "Experts and officers can update EVC visits" ON public.evc_visits;
CREATE POLICY "Experts and officers can update EVC visits" ON public.evc_visits FOR UPDATE
TO authenticated
USING (
    public.get_auth_role() = 'council_admin'
    OR (public.get_auth_role() = 'regional_officer' AND public.is_officer_assigned_to_application(application_id))
    OR (public.get_auth_role() = 'evc_expert' AND (lead_expert_id = auth.uid() OR committee_members @> to_jsonb(auth.uid()::text)))
)
WITH CHECK (
    public.get_auth_role() = 'council_admin'
    OR (public.get_auth_role() = 'regional_officer' AND public.is_officer_assigned_to_application(application_id))
    OR (public.get_auth_role() = 'evc_expert' AND (lead_expert_id = auth.uid() OR committee_members @> to_jsonb(auth.uid()::text)))
);

-- ------------------------------------------------------------------------------
-- POLICIES: undertakings (Signed legal affirmations)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Read undertakings based on application access" ON public.undertakings;
CREATE POLICY "Read undertakings based on application access" ON public.undertakings FOR SELECT
TO authenticated
USING (
    signed_by_profile_id = auth.uid()
    OR public.get_auth_role() IN ('council_admin', 'system_auditor')
    OR EXISTS (
        SELECT 1 FROM public.applications a
        WHERE a.id = undertakings.application_id
        AND (
            a.institution_id = public.get_auth_institution_id()
            OR (a.region_id = public.get_auth_region_id() AND public.get_auth_role() IN ('regional_officer', 'scrutiny_officer'))
        )
    )
);

DROP POLICY IF EXISTS "Institution authorized signers can insert undertakings" ON public.undertakings;
CREATE POLICY "Institution authorized signers can insert undertakings" ON public.undertakings FOR INSERT
TO authenticated
WITH CHECK (
    signed_by_profile_id = auth.uid()
    AND public.get_auth_role() IN ('institution_admin', 'institution_user')
    AND is_verified = false
    AND verified_by IS NULL
    AND verified_at IS NULL
    AND EXISTS (
        SELECT 1 FROM public.applications a
        WHERE a.id = undertakings.application_id
        AND a.institution_id = public.get_auth_institution_id()
    )
);

DROP POLICY IF EXISTS "Authorized officers can verify undertakings" ON public.undertakings;
CREATE POLICY "Authorized officers can verify undertakings" ON public.undertakings FOR UPDATE
TO authenticated
USING (
    public.get_auth_role() = 'council_admin'
    OR (
        public.get_auth_role() IN ('regional_officer', 'scrutiny_officer')
        AND public.is_officer_assigned_to_application(application_id)
    )
)
WITH CHECK (
    public.get_auth_role() = 'council_admin'
    OR (
        public.get_auth_role() IN ('regional_officer', 'scrutiny_officer')
        AND public.is_officer_assigned_to_application(application_id)
    )
);

-- ------------------------------------------------------------------------------
-- POLICIES: documents
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Read documents based on institution or officer scope" ON public.documents;
CREATE POLICY "Read documents based on institution or officer scope" ON public.documents FOR SELECT
TO authenticated
USING (
    institution_id = public.get_auth_institution_id()
    OR public.get_auth_role() IN ('council_admin', 'system_auditor')
    OR EXISTS (
        SELECT 1 FROM public.institutions inst
        WHERE inst.id = documents.institution_id
        AND inst.region_id = public.get_auth_region_id()
        AND public.get_auth_role() IN ('regional_officer', 'scrutiny_officer')
    )
    OR (public.get_auth_role() = 'evc_expert' AND application_id IS NOT NULL AND public.is_expert_assigned_to_application(application_id))
);

DROP POLICY IF EXISTS "Institutions can upload documents for own institution" ON public.documents;
CREATE POLICY "Institutions can upload documents for own institution" ON public.documents FOR INSERT
TO authenticated
WITH CHECK (
    institution_id = public.get_auth_institution_id()
    AND uploaded_by = auth.uid()
    AND public.get_auth_role() IN ('institution_admin', 'institution_user')
    AND is_verified = false
    AND verified_by IS NULL
    AND verified_at IS NULL
    AND (
        application_id IS NULL OR EXISTS (
            SELECT 1 FROM public.applications a
            WHERE a.id = documents.application_id
            AND a.institution_id = public.get_auth_institution_id()
        )
    )
);

DROP POLICY IF EXISTS "Authorized officers and council admins can verify documents" ON public.documents;
CREATE POLICY "Authorized officers and council admins can verify documents" ON public.documents FOR UPDATE
TO authenticated
USING (
    public.get_auth_role() = 'council_admin'
    OR (
        public.get_auth_role() IN ('regional_officer', 'scrutiny_officer')
        AND (
            (application_id IS NOT NULL AND public.is_officer_assigned_to_application(application_id))
            OR EXISTS (
                SELECT 1 FROM public.institutions inst
                WHERE inst.id = documents.institution_id
                AND inst.region_id = public.get_auth_region_id()
            )
        )
    )
)
WITH CHECK (
    public.get_auth_role() = 'council_admin'
    OR (
        public.get_auth_role() IN ('regional_officer', 'scrutiny_officer')
        AND (
            (application_id IS NOT NULL AND public.is_officer_assigned_to_application(application_id))
            OR EXISTS (
                SELECT 1 FROM public.institutions inst
                WHERE inst.id = documents.institution_id
                AND inst.region_id = public.get_auth_region_id()
            )
        )
    )
);

-- ------------------------------------------------------------------------------
-- POLICIES: compliance_submissions
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Read compliance submissions" ON public.compliance_submissions;
CREATE POLICY "Read compliance submissions" ON public.compliance_submissions FOR SELECT
TO authenticated
USING (
    institution_id = public.get_auth_institution_id()
    OR public.get_auth_role() IN ('council_admin', 'system_auditor')
    OR EXISTS (
        SELECT 1 FROM public.institutions inst
        WHERE inst.id = compliance_submissions.institution_id
        AND inst.region_id = public.get_auth_region_id()
        AND public.get_auth_role() IN ('regional_officer', 'scrutiny_officer')
    )
);

DROP POLICY IF EXISTS "Institutions can insert compliance responses for own applications" ON public.compliance_submissions;
CREATE POLICY "Institutions can insert compliance responses for own applications" ON public.compliance_submissions FOR INSERT
TO authenticated
WITH CHECK (
    institution_id = public.get_auth_institution_id()
    AND submitted_by = auth.uid()
    AND public.get_auth_role() IN ('institution_admin', 'institution_user')
    AND status = 'pending'
    AND review_comments IS NULL
    AND reviewed_by IS NULL
    AND reviewed_at IS NULL
    AND EXISTS (
        SELECT 1 FROM public.applications a
        WHERE a.id = compliance_submissions.application_id
        AND a.institution_id = public.get_auth_institution_id()
    )
);

DROP POLICY IF EXISTS "Institutions can update pending compliance responses" ON public.compliance_submissions;
CREATE POLICY "Institutions can update pending compliance responses" ON public.compliance_submissions FOR UPDATE
TO authenticated
USING (
    institution_id = public.get_auth_institution_id()
    AND submitted_by = auth.uid()
    AND status = 'pending'
    AND public.get_auth_role() IN ('institution_admin', 'institution_user')
)
WITH CHECK (
    institution_id = public.get_auth_institution_id()
    AND submitted_by = auth.uid()
    AND status = 'pending'
    AND public.get_auth_role() IN ('institution_admin', 'institution_user')
);

DROP POLICY IF EXISTS "Regional and scrutiny officers can review compliance submissions" ON public.compliance_submissions;
CREATE POLICY "Regional and scrutiny officers can review compliance submissions" ON public.compliance_submissions FOR UPDATE
TO authenticated
USING (
    public.get_auth_role() = 'council_admin'
    OR (
        public.get_auth_role() IN ('regional_officer', 'scrutiny_officer')
        AND public.is_officer_assigned_to_application(application_id)
    )
)
WITH CHECK (
    public.get_auth_role() = 'council_admin'
    OR (
        public.get_auth_role() IN ('regional_officer', 'scrutiny_officer')
        AND public.is_officer_assigned_to_application(application_id)
    )
);

-- ------------------------------------------------------------------------------
-- POLICIES: escalations
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Read escalations" ON public.escalations;
CREATE POLICY "Read escalations" ON public.escalations FOR SELECT
TO authenticated
USING (
    public.get_auth_role() IN ('council_admin', 'system_auditor')
    OR EXISTS (
        SELECT 1 FROM public.applications a
        WHERE a.id = escalations.application_id
        AND (
            a.institution_id = public.get_auth_institution_id()
            OR (a.region_id = public.get_auth_region_id() AND public.get_auth_role() IN ('regional_officer', 'scrutiny_officer'))
        )
    )
);

DROP POLICY IF EXISTS "Officers and council admins can insert escalations" ON public.escalations;
CREATE POLICY "Officers and council admins can insert escalations" ON public.escalations FOR INSERT
TO authenticated
WITH CHECK (
    public.get_auth_role() = 'council_admin'
    OR (
        public.get_auth_role() IN ('regional_officer', 'scrutiny_officer')
        AND public.is_officer_assigned_to_application(application_id)
    )
);

DROP POLICY IF EXISTS "Officers and council admins can update escalations" ON public.escalations;
CREATE POLICY "Officers and council admins can update escalations" ON public.escalations FOR UPDATE
TO authenticated
USING (
    public.get_auth_role() = 'council_admin'
    OR (
        public.get_auth_role() IN ('regional_officer', 'scrutiny_officer')
        AND public.is_officer_assigned_to_application(application_id)
    )
)
WITH CHECK (
    public.get_auth_role() = 'council_admin'
    OR (
        public.get_auth_role() IN ('regional_officer', 'scrutiny_officer')
        AND public.is_officer_assigned_to_application(application_id)
    )
);

-- ------------------------------------------------------------------------------
-- POLICIES: notification_events
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can read own notification events" ON public.notification_events;
CREATE POLICY "Users can read own notification events" ON public.notification_events FOR SELECT
TO authenticated
USING (
    recipient_profile_id = auth.uid()
    OR public.get_auth_role() IN ('council_admin', 'system_auditor')
);

DROP POLICY IF EXISTS "Users can mark own notifications as read" ON public.notification_events;
CREATE POLICY "Users can mark own notifications as read" ON public.notification_events FOR UPDATE
TO authenticated
USING (recipient_profile_id = auth.uid())
WITH CHECK (recipient_profile_id = auth.uid());

DROP POLICY IF EXISTS "Officers and council admins can dispatch scoped notifications" ON public.notification_events;
CREATE POLICY "Officers and council admins can dispatch scoped notifications" ON public.notification_events FOR INSERT
TO authenticated
WITH CHECK (
    public.get_auth_role() = 'council_admin'
    OR (
        public.get_auth_role() IN ('regional_officer', 'scrutiny_officer')
        AND application_id IS NOT NULL
        AND public.is_officer_assigned_to_application(application_id)
        AND EXISTS (
            SELECT 1 FROM public.profiles recipient
            JOIN public.applications app ON app.id = notification_events.application_id
            WHERE recipient.id = notification_events.recipient_profile_id
            AND recipient.is_active = true
            AND (
                recipient.institution_id = app.institution_id
                OR recipient.region_id = app.region_id
                OR recipient.role IN ('council_admin', 'system_auditor')
            )
        )
    )
);

-- ------------------------------------------------------------------------------
-- POLICIES: audit_logs (Strict Read-Only Ledger for End Users)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Only system auditors and council admins can inspect audit logs" ON public.audit_logs;
CREATE POLICY "Only system auditors and council admins can inspect audit logs" ON public.audit_logs FOR SELECT
TO authenticated
USING (
    public.get_auth_role() IN ('system_auditor', 'council_admin')
);

-- Direct INSERT, UPDATE, and DELETE are strictly disallowed from standard client connections.
-- All legitimate audit records are written by SECURITY DEFINER trigger `record_audit_log()`.
-- No INSERT, UPDATE, or DELETE policies exist for public.audit_logs.
