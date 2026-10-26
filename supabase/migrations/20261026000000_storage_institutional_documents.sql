-- Migration: Add storage bucket for institutional documents and policies
-- Note: Supabase Storage uses the storage schema (storage.buckets and storage.objects)

-- 1. Create the private storage bucket if not already present
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'institutional-documents',
    'institutional-documents',
    false,
    15728640, -- 15MB limit
    ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/jpg']::text[]
)
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = 15728640,
    allowed_mime_types = ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/jpg']::text[];

-- 2. Storage Objects RLS: Allow institutions to read their own uploaded files
DROP POLICY IF EXISTS "Institutions and officers can read institutional documents" ON storage.objects;
CREATE POLICY "Institutions and officers can read institutional documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'institutional-documents'
    AND (
        -- File path convention: {institution_id}/{application_id}/{filename}
        (storage.foldername(name))[1] = public.get_auth_institution_id()::text
        OR public.get_auth_role() IN ('council_admin', 'system_auditor', 'scrutiny_officer', 'regional_officer', 'evc_expert')
    )
);

-- 3. Storage Objects RLS: Allow authenticated institution users to upload into their institution folder
DROP POLICY IF EXISTS "Institutions can upload to own folder" ON storage.objects;
CREATE POLICY "Institutions can upload to own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'institutional-documents'
    AND public.get_auth_role() IN ('institution_admin', 'institution_user')
    AND (storage.foldername(name))[1] = public.get_auth_institution_id()::text
);

-- 4. Storage Objects RLS: Allow institutions to delete unverified documents in their own folder
DROP POLICY IF EXISTS "Institutions can delete own draft documents" ON storage.objects;
CREATE POLICY "Institutions can delete own draft documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'institutional-documents'
    AND public.get_auth_role() IN ('institution_admin', 'institution_user')
    AND (storage.foldername(name))[1] = public.get_auth_institution_id()::text
);
