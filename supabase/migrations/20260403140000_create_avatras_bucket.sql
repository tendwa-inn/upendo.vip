-- Create avatras bucket for connection photos with proper permissions
-- This script will create the bucket if it doesn't exist and set up all necessary permissions

-- First, check if the bucket exists
DO $$
BEGIN
    -- Try to create the bucket
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES ('avatras', 'avatras', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
    ON CONFLICT (id) DO NOTHING;
    
    -- Make sure it's public
    UPDATE storage.buckets 
    SET public = true 
    WHERE id = 'avatras' AND public = false;
    
    -- Grant necessary permissions for storage operations
    GRANT ALL ON storage.objects TO authenticated;
    GRANT SELECT ON storage.objects TO anon;
    
    -- Grant permissions for bucket operations
    GRANT SELECT ON storage.buckets TO authenticated, anon;
    
    RAISE NOTICE 'Avatras bucket created/updated successfully';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating/updating avatras bucket: %', SQLERRM;
END $$;

-- Verify the bucket was created
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE id = 'avatras';

-- Check current permissions
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'storage' 
AND grantee IN ('anon', 'authenticated')
ORDER BY table_name, grantee;