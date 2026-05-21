
-- Function to handle liking a user.
-- This function is secure and respects RLS policies.
CREATE OR REPLACE FUNCTION like_user (liked_user_id_param uuid)
RETURNS json AS $$
DECLARE
  liker_user_id uuid := auth.uid();
  match_exists boolean;
  new_match_id bigint;
  notification_payload json;
BEGIN
  -- Insert the like
  INSERT INTO public.likes (liker_id, liked_id) 
  VALUES (liker_user_id, liked_user_id_param)
  ON CONFLICT (liker_id, liked_id) DO NOTHING;

  -- Check for a mutual like
  SELECT EXISTS (
    SELECT 1
    FROM public.likes
    WHERE liker_id = liked_user_id_param AND liked_id = liker_user_id
  ) INTO match_exists;

  -- If it's a match, create a match record
  IF match_exists THEN
  INSERT INTO public.matches (user1_id, user2_id)
  VALUES (
    LEAST(liker_user_id, liked_user_id_param),
    GREATEST(liker_user_id, liked_user_id_param)
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO new_match_id;

    -- Return match details
    RETURN json_build_object('matched', true, 'match_id', new_match_id);
  ELSE
    -- It's not a match, so create a notification
    INSERT INTO public.notifications (user_id, actor_id, type, title, message)
    VALUES (
      liked_user_id_param, 
      liker_user_id, 
      'new_like', 
      'You have a new like!',
      (SELECT name FROM public.profiles WHERE id = liker_user_id) || ' liked your profile.'
    );
    
    -- Return not matched
    RETURN json_build_object('matched', false);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
