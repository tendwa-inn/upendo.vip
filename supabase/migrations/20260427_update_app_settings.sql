-- Alter the table to rename the column
ALTER TABLE app_settings RENAME COLUMN swipes_per_week TO swipes_per_day;

-- Update the values for the 'free' tier
UPDATE app_settings
SET
  swipes_per_day = 35,
  rewind_count = 4,
  visibility_rate = 0.5,
  message_requests = 3
WHERE account_type = 'free';

-- Update the values for the 'pro' tier
UPDATE app_settings
SET
  swipes_per_day = 150,
  rewind_count = 10,
  visibility_rate = 0.65,
  message_requests = 7
WHERE account_type = 'pro';

-- Update the values for the 'vip' tier
UPDATE app_settings
SET
  swipes_per_day = 300,
  rewind_count = -1, -- -1 for unlimited
  visibility_rate = 0.8,
  message_requests = 15
WHERE account_type = 'vip';
