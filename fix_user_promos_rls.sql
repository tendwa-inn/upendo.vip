-- Fix user_promos RLS policies to allow promo code application
-- This ensures users can apply promo codes through the RPC function

-- First, let's check current RLS policies
SELECT polname, polcmd, polroles::regrole[], polqual, polwithcheck 
FROM pg_policies 
WHERE tablename = 'user_promos';

-- Create a more permissive policy for users applying their own promo codes
-- This allows authenticated users to insert their own user_promos records
CREATE POLICY "Users can apply promo codes to themselves"
ON public.user_promos
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Alternative: Create a policy that allows the RPC function to work
-- This policy allows users to insert when they have a valid promo code
CREATE POLICY "Users can insert user_promos for valid promo codes"
ON public.user_promos
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id AND 
  EXISTS (
    SELECT 1 FROM promo_codes 
    WHERE promo_codes.id = promo_code_id 
    AND promo_codes.is_active = true
  )
);

-- Grant necessary permissions
GRANT INSERT ON public.user_promos TO authenticated;
GRANT SELECT ON public.user_promos TO authenticated;
GRANT DELETE ON public.user_promos TO authenticated;