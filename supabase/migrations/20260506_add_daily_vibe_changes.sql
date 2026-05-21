-- Add daily_vibe_changes column to app_settings table
ALTER TABLE public.app_settings 
ADD COLUMN daily_vibe_changes INTEGER NOT NULL DEFAULT 1;

-- Update the values for each tier
UPDATE app_settings 
SET daily_vibe_changes = 1 
WHERE account_type = 'free';

UPDATE app_settings 
SET daily_vibe_changes = 5 
WHERE account_type = 'pro';

UPDATE app_settings 
SET daily_vibe_changes = 10 
WHERE account_type = 'vip';