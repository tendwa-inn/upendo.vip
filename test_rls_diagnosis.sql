-- Test script to verify current RLS policies and authentication
-- Run this in Supabase SQL editor to diagnose the issue

-- Check if RLS is enabled on user_promos
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'user_promos') as policy_count
FROM pg_tables 
WHERE tablename = 'user_promos';

-- Check current policies on user_promos
SELECT 
    polname as policy_name,
    polcmd as command,
    polroles::regrole[] as roles,
    polqual as using_expression,
    polwithcheck as with_check_expression
FROM pg_policies 
WHERE tablename = 'user_promos'
ORDER BY polname;

-- Test if the apply_promo_code function exists and is properly configured
SELECT 
    proname as function_name,
    prosecdef as is_security_definer,
    proowner::regrole as owner
FROM pg_proc 
WHERE proname = 'apply_promo_code';

-- Check grants on user_promos table
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE table_name = 'user_promos'
AND grantee != 'postgres'
ORDER BY grantee, privilege_type;