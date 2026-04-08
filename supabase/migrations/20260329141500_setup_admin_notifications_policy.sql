
-- Allow user_id to be null for system-wide messages
ALTER TABLE public.notifications
ALTER COLUMN user_id DROP NOT NULL;

-- Drop the policy if it exists, to prevent errors on re-runs
DROP POLICY IF EXISTS "Admins can insert notifications" ON public.notifications;

-- Create the policy to allow admins to insert system messages
CREATE POLICY "Admins can insert notifications" 
ON public.notifications 
FOR INSERT
WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);
