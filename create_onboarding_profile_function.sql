CREATE OR REPLACE FUNCTION create_user_profile_onboarding(data JSONB) 
RETURNS void AS $$ 
BEGIN 
  INSERT INTO public.profiles (id, name, dob, gender, tribe, interests, onboarding_completed) 
  VALUES ( 
    auth.uid(), 
    data->>'name', 
    (data->>'dob')::DATE, 
    data->>'gender', 
    data->>'tribe', 
    ARRAY(SELECT jsonb_array_elements_text(data->'interests')), 
    TRUE 
  ); 
END; 
$$ LANGUAGE plpgsql SECURITY DEFINER;