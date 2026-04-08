-- Add can_view_profiles_expires_at column to profiles table
-- This allows free users to temporarily view profiles and see who viewed them

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS can_view_profiles_expires_at TIMESTAMPTZ;

-- Enable RLS on profiles table if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to update their own can_view_profiles_expires_at
DROP POLICY IF EXISTS "Users can update own profile viewing permission" ON public.profiles;

CREATE POLICY "Users can update own profile viewing permission"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Create policy to allow users to read their own can_view_profiles_expires_at
DROP POLICY IF EXISTS "Users can read own profile viewing permission" ON public.profiles;

CREATE POLICY "Users can read own profile viewing permission"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);
