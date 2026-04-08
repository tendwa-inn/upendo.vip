-- This script sets the definitive Row Level Security (RLS) policies for the 'avatars' storage bucket.

-- 1. Allow authenticated users to UPLOAD photos to their own folder.
-- The user's folder is named after their unique user ID (uid).
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK ((bucket_id = 'avatars') AND (auth.role() = 'authenticated'));

-- 2. Allow authenticated users to VIEW and DOWNLOAD their own photos.
CREATE POLICY "Allow authenticated view of own photos" ON storage.objects
FOR SELECT USING ((bucket_id = 'avatars') AND (auth.uid() = owner));

-- 3. Allow authenticated users to UPDATE their own photos.
CREATE POLICY "Allow authenticated update of own photos" ON storage.objects
FOR UPDATE USING ((bucket_id = 'avatars') AND (auth.uid() = owner));

-- 4. Allow authenticated users to DELETE their own photos.
CREATE POLICY "Allow authenticated delete of own photos" ON storage.objects
FOR DELETE USING ((bucket_id = 'avatars') AND (auth.uid() = owner));
