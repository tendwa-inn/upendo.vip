-- Add account_type field to profiles table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'account_type'
  ) THEN
    ALTER TABLE profiles ADD COLUMN account_type VARCHAR(20) DEFAULT 'free' CHECK (account_type IN ('free', 'pro', 'vip'));
  END IF;
END $$;

-- Add subscription_tier field if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'subscription_tier'
  ) THEN
    ALTER TABLE profiles ADD COLUMN subscription_tier VARCHAR(50);
  END IF;
END $$;

-- Update existing users to have 'free' account type if not set
UPDATE profiles SET account_type = 'free' WHERE account_type IS NULL;

-- Grant permissions (these should already exist, but just in case)
GRANT SELECT ON profiles TO anon;
GRANT ALL PRIVILEGES ON profiles TO authenticated;

-- Create row level security policy for account type if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'Users can view own profile'
  ) THEN
    CREATE POLICY "Users can view own profile" ON profiles
      FOR SELECT USING (auth.uid() = id);
  END IF;
END $$;