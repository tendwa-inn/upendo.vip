-- Check current storage permissions
SELECT 
    bucket_id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE id = 'avatras';

-- Grant necessary permissions for storage operations
GRANT ALL ON storage.objects TO authenticated;
GRANT SELECT ON storage.objects TO anon;

-- Grant permissions for bucket operations
GRANT SELECT ON storage.buckets TO authenticated, anon;

-- Check if avatras bucket exists and create if not
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatras', 'avatras', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Update bucket to be public if it's not already
UPDATE storage.buckets 
SET public = true 
WHERE id = 'avatras' AND public = false;

-- Check current permissions
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'storage' 
AND grantee IN ('anon', 'authenticated')
ORDER BY table_name, grantee;