-- This policy allows users to delete their own profile.
-- The `delete_user_account` function runs as the user, but with elevated
-- permissions (SECURITY DEFINER). This policy is needed to grant the specific
-- permission to delete the row in the `profiles` table.

-- IMPORTANT: Before running, please go to the RLS policies for the `profiles` table
-- in your Supabase dashboard and delete any existing policy for the DELETE action
-- to avoid conflicts.

-- 1. Enable Row Level Security on the profiles table if it's not already enabled.
-- ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Create the new policy that allows users to delete their own profile.
CREATE POLICY "Users can delete their own profile"
ON public.profiles FOR DELETE
USING (auth.uid() = id);
