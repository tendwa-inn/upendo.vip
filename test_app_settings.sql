-- Test query to check the current app_settings data
SELECT * FROM public.app_settings;

-- Check if daily_vibe_changes column exists and has values
SELECT 
    account_type,
    daily_vibe_changes,
    swipes_per_day,
    message_requests
FROM public.app_settings 
ORDER BY account_type;