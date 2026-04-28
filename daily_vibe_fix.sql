-- Add daily vibe columns to profiles table (run this directly in Supabase SQL editor)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS daily_vibe TEXT,
ADD COLUMN IF NOT EXISTS daily_vibe_expires_at TIMESTAMPTZ;

-- Add comment for documentation
COMMENT ON COLUMN profiles.daily_vibe IS 'User selected daily vibe/mood';
COMMENT ON COLUMN profiles.daily_vibe_expires_at IS 'Expiration timestamp for the daily vibe';