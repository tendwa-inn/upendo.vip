-- Manually create the avatras bucket with all necessary permissions
-- This script bypasses RLS and creates the bucket directly

-- Step 1: Check if bucket already exists
SELECT id, name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE id = 'avatras';

-- Step 2: If bucket doesn't exist, create it manually
-- Note: This needs to be run as a superuser or with appropriate permissions
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatras', 'avatras', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Step 3: Verify bucket was created
SELECT id, name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE id = 'avatras';

-- Step 4: Grant necessary permissions for storage operations
GRANT ALL ON storage.objects TO authenticated;
GRANT SELECT ON storage.objects TO anon;
GRANT ALL ON storage.buckets TO authenticated;
GRANT SELECT ON storage.buckets TO anon;

-- Step 5: Check current permissions
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'storage' 
AND grantee IN ('anon', 'authenticated')
ORDER BY table_name, grantee;

-- Step 6: Test the bucket by listing all buckets
SELECT id, name, public FROM storage.buckets ORDER BY id;