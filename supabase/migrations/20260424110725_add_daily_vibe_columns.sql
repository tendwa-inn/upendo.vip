-- Add daily vibe columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS daily_vibe TEXT,
ADD COLUMN IF NOT EXISTS daily_vibe_expires_at TIMESTAMPTZ;