-- Verify bucket creation and show all available buckets
-- This script will help us understand what's happening with storage

-- Show all existing buckets
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types,
    created_at
FROM storage.buckets 
ORDER BY id;

-- Check if avatras bucket specifically exists
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE id = 'avatras';

-- Show current storage permissions
SELECT 
    grantee,
    table_name,
    privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'storage' 
AND grantee IN ('anon', 'authenticated')
ORDER BY table_name, grantee;

-- Check if there are any RLS policies on storage tables
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'storage'
ORDER BY tablename, policyname;