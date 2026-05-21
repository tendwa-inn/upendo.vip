-- Add daily_vibe_changes column to app_settings table in production
ALTER TABLE public.app_settings 
ADD COLUMN IF NOT EXISTS daily_vibe_changes INTEGER NOT NULL DEFAULT 1;

-- Update the values for each tier
UPDATE public.app_settings 
SET daily_vibe_changes = 1 
WHERE account_type = 'free';

UPDATE public.app_settings 
SET daily_vibe_changes = 5 
WHERE account_type = 'pro';

UPDATE public.app_settings 
SET daily_vibe_changes = 10 
WHERE account_type = 'vip';

-- Verify the changes
SELECT account_type, daily_vibe_changes FROM public.app_settings ORDER BY account_type;