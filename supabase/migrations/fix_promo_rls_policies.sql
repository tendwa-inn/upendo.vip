-- Check if RLS is enabled on promo_codes table
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('promo_codes', 'user_promos');

-- Enable RLS if not enabled
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_promos ENABLE ROW LEVEL SECURITY;

-- Drop and recreate all policies for promo_codes
DROP POLICY IF EXISTS "Admins can insert promo codes" ON public.promo_codes;
DROP POLICY IF EXISTS "Admins can delete promo codes" ON public.promo_codes;
DROP POLICY IF EXISTS "Admins can update promo codes" ON public.promo_codes;
DROP POLICY IF EXISTS "Anyone can read promo codes" ON public.promo_codes;

-- Create policies for promo_codes
CREATE POLICY "Admins can insert promo codes"
ON public.promo_codes
FOR INSERT
TO authenticated
WITH CHECK (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )
);

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

CREATE POLICY "Anyone can read promo codes"
ON public.promo_codes
FOR SELECT
TO authenticated
USING (true);

-- Drop and recreate all policies for user_promos
DROP POLICY IF EXISTS "Anyone can read user_promos" ON public.user_promos;
DROP POLICY IF EXISTS "Users can insert their own user_promos" ON public.user_promos;
DROP POLICY IF EXISTS "Users can delete their own user_promos" ON public.user_promos;
DROP POLICY IF EXISTS "Admins can manage user_promos" ON public.user_promos;

-- Create policies for user_promos
CREATE POLICY "Anyone can read user_promos"
ON public.user_promos
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can insert their own user_promos"
ON public.user_promos
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own user_promos"
ON public.user_promos
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

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
