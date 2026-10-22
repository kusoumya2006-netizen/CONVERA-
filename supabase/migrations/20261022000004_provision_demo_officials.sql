-- =========================================================================
-- CONVERA Database Architecture — Migration 004: Provision Demo Officials
-- SIH26264: Integrated Institution Complaint Monitoring & Overlap Dashboard
-- =========================================================================
-- This script provisions the 4 authorized AICTE demonstration official accounts
-- in both Supabase Managed Auth (auth.users) and the application profile table
-- (public.profiles) with cryptographically salted bcrypt passwords.
--
-- Passwords provisioned (matching the official demo selector):
--   1. director.rb@aicte-india.org       -> Regulation@2026
--   2. director.pgrc@aicte-india.org     -> Grievance@2026
--   3. coordinator@aicte-india.org       -> Synchra@2026
--   4. officer.western@aicte-india.org   -> Western@2026
-- =========================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

DO $$
DECLARE
  v_user_id UUID;
BEGIN

  -- -----------------------------------------------------------------------
  -- 1. Dr. Amitabh Ghosh — Director (Regulation Bureau)
  -- -----------------------------------------------------------------------
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'director.rb@aicte-india.org';
  
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      v_user_id,
      'authenticated',
      'authenticated',
      'director.rb@aicte-india.org',
      extensions.crypt('Regulation@2026', extensions.gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Dr. Amitabh Ghosh"}'::jsonb,
      now(), now(), '', ''
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = extensions.crypt('Regulation@2026', extensions.gen_salt('bf')),
        email_confirmed_at = coalesce(email_confirmed_at, now()),
        updated_at = now()
    WHERE id = v_user_id;
  END IF;

  INSERT INTO public.profiles (
    id, email, display_name, designation, role, bureau, department
  ) VALUES (
    v_user_id,
    'director.rb@aicte-india.org',
    'Dr. Amitabh Ghosh',
    'Director (Regulation Bureau)',
    'RB_DIRECTOR',
    'RB',
    'Regulation Bureau, AICTE New Delhi'
  ) ON CONFLICT (id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    designation = EXCLUDED.designation,
    role = EXCLUDED.role,
    bureau = EXCLUDED.bureau,
    department = EXCLUDED.department,
    updated_at = now();

  -- -----------------------------------------------------------------------
  -- 2. Smt. Sunita Mohanty — Director (Public Grievance Redressal Cell)
  -- -----------------------------------------------------------------------
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'director.pgrc@aicte-india.org';
  
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      v_user_id,
      'authenticated',
      'authenticated',
      'director.pgrc@aicte-india.org',
      extensions.crypt('Grievance@2026', extensions.gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Smt. Sunita Mohanty"}'::jsonb,
      now(), now(), '', ''
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = extensions.crypt('Grievance@2026', extensions.gen_salt('bf')),
        email_confirmed_at = coalesce(email_confirmed_at, now()),
        updated_at = now()
    WHERE id = v_user_id;
  END IF;

  INSERT INTO public.profiles (
    id, email, display_name, designation, role, bureau, department
  ) VALUES (
    v_user_id,
    'director.pgrc@aicte-india.org',
    'Smt. Sunita Mohanty',
    'Director (Public Grievance Redressal Cell)',
    'PGRC_DIRECTOR',
    'PGRC',
    'Grievance Redressal Cell, AICTE New Delhi'
  ) ON CONFLICT (id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    designation = EXCLUDED.designation,
    role = EXCLUDED.role,
    bureau = EXCLUDED.bureau,
    department = EXCLUDED.department,
    updated_at = now();

  -- -----------------------------------------------------------------------
  -- 3. Dr. R. K. Verma — Advisor & Redressal Coordinator (Super Admin)
  -- -----------------------------------------------------------------------
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'coordinator@aicte-india.org';
  
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      v_user_id,
      'authenticated',
      'authenticated',
      'coordinator@aicte-india.org',
      extensions.crypt('Synchra@2026', extensions.gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Dr. R. K. Verma"}'::jsonb,
      now(), now(), '', ''
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = extensions.crypt('Synchra@2026', extensions.gen_salt('bf')),
        email_confirmed_at = coalesce(email_confirmed_at, now()),
        updated_at = now()
    WHERE id = v_user_id;
  END IF;

  INSERT INTO public.profiles (
    id, email, display_name, designation, role, bureau, department
  ) VALUES (
    v_user_id,
    'coordinator@aicte-india.org',
    'Dr. R. K. Verma',
    'Advisor & Redressal Coordinator',
    'SUPER_ADMIN',
    'ALL',
    'Central Monitoring & Inter-Bureau Coordination'
  ) ON CONFLICT (id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    designation = EXCLUDED.designation,
    role = EXCLUDED.role,
    bureau = EXCLUDED.bureau,
    department = EXCLUDED.department,
    updated_at = now();

  -- -----------------------------------------------------------------------
  -- 4. Dr. Suresh N. Patil — Regional Officer (Western Region)
  -- -----------------------------------------------------------------------
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'officer.western@aicte-india.org';
  
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      v_user_id,
      'authenticated',
      'authenticated',
      'officer.western@aicte-india.org',
      extensions.crypt('Western@2026', extensions.gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Dr. Suresh N. Patil"}'::jsonb,
      now(), now(), '', ''
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = extensions.crypt('Western@2026', extensions.gen_salt('bf')),
        email_confirmed_at = coalesce(email_confirmed_at, now()),
        updated_at = now()
    WHERE id = v_user_id;
  END IF;

  INSERT INTO public.profiles (
    id, email, display_name, designation, role, bureau, department
  ) VALUES (
    v_user_id,
    'officer.western@aicte-india.org',
    'Dr. Suresh N. Patil',
    'Regional Officer (Western Region)',
    'REGIONAL_OFFICER',
    'RB',
    'AICTE Western Regional Office, Mumbai'
  ) ON CONFLICT (id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    designation = EXCLUDED.designation,
    role = EXCLUDED.role,
    bureau = EXCLUDED.bureau,
    department = EXCLUDED.department,
    updated_at = now();

END $$;
