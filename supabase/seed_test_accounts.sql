-- ==============================================================================
-- AICTE AICE 2.0: Evaluator Test Accounts & Base Seed Script
-- ==============================================================================
-- Run this script in the Supabase Dashboard SQL Editor to:
-- 1. Ensure required base regions & sample institutions exist.
-- 2. Link pre-created Supabase Auth users to authorized public.profiles records.
--
-- Note: Uses the correct column name 'aicte_id' (not 'permanent_institute_id').
-- ==============================================================================

DO $$
DECLARE
  v_admin_id UUID;
  v_ro_id UUID;
  v_scrutiny_id UUID;
  v_expert_id UUID;
  v_inst_id UUID;
  v_western_region_id UUID;
  v_coep_inst_id UUID;
BEGIN
  -- 1. Ensure base region (Western Regional Office - WRO) exists
  INSERT INTO public.regions (code, name, states_covered)
  VALUES ('WRO', 'Western Regional Office', '{"Maharashtra", "Goa"}')
  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO v_western_region_id;

  IF v_western_region_id IS NULL THEN
    SELECT id INTO v_western_region_id FROM public.regions WHERE code = 'WRO' LIMIT 1;
  END IF;

  -- 2. Ensure base sample institution (COEP Technological University) exists
  INSERT INTO public.institutions (
    aicte_id,
    name,
    legal_entity_type,
    region_id,
    address_line1,
    city,
    state,
    pincode,
    contact_email,
    contact_phone
  )
  VALUES (
    '1-10992341',
    'COEP Technological University (College of Engineering Pune)',
    'Government Autonomous',
    v_western_region_id,
    'Wellesley Road, Shivajinagar',
    'Pune',
    'Maharashtra',
    '411005',
    'principal@coep.ac.in',
    '020-25507000'
  )
  ON CONFLICT (aicte_id) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO v_coep_inst_id;

  IF v_coep_inst_id IS NULL THEN
    SELECT id INTO v_coep_inst_id FROM public.institutions WHERE aicte_id = '1-10992341' LIMIT 1;
  END IF;

  -- 3. Lookup Auth User IDs by email
  SELECT id INTO v_admin_id FROM auth.users WHERE email = 'admin@aicte-india.org';
  SELECT id INTO v_ro_id FROM auth.users WHERE email = 'ro.western@aicte-india.org';
  SELECT id INTO v_scrutiny_id FROM auth.users WHERE email = 'scrutiny.officer@aicte-india.org';
  SELECT id INTO v_expert_id FROM auth.users WHERE email = 'evc.lead@aicte-expert.gov.in';
  SELECT id INTO v_inst_id FROM auth.users WHERE email = 'principal@coep.ac.in';

  -- 4. Upsert profiles for created Auth users

  -- Council Admin Profile
  IF v_admin_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, email, full_name, role, is_active)
    VALUES (v_admin_id, 'admin@aicte-india.org', 'Dr. S. K. Mahajan (Council Admin)', 'council_admin', true)
    ON CONFLICT (id) DO UPDATE SET
      role = 'council_admin',
      full_name = EXCLUDED.full_name,
      is_active = true;
    RAISE NOTICE 'Provisioned Council Admin Profile: %', v_admin_id;
  END IF;

  -- Regional Officer Profile (requires region_id)
  IF v_ro_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, email, full_name, role, region_id, is_active)
    VALUES (v_ro_id, 'ro.western@aicte-india.org', 'Prof. Arvind Deshmukh (RO Western)', 'regional_officer', v_western_region_id, true)
    ON CONFLICT (id) DO UPDATE SET
      role = 'regional_officer',
      region_id = v_western_region_id,
      full_name = EXCLUDED.full_name,
      is_active = true;
    RAISE NOTICE 'Provisioned Regional Officer Profile: %', v_ro_id;
  END IF;

  -- Scrutiny Officer Profile (requires region_id)
  IF v_scrutiny_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, email, full_name, role, region_id, is_active)
    VALUES (v_scrutiny_id, 'scrutiny.officer@aicte-india.org', 'Dr. Meenakshi Raman (Scrutiny Convenor)', 'scrutiny_officer', v_western_region_id, true)
    ON CONFLICT (id) DO UPDATE SET
      role = 'scrutiny_officer',
      region_id = v_western_region_id,
      full_name = EXCLUDED.full_name,
      is_active = true;
    RAISE NOTICE 'Provisioned Scrutiny Officer Profile: %', v_scrutiny_id;
  END IF;

  -- EVC Expert Profile
  IF v_expert_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, email, full_name, role, is_active)
    VALUES (v_expert_id, 'evc.lead@aicte-expert.gov.in', 'Prof. K. R. Venugopal (EVC Chairman)', 'evc_expert', true)
    ON CONFLICT (id) DO UPDATE SET
      role = 'evc_expert',
      full_name = EXCLUDED.full_name,
      is_active = true;
    RAISE NOTICE 'Provisioned EVC Expert Profile: %', v_expert_id;
  END IF;

  -- Institution Admin Profile (requires institution_id)
  IF v_inst_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, email, full_name, role, institution_id, is_active)
    VALUES (v_inst_id, 'principal@coep.ac.in', 'Director COEP Tech (Registrar)', 'institution_admin', v_coep_inst_id, true)
    ON CONFLICT (id) DO UPDATE SET
      role = 'institution_admin',
      institution_id = v_coep_inst_id,
      full_name = EXCLUDED.full_name,
      is_active = true;
    RAISE NOTICE 'Provisioned Institution Admin Profile: %', v_inst_id;
  END IF;

END $$;
