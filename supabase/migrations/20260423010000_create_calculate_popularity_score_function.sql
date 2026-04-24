-- supabase/migrations/20260423010000_create_calculate_popularity_score_function.sql

CREATE OR REPLACE FUNCTION calculate_popularity_score(p_user_id UUID)
RETURNS NUMERIC(5, 2) AS $$
DECLARE
    score NUMERIC(5, 2) := 65.00;
    profile_record RECORD;
    strike_count INT;
    unmatch_count INT;
    views_count INT;
    days_inactive INT;
    days_since_last_message INT;
BEGIN
    -- 1. Get the user's profile data
    SELECT * INTO profile_record FROM public.profiles WHERE id = p_user_id;

    -- Return base score if profile doesn't exist
    IF NOT FOUND THEN
        RETURN 65.00;
    END IF;

    -- 2. Apply bonuses for account type
    IF profile_record.account_type = 'pro' THEN
        score := score + 15.00; -- Pro bonus
    ELSIF profile_record.account_type = 'vip' THEN
        score := score + 25.00; -- VIP bonus
    END IF;

    -- 3. Apply penalty for strikes
    strike_count := profile_record.strikes;
    score := score - (strike_count * 15.00);

    -- 4. Apply penalty for unmatches
    SELECT COUNT(*) INTO unmatch_count FROM public.unmatches WHERE unmatcher_id = p_user_id OR unmatched_id = p_user_id;
    score := score - (unmatch_count * 2.00);

    -- 5. Apply penalty for inactivity
    days_inactive := DATE_PART('day', NOW() - profile_record.last_active_at);
    IF days_inactive >= 1 THEN
        score := score - days_inactive;
    ELSE
        score := score + 1.00; -- Bonus for being active today
    END IF;

    -- 6. Apply penalty for not replying to messages
    IF profile_record.last_message_sent_at IS NOT NULL THEN
        days_since_last_message := DATE_PART('day', NOW() - profile_record.last_message_sent_at);
        IF days_since_last_message >= 1 THEN
            score := score - 3.00;
        ELSE
            score := score + 0.50; -- Bonus for replying today
        END IF;
    ELSE
        -- If they have never sent a message, apply a small penalty
        score := score - 1.00;
    END IF;

    -- 7. Apply bonus/penalty for swiping
    IF profile_record.daily_swipe_count >= 10 THEN
        score := score + 5.00;
    ELSE
        score := score - 3.00;
    END IF;

    -- 8. Apply bonus for profile views
    SELECT COUNT(*) INTO views_count FROM public.profile_views WHERE viewed_id = p_user_id AND created_at >= NOW() - INTERVAL '1 day';
    score := score + (views_count * 0.02);

    -- Ensure score does not go below zero
    IF score < 0 THEN
        score := 0.00;
    END IF;

    -- Update the profile with the new score
    UPDATE public.profiles SET popularity_score = score WHERE id = p_user_id;

    RETURN score;
END;
$$ LANGUAGE plpgsql;
