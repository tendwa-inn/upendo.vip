-- Fix create_user_profile_onboarding function to use correct column names and complete onboarding
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
    -- Default or handle non-binary cases as needed. For now, we can leave it NULL or set a default.
    v_looking_for := NULL;
  END IF;

  INSERT INTO public.profiles (id, name, date_of_birth, gender, looking_for, tribe, interests, onboarding_completed)
  VALUES (
    auth.uid(),
    data->>'name',
    (data->>'dob')::DATE,
    data->>'gender',
    v_looking_for, -- Set the automatically determined preference
    data->>'tribe',
    ARRAY(SELECT jsonb_array_elements_text(data->'interests')),
    TRUE -- Set onboarding as completed since this is the final step
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;