-- Add strikes column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS strikes INTEGER DEFAULT 0;

-- Create or replace the record_strike function
CREATE OR REPLACE FUNCTION public.record_strike(
  p_user_id UUID,
  p_other_user_id UUID,
  p_reason TEXT DEFAULT NULL,
  p_word TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  current_strikes INTEGER;
  new_strikes INTEGER;
  notification_message TEXT;
BEGIN
  -- Unmatch the users
  DELETE FROM public.matches
  WHERE (user1_id = p_user_id AND user2_id = p_other_user_id)
     OR (user1_id = p_other_user_id AND user2_id = p_user_id);

  -- Get current strikes count
  SELECT strikes INTO current_strikes 
  FROM public.profiles 
  WHERE id = p_user_id;
  
  -- Calculate new strikes count (warnings add 1 strike)
  new_strikes := COALESCE(current_strikes, 0) + 1;
  
  -- Update strikes count
  UPDATE public.profiles 
  SET strikes = new_strikes 
  WHERE id = p_user_id;
  
  -- Create notification message
  IF p_word IS NOT NULL THEN
    notification_message := 'Your account was flagged for using the word "' || p_word || '". ';
  ELSE
    notification_message := 'Your account was flagged for violating community guidelines. ';
  END IF;
  
  IF new_strikes >= 3 THEN
    notification_message := notification_message || 'Your account has been banned due to multiple violations.';
  ELSE
    notification_message := notification_message || 'You have received ' || new_strikes || ' strike(s). 3 strikes will result in a permanent ban.';
  END IF;
  
  -- Insert notification
  INSERT INTO public.notifications (user_id, type, message, created_at)
  VALUES (p_user_id, 'system', notification_message, NOW());
  
  -- If 3 or more strikes, ban the user
  IF new_strikes >= 3 THEN
    INSERT INTO public.user_actions (user_id, action_type, reason, status, created_at)
    VALUES (p_user_id, 'ban', 'Automatic ban due to 3 strikes', 'active', NOW());
  END IF;
  
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create index on strikes column for performance
CREATE INDEX IF NOT EXISTS idx_profiles_strikes ON public.profiles(strikes);

-- Add RLS policy for admins to update strikes
CREATE POLICY "Allow admins to update strikes" ON public.profiles 
FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());