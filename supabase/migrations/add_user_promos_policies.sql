-- Add policies for user_promos table
-- This table tracks which users have redeemed which promo codes

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can read user_promos" ON public.user_promos;
DROP POLICY IF EXISTS "Users can insert their own user_promos" ON public.user_promos;
DROP POLICY IF EXISTS "Users can delete their own user_promos" ON public.user_promos;
DROP POLICY IF EXISTS "Admins can manage user_promos" ON public.user_promos;

-- Anyone can read user_promos (to check if they've already used a code)
CREATE POLICY "Anyone can read user_promos"
ON public.user_promos
FOR SELECT
TO authenticated
USING (true);

-- Users can insert their own user_promos (when redeeming a promo code)
CREATE POLICY "Users can insert their own user_promos"
ON public.user_promos
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own user_promos (when admin removes their promo)
CREATE POLICY "Users can delete their own user_promos"
ON public.user_promos
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Admins can manage all user_promos
CREATE POLICY "Admins can manage user_promos"
ON public.user_promos
FOR ALL
TO authenticated
USING (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )
)
WITH CHECK (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )
);
