-- Add connection_limit column to app_settings
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS connection_limit INTEGER NOT NULL DEFAULT 3;

-- Set tier-specific values
UPDATE public.app_settings SET connection_limit = 3 WHERE account_type = 'free';
UPDATE public.app_settings SET connection_limit = 10 WHERE account_type = 'pro';
UPDATE public.app_settings SET connection_limit = -1 WHERE account_type = 'vip';
