-- Comprehensive fix for user_promos RLS policies
-- This addresses the 401 Unauthorized error when applying promo codes

-- Drop existing conflicting policies
DROP POLICY IF EXISTS "Users can insert their own user_promos" ON public.user_promos;
DROP POLICY IF EXISTS "Users can apply promo codes to themselves" ON public.user_promos;
DROP POLICY IF EXISTS "Users can insert user_promos for valid promo codes" ON public.user_promos;

-- Create proper RLS policies for user_promos table
-- Policy 1: Users can read their own promo records
CREATE POLICY "Users can read their own user_promos"
ON public.user_promos
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy 2: Users can insert their own user_promos (for applying promo codes)
CREATE POLICY "Users can insert their own user_promos"
ON public.user_promos
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can delete their own user_promos
CREATE POLICY "Users can delete their own user_promos"
ON public.user_promos
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Policy 4: Admins can manage all user_promos
CREATE POLICY "Admins can manage all user_promos"
ON public.user_promos
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Ensure RLS is enabled
ALTER TABLE public.user_promos ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON public.user_promos TO authenticated;