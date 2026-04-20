-- This script will remove the faulty function and security policy.

DROP FUNCTION IF EXISTS public.delete_user_account();

DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;
