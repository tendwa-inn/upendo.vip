-- Create storage buckets for Upendo app

-- First, disable RLS on storage tables to allow bucket creation
ALTER TABLE storage.buckets DISABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Create the avatras bucket (for profile photos and system message attachments)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatras', 'avatras', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Create the stories bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('stories', 'stories', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Create the gifs bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('gifs', 'gifs', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Re-enable RLS
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON storage.buckets TO authenticated;
GRANT ALL ON storage.objects TO authenticated;
GRANT SELECT ON storage.buckets TO anon;
GRANT SELECT ON storage.objects TO anon;

-- Create RLS policies
CREATE POLICY "Allow authenticated users to upload to avatras" ON storage.objects
    FOR ALL TO authenticated USING (bucket_id = 'avatras') WITH CHECK (bucket_id = 'avatras');

CREATE POLICY "Allow public read access to avatras" ON storage.objects
    FOR SELECT TO public USING (bucket_id = 'avatras');

CREATE POLICY "Allow authenticated users to upload to stories" ON storage.objects
    FOR ALL TO authenticated USING (bucket_id = 'stories') WITH CHECK (bucket_id = 'stories');

CREATE POLICY "Allow public read access to stories" ON storage.objects
    FOR SELECT TO public USING (bucket_id = 'stories');

CREATE POLICY "Allow authenticated users to upload to gifs" ON storage.objects
    FOR ALL TO authenticated USING (bucket_id = 'gifs') WITH CHECK (bucket_id = 'gifs');

CREATE POLICY "Allow public read access to gifs" ON storage.objects
    FOR SELECT TO public USING (bucket_id = 'gifs');

-- Verify buckets created
SELECT id, name, public FROM storage.buckets;