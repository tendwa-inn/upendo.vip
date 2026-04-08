-- Add delete policy for promo_codes
-- This allows admins to delete promo codes

-- Drop existing delete policy if it exists
DROP POLICY IF EXISTS "Admins can delete promo codes" ON public.promo_codes;

-- Create delete policy for admins
CREATE POLICY "Admins can delete promo codes"
ON public.promo_codes
FOR DELETE
TO authenticated
USING (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )
);

-- Also add update policy if it doesn't exist
DROP POLICY IF EXISTS "Admins can update promo codes" ON public.promo_codes;

CREATE POLICY "Admins can update promo codes"
ON public.promo_codes
FOR UPDATE
TO authenticated
USING (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )
);

-- Ensure users can read promo codes (for applying them)
DROP POLICY IF EXISTS "Anyone can read promo codes" ON public.promo_codes;

CREATE POLICY "Anyone can read promo codes"
ON public.promo_codes
FOR SELECT
TO authenticated
USING (true);
