-- 20 Custom Swipe Button Styles (Store-only, 300 flares each, permanent)
-- Run this in Supabase SQL Editor

INSERT INTO store_items (name, description, category, price_flares, effect, image_url, is_active, sort_order)
VALUES
  -- ── NEON (8) ──
  ('Cyber Neon Buttons',     'Electric pink & cyan neon icons with vivid glow',         'buttons', 300, '{"button_style":"neon-cyber"}',           NULL, true, 200),
  ('Violet Neon Buttons',    'Purple & pink neon pulse with deep violet glow',          'buttons', 300, '{"button_style":"neon-violet"}',          NULL, true, 201),
  ('Ice Neon Buttons',       'Frozen cyan & blue neon with icy shimmer',                'buttons', 300, '{"button_style":"neon-ice"}',             NULL, true, 202),
  ('Solar Neon Buttons',     'Golden amber & orange neon with warm radiance',           'buttons', 300, '{"button_style":"neon-solar"}',           NULL, true, 203),
  ('Midnight Neon Buttons',  'Deep violet & sky blue neon on midnight canvas',          'buttons', 300, '{"button_style":"neon-midnight"}',        NULL, true, 204),
  ('Tangerine Neon Buttons', 'Fiery orange & red neon with tangerine glow',             'buttons', 300, '{"button_style":"neon-tangerine"}',       NULL, true, 205),
  ('Flamingo Neon Buttons',  'Hot pink & magenta neon with flamingo flare',             'buttons', 300, '{"button_style":"neon-flamingo"}',        NULL, true, 206),
  ('Lime Neon Buttons',      'Electric lime & green neon with vivid buzz',              'buttons', 300, '{"button_style":"neon-lime"}',            NULL, true, 207),

  -- ── CLASSIC (6) ──
  ('Glass Buttons',          'Frosted translucent white icons with subtle fade',        'buttons', 300, '{"button_style":"classic-glass"}',        NULL, true, 210),
  ('Chrome Buttons',         'Polished silver metallic icons with shadow depth',        'buttons', 300, '{"button_style":"classic-chrome"}',       NULL, true, 211),
  ('Copper Buttons',         'Warm copper & bronze icons with antique glow',            'buttons', 300, '{"button_style":"classic-copper"}',       NULL, true, 212),
  ('Mono Buttons',           'Pure white minimalist media-player icons',                'buttons', 300, '{"button_style":"classic-mono"}',         NULL, true, 213),
  ('Slate Buttons',          'Muted slate grey icons with understated elegance',        'buttons', 300, '{"button_style":"classic-slate"}',        NULL, true, 214),
  ('Gold Buttons',           'Regal gold crown & shield icons with soft shimmer',       'buttons', 300, '{"button_style":"classic-gold"}',         NULL, true, 215),

  -- ── GLOWY (3) ──
  ('Aurora Buttons',         'Multi-color aurora glow — green, blue, violet halos',    'buttons', 300, '{"button_style":"glowy-aurora"}',         NULL, true, 220),
  ('Ember Buttons',          'Warm ember glow — red, orange, yellow fire halos',       'buttons', 300, '{"button_style":"glowy-ember"}',          NULL, true, 221),
  ('Ocean Buttons',          'Deep ocean glow — cyan, blue, teal water halos',         'buttons', 300, '{"button_style":"glowy-ocean"}',          NULL, true, 222),
  ('Rose Buttons',           'Rose glow — coral, pink, magenta soft halos',            'buttons', 300, '{"button_style":"glowy-rose"}',           NULL, true, 223),

  -- ── POP (2) ──
  ('Bubble Pop Buttons',     'Bouncy pop animation on tap with pink & purple burst',   'buttons', 300, '{"button_style":"pop-bubble"}',           NULL, true, 230),
  ('Confetti Pop Buttons',   'Celebratory pop animation on tap with multicolor burst', 'buttons', 300, '{"button_style":"pop-confetti"}',          NULL, true, 231)
ON CONFLICT DO NOTHING;
