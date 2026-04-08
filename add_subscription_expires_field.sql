-- Add subscription_expires_at field to profiles table (account_type already exists)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ;