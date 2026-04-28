CREATE POLICY "Allow authenticated users to read system messages" ON public.system_messages
FOR SELECT
USING (auth.role() = 'authenticated');
