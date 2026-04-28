CREATE POLICY "Allow insert read status" 
ON public.notification_read_status 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow select read status" 
ON public.notification_read_status 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Allow update read status" 
ON public.notification_read_status 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);
