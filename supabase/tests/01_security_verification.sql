-- ==============================================================================
-- AICTE SAKSHAM - Comprehensive Security Verification Test Suite
-- File: supabase/tests/01_security_verification.sql
-- Description:
--   Tests covering institution_admin, institution_user, regional_officer,
--   scrutiny_officer, evc_expert, council_admin, and system_auditor roles
--   verifying both permitted and denied actions.
--
-- Note:
--   Wraps inside an explicit transaction that executes ROLLBACK at the end.
-- ==============================================================================

BEGIN;

DO $$
DECLARE
    v_region_north UUID := '11111111-1111-1111-1111-111111111111';
    v_region_south UUID := '22222222-2222-2222-2222-222222222222';
    v_inst_a UUID := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    v_inst_b UUID := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

    -- Actors
    v_user_inst_admin_a UUID := 'a1111111-1111-1111-1111-111111111111';
    v_user_inst_user_a  UUID := 'a2222222-2222-2222-2222-222222222222';
    v_officer_scrutiny  UUID := 'c3333333-3333-3333-3333-333333333333';
    v_officer_regional  UUID := 'd4444444-4444-4444-4444-444444444444';
    v_expert_evc        UUID := 'e5555555-5555-5555-5555-555555555555';
    v_admin_council     UUID := 'f6666666-6666-6666-6666-666666666666';
    v_auditor_sys       UUID := '77777777-7777-7777-7777-777777777777';
    v_user_inactive     UUID := '88888888-8888-8888-8888-888888888888';

    v_wf UUID := '99999999-9999-9999-9999-999999999999';
    v_app_a UUID := 'a0000000-0000-0000-0000-000000000000';
    v_app_b UUID := 'b0000000-0000-0000-0000-000000000000';
    v_visit_a UUID := 'e0000000-0000-0000-0000-000000000000';
    v_sub_a UUID := 'c0000000-0000-0000-0000-000000000000';
    v_notif_a UUID := 'n0000000-0000-0000-0000-000000000000';
    v_caught BOOLEAN;
BEGIN
    RAISE NOTICE '=== Running AICTE SAKSHAM Comprehensive Multi-Role Security Tests ===';

    -- 1. SEED GEOGRAPHY & ENTITIES
    INSERT INTO public.regions (id, code, name, states_covered)
    VALUES 
        (v_region_north, 'NWRO', 'North-Western Region', '{"Delhi", "Punjab"}'),
        (v_region_south, 'SWRO', 'South-Western Region', '{"Karnataka", "Kerala"}');

    INSERT INTO public.institutions (id, aicte_id, name, legal_entity_type, region_id, address_line1, city, state, pincode, contact_email, contact_phone)
    VALUES
        (v_inst_a, '1-TEST-A', 'College of Engineering A', 'Trust', v_region_north, 'Street 1', 'Delhi', 'Delhi', '110001', 'contact@a.edu', '9999999991'),
        (v_inst_b, '1-TEST-B', 'Institute of Technology B', 'Society', v_region_south, 'Street 2', 'Bengaluru', 'Karnataka', '560001', 'contact@b.edu', '9999999992');

    -- Insert mock auth users
    INSERT INTO auth.users (id, email)
    VALUES
        (v_user_inst_admin_a, 'admin@a.edu'),
        (v_user_inst_user_a, 'user@a.edu'),
        (v_officer_scrutiny, 'scrutiny@aicte.gov.in'),
        (v_officer_regional, 'ro.north@aicte.gov.in'),
        (v_expert_evc, 'expert@iitd.ac.in'),
        (v_admin_council, 'council.super@aicte.gov.in'),
        (v_auditor_sys, 'auditor@cag.gov.in'),
        (v_user_inactive, 'suspended@a.edu')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.profiles (id, email, full_name, role, institution_id, region_id, is_active)
    VALUES
        (v_user_inst_admin_a, 'admin@a.edu', 'Admin Inst A', 'institution_admin', v_inst_a, NULL, true),
        (v_user_inst_user_a, 'user@a.edu', 'Staff Inst A', 'institution_user', v_inst_a, NULL, true),
        (v_officer_scrutiny, 'scrutiny@aicte.gov.in', 'Scrutiny Officer North', 'scrutiny_officer', NULL, v_region_north, true),
        (v_officer_regional, 'ro.north@aicte.gov.in', 'Regional Officer North', 'regional_officer', NULL, v_region_north, true),
        (v_expert_evc, 'expert@iitd.ac.in', 'Prof EVC Expert', 'evc_expert', NULL, NULL, true),
        (v_admin_council, 'council.super@aicte.gov.in', 'Council Superadmin', 'council_admin', NULL, NULL, true),
        (v_auditor_sys, 'auditor@cag.gov.in', 'System Auditor', 'system_auditor', NULL, NULL, true),
        (v_user_inactive, 'suspended@a.edu', 'Suspended Profile', 'institution_user', v_inst_a, NULL, false);

    INSERT INTO public.workflow_definitions (id, code, version, title, stage_sequence)
    VALUES (v_wf, 'APPROVAL_2026', 1, 'Standard AICTE Approval 2026', '["draft", "scrutiny", "evc", "council"]'::jsonb);

    INSERT INTO public.applications (id, application_number, institution_id, region_id, academic_year, application_type, workflow_definition_id, status)
    VALUES
        (v_app_a, 'APP-2026-A001', v_inst_a, v_region_north, '2026-27', 'New_Course', v_wf, 'draft'),
        (v_app_b, 'APP-2026-B001', v_inst_b, v_region_south, '2026-27', 'Extension_of_Approval', v_wf, 'submitted');

    INSERT INTO public.evc_visits (id, application_id, scheduled_start, scheduled_end, lead_expert_id, committee_members)
    VALUES (v_visit_a, v_app_a, NOW() + INTERVAL '1 day', NOW() + INTERVAL '2 days', v_expert_evc, jsonb_build_array(v_expert_evc::text));

    INSERT INTO public.compliance_submissions (id, application_id, institution_id, compliance_remarks, submitted_by, status)
    VALUES (v_sub_a, v_app_a, v_inst_a, 'Submitted infrastructure proof', v_user_inst_admin_a, 'pending');

    INSERT INTO public.notification_events (id, recipient_profile_id, application_id, channel, title, content)
    VALUES (v_notif_a, v_user_inst_admin_a, v_app_a, 'in_app', 'Deficiency Notice', 'Please upload land records');

    -- =========================================================================
    -- ROLE TEST 1: institution_user & institution_admin
    -- =========================================================================
    EXECUTE 'SET LOCAL role = authenticated';
    PERFORM set_config('request.jwt.claims', json_build_object('sub', v_user_inst_admin_a::text)::text, true);

    -- Permitted: Update own draft
    UPDATE public.applications SET metadata = '{"notes": "updated by applicant"}' WHERE id = v_app_a;

    -- Denied: Edit reviewer-only fields in compliance submissions
    v_caught := false;
    BEGIN
        UPDATE public.compliance_submissions SET review_comments = 'Self approved' WHERE id = v_sub_a;
    EXCEPTION WHEN OTHERS THEN v_caught := true; END;
    IF NOT v_caught THEN RAISE EXCEPTION 'R1 FAILED: Applicant modified reviewer comments!'; END IF;

    -- Denied: Modifying notification delivery metadata
    v_caught := false;
    BEGIN
        UPDATE public.notification_events SET delivered_at = NOW() WHERE id = v_notif_a;
    EXCEPTION WHEN OTHERS THEN v_caught := true; END;
    IF NOT v_caught THEN RAISE EXCEPTION 'R1 FAILED: Recipient forged notification delivered_at!'; END IF;
    RAISE NOTICE 'ROLE 1 (institution_admin/user) PASSED';

    -- =========================================================================
    -- ROLE TEST 2: scrutiny_officer
    -- =========================================================================
    PERFORM set_config('request.jwt.claims', json_build_object('sub', v_officer_scrutiny::text)::text, true);

    -- Denied: Transitioning application directly to approved (statutory decision reserved for council)
    v_caught := false;
    BEGIN
        UPDATE public.applications SET status = 'approved' WHERE id = v_app_a;
    EXCEPTION WHEN OTHERS THEN v_caught := true; END;
    IF NOT v_caught THEN RAISE EXCEPTION 'R2 FAILED: Scrutiny officer bypassed council approval!'; END IF;

    -- Denied: Altering submitted applicant remarks
    v_caught := false;
    BEGIN
        UPDATE public.compliance_submissions SET compliance_remarks = 'Altered by officer' WHERE id = v_sub_a;
    EXCEPTION WHEN OTHERS THEN v_caught := true; END;
    IF NOT v_caught THEN RAISE EXCEPTION 'R2 FAILED: Scrutiny officer modified applicant compliance remarks!'; END IF;
    RAISE NOTICE 'ROLE 2 (scrutiny_officer) PASSED';

    -- =========================================================================
    -- ROLE TEST 3: regional_officer
    -- =========================================================================
    PERFORM set_config('request.jwt.claims', json_build_object('sub', v_officer_regional::text)::text, true);

    -- Permitted: Schedule EVC visit or review compliance
    UPDATE public.compliance_submissions SET review_comments = 'Verified land deeds', status = 'completed' WHERE id = v_sub_a;

    -- Denied: Accessing applications in southern region (v_app_b)
    IF EXISTS (SELECT 1 FROM public.applications WHERE id = v_app_b) THEN
        RAISE EXCEPTION 'R3 FAILED: Regional Officer North accessed South region application!';
    END IF;
    RAISE NOTICE 'ROLE 3 (regional_officer) PASSED';

    -- =========================================================================
    -- ROLE TEST 4: evc_expert
    -- =========================================================================
    PERFORM set_config('request.jwt.claims', json_build_object('sub', v_expert_evc::text)::text, true);

    -- Permitted: Update findings on assigned EVC visit
    UPDATE public.evc_visits SET findings_summary = 'Satisfactory campus labs', compliance_score = 88.5 WHERE id = v_visit_a;

    -- Denied: Modifying committee assignment or schedule
    v_caught := false;
    BEGIN
        UPDATE public.evc_visits SET lead_expert_id = v_user_inst_admin_a WHERE id = v_visit_a;
    EXCEPTION WHEN OTHERS THEN v_caught := true; END;
    IF NOT v_caught THEN RAISE EXCEPTION 'R4 FAILED: Expert altered committee membership!'; END IF;
    RAISE NOTICE 'ROLE 4 (evc_expert) PASSED';

    -- =========================================================================
    -- ROLE TEST 5: council_admin
    -- =========================================================================
    PERFORM set_config('request.jwt.claims', json_build_object('sub', v_admin_council::text)::text, true);

    -- Permitted: Manage regions, workflows, or execute final approval
    UPDATE public.applications SET status = 'council_decision_pending' WHERE id = v_app_a;
    UPDATE public.applications SET status = 'approved' WHERE id = v_app_a;

    -- Denied: Direct update or deletion of audit ledger
    v_caught := false;
    BEGIN
        DELETE FROM public.audit_logs WHERE record_id = v_app_a;
    EXCEPTION WHEN OTHERS THEN v_caught := true; END;
    IF NOT v_caught THEN RAISE EXCEPTION 'R5 FAILED: Direct deletion on audit_logs succeeded!'; END IF;
    RAISE NOTICE 'ROLE 5 (council_admin) PASSED';

    -- =========================================================================
    -- ROLE TEST 6: system_auditor
    -- =========================================================================
    PERFORM set_config('request.jwt.claims', json_build_object('sub', v_auditor_sys::text)::text, true);

    -- Permitted: Read-only inspection of applications and audit logs
    IF NOT EXISTS (SELECT 1 FROM public.applications WHERE id = v_app_a) THEN
        RAISE EXCEPTION 'R6 FAILED: Auditor could not read applications!';
    END IF;

    -- Denied: Any insert or update operation
    v_caught := false;
    BEGIN
        INSERT INTO public.regions (code, name) VALUES ('NEW', 'New Region');
    EXCEPTION WHEN OTHERS THEN v_caught := true; END;
    IF NOT v_caught THEN RAISE EXCEPTION 'R6 FAILED: Auditor was able to insert region!'; END IF;
    RAISE NOTICE 'ROLE 6 (system_auditor) PASSED';

    -- =========================================================================
    -- ROLE TEST 7: Inactive Profile
    -- =========================================================================
    PERFORM set_config('request.jwt.claims', json_build_object('sub', v_user_inactive::text)::text, true);
    IF public.get_auth_role() IS NOT NULL THEN
        RAISE EXCEPTION 'R7 FAILED: Inactive profile returned an active role!';
    END IF;
    RAISE NOTICE 'ROLE 7 (inactive user rejection) PASSED';

    RAISE NOTICE '=== ALL 7 MULTI-ROLE SECURITY TESTS COMPLETED SUCCESSFULLY ===';
END $$;

ROLLBACK;
