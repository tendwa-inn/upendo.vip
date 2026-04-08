-- This script provides the definitive, correct set of Row Level Security (RLS) policies
-- for the public.profiles table. It will fix the silent update failures.

-- 1. First, enable Row Level Security on the profiles table if it's not already.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Drop all old, potentially incorrect RLS policies on the profiles table to ensure a clean slate.
DROP POLICY IF EXISTS "Allow authenticated select access" ON public.profiles;
DROP POLICY IF EXISTS "Allow individual select access" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated users to update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow individual update access" ON public.profiles;
-- Add any other old policy names here if they exist.

-- 3. THE SELECT POLICY: Allow users to read their own profile.
-- This is the only SELECT rule needed for a user to see their own data.
CREATE POLICY "Allow individual select access" ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- 4. THE UPDATE POLICY: Allow users to update their own profile.
-- This is the critical missing piece that is causing all the problems.
CREATE POLICY "Allow individual update access" ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- NOTE: An INSERT policy is not needed here because we are using the `handle_new_user`
-- trigger, which runs with elevated privileges (`SECURITY DEFINER`) to create the initial default profile.
