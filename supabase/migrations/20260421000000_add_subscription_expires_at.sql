-- Add subscription_expires_at column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN subscription_expires_at TIMESTAMPTZ;

-- Create function to automatically demote expired subscriptions
CREATE OR REPLACE FUNCTION demote_expired_subscriptions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Demote users whose subscription has expired
  UPDATE public.profiles 
  SET account_type = 'free', 
      subscription_expires_at = NULL
  WHERE subscription_expires_at IS NOT NULL 
    AND subscription_expires_at < NOW()
    AND account_type != 'free';
    
  -- Also handle profile view access expiration
  UPDATE public.profiles 
  SET can_view_profiles_expires_at = NULL
  WHERE can_view_profiles_expires_at IS NOT NULL 
    AND can_view_profiles_expires_at < NOW();
END;
$$;

-- Create cron job to run daily (requires pg_cron extension)
-- This will automatically demote expired subscriptions every day at 2 AM
SELECT cron.schedule('demote-expired-subscriptions', '0 2 * * *', 'SELECT demote_expired_subscriptions();');

-- Create index for performance
CREATE INDEX idx_profiles_subscription_expires_at ON public.profiles(subscription_expires_at) 
WHERE subscription_expires_at IS NOT NULL;