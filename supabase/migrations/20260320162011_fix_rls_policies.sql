-- Drop old policies
DROP POLICY IF EXISTS "Allow admin users to manage" ON public.word_filter;
DROP POLICY IF EXISTS "Allow admin users to read" ON public.flagged_content;
DROP POLICY IF EXISTS "Admins can manage actions" ON public.user_actions;
DROP POLICY IF EXISTS "Admins can manage system messages" ON public.system_messages;

-- Function to check for admin role from profiles table
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate policies with the correct role check
CREATE POLICY "Allow admin users to manage" ON public.word_filter
FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Allow admin users to read" ON public.flagged_content
FOR SELECT USING (is_admin());

CREATE POLICY "Admins can manage actions" ON public.user_actions
FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Admins can manage system messages" ON public.system_messages
FOR ALL USING (is_admin()) WITH CHECK (is_admin());
