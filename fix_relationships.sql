-- This script rebuilds the foreign key relationships for the 'matches' table.

-- 1. Drop any existing, potentially incorrect constraints to ensure a clean slate.
ALTER TABLE public.matches
DROP CONSTRAINT IF EXISTS matches_user1_id_fkey,
DROP CONSTRAINT IF EXISTS matches_user2_id_fkey;

-- 2. Add the correct foreign key constraint for user1_id.
-- This links the 'user1_id' column in the 'matches' table to the 'id' column in the 'profiles' table.
ALTER TABLE public.matches
ADD CONSTRAINT matches_user1_id_fkey
FOREIGN KEY (user1_id)
REFERENCES public.profiles (id)
ON DELETE CASCADE;

-- 3. Add the correct foreign key constraint for user2_id.
-- This links the 'user2_id' column in the 'matches' table to the 'id' column in the 'profiles' table.
ALTER TABLE public.matches
ADD CONSTRAINT matches_user2_id_fkey
FOREIGN KEY (user2_id)
REFERENCES public.profiles (id)
ON DELETE CASCADE;

-- 4. Reload the schema cache for PostgREST to recognize the new relationships immediately.
NOTIFY pgrst, 'reload schema';
