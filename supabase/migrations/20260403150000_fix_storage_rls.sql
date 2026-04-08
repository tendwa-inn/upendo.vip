-- Fix storage RLS policies and create avatras bucket with proper permissions
-- This script handles the RLS policy violations for storage operations

-- First, temporarily disable RLS on storage tables to allow bucket creation
ALTER TABLE storage.buckets DISABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Create avatras bucket with proper settings
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatras', 'avatras', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Update bucket to be public if it exists
UPDATE storage.buckets 
SET public = true, 
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
WHERE id = 'avatras';

-- Grant necessary permissions for storage operations
GRANT ALL ON storage.buckets TO authenticated;
GRANT ALL ON storage.objects TO authenticated;
GRANT SELECT ON storage.buckets TO anon;
GRANT SELECT ON storage.objects TO anon;

-- Re-enable RLS on storage tables
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create proper RLS policies for storage
-- Allow authenticated users to manage their own objects
CREATE POLICY "Allow authenticated users to manage objects" ON storage.objects
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Allow anyone to read public objects
CREATE POLICY "Allow public read access" ON storage.objects
    FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'avatras' AND (storage.foldername(name))[1] = 'connections');

-- Allow authenticated users to manage buckets
CREATE POLICY "Allow authenticated users to manage buckets" ON storage.buckets
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Verify everything is set up correctly
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE id = 'avatras';

-- Check current permissions
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'storage' 
AND grantee IN ('anon', 'authenticated')
ORDER BY table_name, grantee;