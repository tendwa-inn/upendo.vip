-- Upendo Store: Seed Default Store Items
-- Run this in Supabase SQL Editor AFTER create_store_tables.sql

-- Clear existing items (optional — remove if you want to keep manual entries)
-- DELETE FROM public.store_items;

-- ============ SWIPES ============
INSERT INTO public.store_items (name, description, category, price_flares, effect, sort_order) VALUES
  ('50 Extra Swipes', 'Get 50 additional daily swipes for 3 days', 'swipes', 100, '{"swipe_count": 50, "duration_days": 3}', 1),
  ('100 Extra Swipes', 'Get 100 additional daily swipes for 7 days', 'swipes', 180, '{"swipe_count": 100, "duration_days": 7}', 2),
  ('Unlimited Swipes (24h)', 'Swipe without limits for 24 hours', 'swipes', 250, '{"unlimited": true, "duration_days": 1}', 3);

-- ============ THEMES ============
INSERT INTO public.store_items (name, description, category, price_flares, effect, sort_order) VALUES
  ('Midnight Ocean Theme', 'Cool blue ocean vibes for 7 days', 'themes', 150, '{"theme_id": "midnight-ocean", "duration_days": 7}', 10),
  ('Arctic Frost Theme', 'Icy cyan tones for 7 days', 'themes', 150, '{"theme_id": "arctic-frost", "duration_days": 7}', 11),
  ('Sunset Blaze Theme', 'Warm orange sunset for 7 days', 'themes', 150, '{"theme_id": "sunset-blaze", "duration_days": 7}', 12),
  ('Emerald Forest Theme', 'Deep green forest for 7 days', 'themes', 150, '{"theme_id": "emerald-forest", "duration_days": 7}', 13),
  ('Purple Haze Theme', 'Mystic purple atmosphere for 7 days', 'themes', 150, '{"theme_id": "purple-haze", "duration_days": 7}', 14),
  ('Royal Gold Theme', 'Premium gold luxury for 7 days', 'themes', 300, '{"theme_id": "royal-gold", "duration_days": 7}', 15),
  ('Neon Cyber Theme', 'Cyberpunk neon aesthetic for 7 days', 'themes', 300, '{"theme_id": "neon-cyber", "duration_days": 7}', 16),
  ('Rose Gold Theme', 'Elegant rose gold for 7 days', 'themes', 300, '{"theme_id": "rose-gold", "duration_days": 7}', 17),
  ('Neon Ghost Theme', 'Ghostly green neon for 7 days', 'themes', 300, '{"theme_id": "neon-ghost", "duration_days": 7}', 18),
  ('Bubble Gum Theme', 'Sweet pink bubblegum for 7 days', 'themes', 300, '{"theme_id": "bubble-gum", "duration_days": 7}', 19),
  ('Cyber Theme', 'Red cyberpunk for 7 days', 'themes', 300, '{"theme_id": "cyber", "duration_days": 7}', 20);

-- ============ GHOST PACKAGE ============
INSERT INTO public.store_items (name, description, category, price_flares, effect, sort_order) VALUES
  ('No Ghost Package', 'Exclusive neon ghost theme for 7 days + ghost mode enabled', 'ghost_package', 400, '{"theme_id": "neon-ghost", "ghost_mode": true, "duration_days": 7}', 30),
  ('No Ghost Package (30 days)', 'Exclusive neon ghost theme for 30 days + ghost mode enabled', 'ghost_package', 1000, '{"theme_id": "neon-ghost", "ghost_mode": true, "duration_days": 30}', 31);

-- ============ READ RECEIPTS ============
INSERT INTO public.store_items (name, description, category, price_flares, effect, sort_order) VALUES
  ('Read Receipts (7 days)', 'See when your messages are read for 7 days', 'read_receipts', 200, '{"read_receipts": true, "duration_days": 7}', 40),
  ('Read Receipts (30 days)', 'See when your messages are read for 30 days', 'read_receipts', 500, '{"read_receipts": true, "duration_days": 30}', 41);

-- ============ SUBSCRIPTIONS ============
INSERT INTO public.store_items (name, description, category, price_flares, effect, sort_order) VALUES
  ('Pro Upgrade (3 days)', 'Unlock Pro features for 3 days', 'subscription', 500, '{"account_type": "pro", "duration_days": 3}', 50),
  ('Pro Upgrade (7 days)', 'Unlock Pro features for 7 days', 'subscription', 1000, '{"account_type": "pro", "duration_days": 7}', 51),
  ('VIP Upgrade (3 days)', 'Unlock VIP features for 3 days', 'subscription', 800, '{"account_type": "vip", "duration_days": 3}', 52),
  ('VIP Upgrade (7 days)', 'Unlock VIP features for 7 days', 'subscription', 1500, '{"account_type": "vip", "duration_days": 7}', 53);

-- ============ BUTTONS ============
INSERT INTO public.store_items (name, description, category, price_flares, effect, sort_order) VALUES
  ('Vintage Button Pack', 'Retro media-player style swipe buttons', 'buttons', 120, '{"button_style": "vintage", "duration_days": 14}', 60),
  ('Upendo 205 Button Pack', 'Retro 3D push-button style for 14 days', 'buttons', 120, '{"button_style": "upendo-205", "duration_days": 14}', 61),
  ('White Clean Button Pack', 'Minimalist white outline buttons for 14 days', 'buttons', 120, '{"button_style": "white-clean", "duration_days": 14}', 62);
