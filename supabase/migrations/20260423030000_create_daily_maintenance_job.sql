-- supabase/migrations/20260423030000_create_daily_maintenance_job.sql

CREATE OR REPLACE FUNCTION daily_popularity_maintenance()
RETURNS VOID AS $$
BEGIN
    -- 1. Apply inactivity penalty and reset daily swipe counts
    UPDATE public.profiles
    SET 
        popularity_score = popularity_score - 1, -- Penalty for being inactive for a full day
        daily_swipe_count = 0, -- Reset swipe count
        last_swipe_count_reset_at = NOW()
    WHERE 
        last_active_at < NOW() - INTERVAL '1 day';

    -- 2. Recalculate scores for all users who were active in the last 24 hours
    -- This ensures scores are kept up-to-date
    PERFORM calculate_popularity_score(id) FROM public.profiles WHERE last_active_at >= NOW() - INTERVAL '1 day';

END;
$$ LANGUAGE plpgsql;
