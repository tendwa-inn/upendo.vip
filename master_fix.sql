-- =================================================================
-- MASTER RESET SCRIPT FOR USER PROFILES
-- This script will reset all RLS policies and triggers
-- related to the public.profiles table to a known, correct state.
-- =================================================================

-- STEP 1: DROP ALL EXISTING POLICIES AND TRIGGERS
-- This ensures a completely clean slate and removes any old,
-- conflicting, or incorrectly named rules.
-- -----------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated select access" ON public.profiles;
DROP POLICY IF EXISTS "Allow individual select access" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated users to update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow individual update access" ON public.profiles;
DROP POLICY IF EXISTS "Allow public read access" ON public.profiles;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.profiles;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();


-- STEP 2: CREATE THE CORRECT, MINIMAL POLICIES
-- These are the only two policies your application needs for users
-- to manage their own profiles.
-- -----------------------------------------------------------------

-- POLICY 1: Allow users to read their own profile.
CREATE POLICY "Allow individual select access" ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- POLICY 2: Allow users to update their own profile.
-- This is the critical policy that fixes the silent update failure.
CREATE POLICY "Allow individual update access" ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);


-- STEP 3: CREATE A ROBUST "NEW USER" TRIGGER
-- This trigger will create an empty profile when a new user signs up.
-- The application logic will then force them to complete it.
-- -----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create a profile row with only the user's ID.
  -- All other fields will be NULL by default.
  INSERT INTO public.profiles (id)
  VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- STEP 4: REFRESH THE SCHEMA CACHE
-- This tells Supabase to recognize the new policies immediately.
-- -----------------------------------------------------------------
NOTIFY pgrst, 'reload schema';
