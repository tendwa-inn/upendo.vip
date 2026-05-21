CREATE OR REPLACE FUNCTION public.delete_user_data(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF p_user_id IS NULL THEN RAISE EXCEPTION 'User ID required'; END IF;

  DELETE FROM notification_read_status WHERE user_id = p_user_id;
  DELETE FROM system_message_read_status WHERE user_id = p_user_id;
  DELETE FROM notifications WHERE user_id = p_user_id;
  DELETE FROM messages WHERE sender_id = p_user_id;
  DELETE FROM message_requests WHERE sender_id = p_user_id OR receiver_id = p_user_id;
  DELETE FROM connection_requests WHERE requester_id = p_user_id OR connection_applicant_id = p_user_id;
  DELETE FROM matches WHERE user1_id = p_user_id OR user2_id = p_user_id;
  DELETE FROM user_reports WHERE reported_by = p_user_id OR reported_user_id = p_user_id;
  DELETE FROM likes WHERE liker_id = p_user_id OR liked_id = p_user_id;
  DELETE FROM profile_views WHERE viewer_id = p_user_id OR viewed_id = p_user_id;
  DELETE FROM user_promos WHERE user_id = p_user_id;
  DELETE FROM connection_applications WHERE user_id = p_user_id;
  DELETE FROM user_actions WHERE user_id = p_user_id;
  DELETE FROM profiles WHERE id = p_user_id;
  DELETE FROM auth.users WHERE id = p_user_id;
END;
$$;
