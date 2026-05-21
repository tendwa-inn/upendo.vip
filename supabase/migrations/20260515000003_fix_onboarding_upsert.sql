-- Fix the create_user_profile_onboarding function to handle existing profiles
-- This resolves the duplicate key error when profile already exists

CREATE OR REPLACE FUNCTION create_user_profile_onboarding(data JSONB)
RETURNS void AS $$
DECLARE
  v_looking_for TEXT;
BEGIN
  -- Automatically determine the 'looking_for' gender based on the user's selected gender.
  IF data->>'gender' = 'male' THEN
    v_looking_for := 'female';
  ELSIF data->>'gender' = 'female' THEN
    v_looking_for := 'male';
  ELSE
    -- Default or handle non-binary cases as needed
    v_looking_for := NULL;
  END IF;

  -- Use UPSERT to handle both new and existing profiles
  INSERT INTO public.profiles (id, name, date_of_birth, gender, looking_for, tribe, interests, onboarding_completed)
  VALUES (
    auth.uid(),
    data->>'name',
    (data->>'dob')::DATE,
    data->>'gender',
    v_looking_for,
    data->>'tribe',
    ARRAY(SELECT jsonb_array_elements_text(data->'interests')),
    TRUE -- Set onboarding as completed since this is the final step
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    date_of_birth = EXCLUDED.date_of_birth,
    gender = EXCLUDED.gender,
    looking_for = EXCLUDED.looking_for,
    tribe = EXCLUDED.tribe,
    interests = EXCLUDED.interests,
    onboarding_completed = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;