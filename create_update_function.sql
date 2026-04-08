-- This script creates a secure, privileged function to handle profile updates.
-- This will bypass the broken RLS policies that are causing silent failures.

CREATE OR REPLACE FUNCTION public.update_user_profile(update_data jsonb)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET
    -- Update only the fields that can be changed in the modal or inline edit
    bio = COALESCE(update_data->>'bio', bio),
    occupation = COALESCE(update_data->>'occupation', occupation),
    education = COALESCE(update_data->>'education', education),
    height = COALESCE(update_data->>'height', height),
    drinking = COALESCE(update_data->>'drinking', drinking),
    smoking = COALESCE(update_data->>'smoking', smoking),
    religion = COALESCE(update_data->>'religion', religion),
    firstDate = COALESCE(update_data->>'firstDate', firstDate),
    loveLanguage = COALESCE(update_data->>'loveLanguage', loveLanguage)
  WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
