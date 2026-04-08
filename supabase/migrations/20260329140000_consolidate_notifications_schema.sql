
-- Add all necessary columns to the notifications table in one go
ALTER TABLE public.notifications
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS message TEXT,
ADD COLUMN IF NOT EXISTS type TEXT,
ADD COLUMN IF NOT EXISTS target TEXT DEFAULT 'all',
ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Re-create the SELECT policy to be safe
-- Drop the policy if it exists, to prevent errors on re-runs
DROP POLICY IF EXISTS "Allow users to read their own notifications and system messages" ON public.notifications;

-- Create the security policy that depends on the new columns
CREATE POLICY "Allow users to read their own notifications and system messages" 
ON public.notifications 
FOR SELECT
USING (
  auth.uid() = user_id OR
  (type = 'system' AND target = 'all')
);
