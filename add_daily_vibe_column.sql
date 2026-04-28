-- Add dailyVibe column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS dailyVibe TEXT DEFAULT NULL;

-- Add comment to explain the column
COMMENT ON COLUMN public.profiles.dailyVibe IS 'User''s daily mood or vibe status';

-- Update RLS policies if needed (assuming RLS is already enabled)
-- Note: This assumes the table already has appropriate RLS policies