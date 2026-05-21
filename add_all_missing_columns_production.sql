-- Add missing columns to app_settings table in production database
-- Run this in your Supabase dashboard SQL editor

-- Check current table structure first
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'app_settings' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Add daily_vibe_changes column
ALTER TABLE public.app_settings 
ADD COLUMN IF NOT EXISTS daily_vibe_changes INTEGER NOT NULL DEFAULT 1;

-- Add international_dating column  
ALTER TABLE public.app_settings 
ADD COLUMN IF NOT EXISTS international_dating BOOLEAN NOT NULL DEFAULT false;

-- Add unlimited_message_requests column
ALTER TABLE public.app_settings 
ADD COLUMN IF NOT EXISTS unlimited_message_requests BOOLEAN NOT NULL DEFAULT false;

-- Add price column
ALTER TABLE public.app_settings 
ADD COLUMN IF NOT EXISTS price TEXT NOT NULL DEFAULT '0';

-- Update the values for each tier
UPDATE public.app_settings 
SET 
  daily_vibe_changes = CASE 
    WHEN account_type = 'free' THEN 1
    WHEN account_type = 'pro' THEN 5  
    WHEN account_type = 'vip' THEN 10
  END,
  international_dating = CASE 
    WHEN account_type = 'free' THEN false
    WHEN account_type = 'pro' THEN true
    WHEN account_type = 'vip' THEN true
  END,
  unlimited_message_requests = CASE 
    WHEN account_type = 'free' THEN false
    WHEN account_type = 'pro' THEN false
    WHEN account_type = 'vip' THEN true
  END,
  price = CASE 
    WHEN account_type = 'free' THEN '0'
    WHEN account_type = 'pro' THEN '9.99'
    WHEN account_type = 'vip' THEN '19.99'
  END;

-- Verify the changes
SELECT 
  account_type,
  daily_vibe_changes,
  international_dating,
  unlimited_message_requests,
  price,
  swipes_per_day,
  rewind_count,
  visibility_rate,
  message_requests,
  profile_views,
  ghost_mode,
  read_receipts
FROM public.app_settings 
ORDER BY account_type;