'''-- Drop the old trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create the new function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, date_of_birth, gender, looking_for, interests, tribe, location)
  VALUES (
    new.id,
    'New User', -- Default name
    '1990-01-01', -- Default DoB
    'other', -- Default gender
    'all', -- Default looking_for
    '{}', -- Default empty interests array
    'Unknown', -- Default tribe
    '{"name": "Not specified"}' -- Default location JSON
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the new trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
'''