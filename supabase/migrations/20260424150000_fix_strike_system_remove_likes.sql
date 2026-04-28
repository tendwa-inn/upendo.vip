-- Update the message filtering function to also remove users from like lists when strikes occur
CREATE OR REPLACE FUNCTION public.check_message_for_filtered_words()
RETURNS TRIGGER AS $$
DECLARE
    filtered_word RECORD;
    word_action RECORD;
    match_record RECORD;
    other_user_id UUID;
    current_strikes INTEGER;
    new_strikes INTEGER;
    notification_message TEXT;
    expires_at_timestamp TIMESTAMPTZ;
BEGIN
    RAISE NOTICE '[TRIGGER] check_message_for_filtered_words started for message content: %s', NEW.content;

    FOR filtered_word IN SELECT * FROM public.word_filter LOOP
        -- Use word boundaries for more accurate matching
        IF NEW.content ~* ('\m' || filtered_word.word || '\m') THEN
            RAISE NOTICE '[TRIGGER] Matched word: "%" in message.', filtered_word.word;

            -- Log the flagged content
            INSERT INTO public.flagged_content (user_id, content, context, word_id)
            VALUES (NEW.sender_id, NEW.content, 'message', filtered_word.id);

            -- Find the corresponding action for this word
            SELECT * INTO word_action FROM public.word_actions WHERE word_id = filtered_word.id;

            -- Proceed only if an action is defined for the word
            IF FOUND THEN
                RAISE NOTICE '[TRIGGER] Action found for word: %s', word_action.action_type;

                -- Find the match to identify the other user for unmatching
                SELECT * INTO match_record FROM public.matches WHERE id = NEW.match_id;

                IF NOT FOUND THEN
                    RAISE NOTICE '[TRIGGER] CRITICAL: Match not found for match_id: %. Aborting action.', NEW.match_id;
                    RETURN NEW; -- Exit trigger if no match is found
                END IF;

                -- Determine the other user's ID
                IF match_record.user1_id = NEW.sender_id THEN
                    other_user_id := match_record.user2_id;
                ELSE
                    other_user_id := match_record.user1_id;
                END IF;

                -- Unmatch the users (remove from matches table)
                DELETE FROM public.matches WHERE id = NEW.match_id;
                RAISE NOTICE '[TRIGGER] Unmatched users: % and %', NEW.sender_id, other_user_id;

                -- Remove users from each other's like lists
                DELETE FROM public.likes 
                WHERE (liker_id = NEW.sender_id AND liked_id = other_user_id)
                   OR (liker_id = other_user_id AND liked_id = NEW.sender_id);
                RAISE NOTICE '[TRIGGER] Removed users from like lists: % and %', NEW.sender_id, other_user_id;

                -- Handle the specific action type
                IF word_action.action_type = 'warning' THEN
                    -- Get current strikes and increment
                    SELECT strikes INTO current_strikes FROM public.profiles WHERE id = NEW.sender_id;
                    new_strikes := COALESCE(current_strikes, 0) + 1;

                    UPDATE public.profiles SET strikes = new_strikes WHERE id = NEW.sender_id;
                    RAISE NOTICE '[TRIGGER] User % strikes updated to: %', NEW.sender_id, new_strikes;

                    -- Create and send notification
                    notification_message := 'You have received a strike for using inappropriate language ("' || filtered_word.word || '"). You now have ' || new_strikes || ' strike(s).';
                    INSERT INTO public.notifications (user_id, type, message) VALUES (NEW.sender_id, 'system', notification_message);

                    -- Check for automatic ban
                    IF new_strikes >= 3 THEN
                        INSERT INTO public.user_actions (user_id, action_type, reason, status) 
                        VALUES (NEW.sender_id, 'ban', 'Automatic ban due to accumulating 3 strikes.', 'active');
                        RAISE NOTICE '[TRIGGER] User % automatically banned.', NEW.sender_id;
                    END IF;

                ELSE -- For 'suspension' or 'ban'
                    expires_at_timestamp := NULL;
                    IF word_action.action_type = 'suspension' AND word_action.duration_days IS NOT NULL THEN
                        expires_at_timestamp := NOW() + (word_action.duration_days * INTERVAL '1 day');
                    END IF;

                    INSERT INTO public.user_actions (user_id, action_type, reason, expires_at, status)
                    VALUES (NEW.sender_id, word_action.action_type, 'Automatic action for using the word: ' || filtered_word.word, expires_at_timestamp, 'active');
                    RAISE NOTICE '[TRIGGER] Action % applied to user %.', word_action.action_type, NEW.sender_id;
                END IF;
                
                -- Since an action was taken, we can stop checking for other words
                RETURN NEW;
            END IF;
        END IF;
    END LOOP;

    RAISE NOTICE '[TRIGGER] No filtered words found in message.';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Also update the record_strike function to handle like removal for consistency
CREATE OR REPLACE FUNCTION public.record_strike(
  p_user_id UUID,
  p_other_user_id UUID DEFAULT NULL,
  p_reason TEXT DEFAULT NULL,
  p_word TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  current_strikes INTEGER;
  new_strikes INTEGER;
  notification_message TEXT;
BEGIN
  -- Unmatch the users if other_user_id is provided
  IF p_other_user_id IS NOT NULL THEN
    DELETE FROM public.matches
    WHERE (user1_id = p_user_id AND user2_id = p_other_user_id)
       OR (user1_id = p_other_user_id AND user2_id = p_user_id);
    
    -- Remove from like lists
    DELETE FROM public.likes 
    WHERE (liker_id = p_user_id AND liked_id = p_other_user_id)
       OR (liker_id = p_other_user_id AND liked_id = p_user_id);
  END IF;

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