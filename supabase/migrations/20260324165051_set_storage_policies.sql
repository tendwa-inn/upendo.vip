
-- Grant public read access to the avatars bucket
CREATE POLICY "Public read access for avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- Grant authenticated users insert access to the avatars bucket
CREATE POLICY "Authenticated users can upload avatars" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Grant authenticated users update access to their own avatars
CREATE POLICY "Authenticated users can update their own avatars" ON storage.objects
FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid() = owner)
WITH CHECK (bucket_id = 'avatars' AND auth.uid() = owner);

-- Grant admin users full access to the avatars bucket
CREATE POLICY "Admins can manage avatars" ON storage.objects
FOR ALL USING (bucket_id = 'avatars' AND is_admin())
WITH CHECK (bucket_id = 'avatars' AND is_admin());

-- Grant public read access to the messages bucket
CREATE POLICY "Public read access for messages" ON storage.objects
FOR SELECT USING (bucket_id = 'messages');

-- Grant admin users full access to the messages bucket
CREATE POLICY "Admins can manage messages" ON storage.objects
FOR ALL USING (bucket_id = 'messages' AND is_admin())
WITH CHECK (bucket_id = 'messages' AND is_admin());
