-- 40 Deluxe Edition Swipe Buttons (Store-only, 500 flares each, permanent)
-- Each button changes the ENTIRE find page layout, seek bar, and button positioning
-- Run in Supabase SQL Editor

INSERT INTO store_items (name, description, category, price_flares, effect, image_url, is_active, sort_order)
VALUES
  -- ── ROW BOTTOM — horizontal strip ──
  ('Neon Outline Buttons',      'Hollow neon circles with vivid glow — buttons center-bottom',       'buttons', 500, '{"button_style":"deluxe-neon-outline"}',   NULL, true, 300),
  ('Spinner Ring Buttons',      'Gradient ring borders that feel alive — buttons center-bottom',     'buttons', 500, '{"button_style":"deluxe-spinner-ring"}',   NULL, true, 301),
  ('Rounded Pill Buttons',      'Full pill-shaped buttons with text labels — buttons center-bottom', 'buttons', 500, '{"button_style":"deluxe-rounded-pill"}',   NULL, true, 302),
  ('Square Solid Buttons',      'Bold solid squares with clean edges — buttons center-bottom',       'buttons', 500, '{"button_style":"deluxe-square-solid"}',   NULL, true, 303),
  ('Diamond Buttons',           'Rotated 45° diamond shapes with gradients — buttons center-bottom', 'buttons', 500, '{"button_style":"deluxe-diamond"}',        NULL, true, 304),
  ('Morphing Buttons',          'Organic blobs that shift shape continuously — buttons center-bottom','buttons', 500, '{"button_style":"deluxe-morphing"}',       NULL, true, 305),
  ('Capsule Buttons',           'Wide capsule buttons with text labels — buttons center-bottom',     'buttons', 500, '{"button_style":"deluxe-capsule"}',        NULL, true, 306),
  ('Torch Buttons',             'Dark circles with inner light and amber glow — buttons center-bottom','buttons', 500, '{"button_style":"deluxe-torch"}',          NULL, true, 307),
  ('Ripple Buttons',            'Rings that ripple outward on idle — buttons center-bottom',         'buttons', 500, '{"button_style":"deluxe-ripple"}',         NULL, true, 308),
  ('Prism Buttons',             'Rainbow gradient squares — buttons center-bottom',                  'buttons', 500, '{"button_style":"deluxe-prism"}',          NULL, true, 309),
  ('Triangle Set Buttons',      'Triangle-shaped action buttons — buttons center-bottom',            'buttons', 500, '{"button_style":"deluxe-triangle-set"}',   NULL, true, 310),

  -- ── CENTER CLUSTER — hero-sized center layout ──
  ('Cluster Buttons',           'Hero like with flanked nope/rewind — center cluster',               'buttons', 500, '{"button_style":"deluxe-cluster"}',        NULL, true, 320),
  ('Tiered Buttons',            'Descending sizes: big like, medium nope, small undo — center',      'buttons', 500, '{"button_style":"deluxe-tiered"}',         NULL, true, 321),

  -- ── SIDE RIGHT — classic right side with unique shapes ──
  ('Gothic Buttons',            'Hexagonal black buttons with silver border — right side',           'buttons', 500, '{"button_style":"deluxe-gothic"}',         NULL, true, 330),
  ('Chrome Ring Buttons',       'Metallic chrome rings with dark centers — right side',              'buttons', 500, '{"button_style":"deluxe-chrome-ring"}',    NULL, true, 331),
  ('Sketch Buttons',            'Dashed rough-edged sketchy boxes — right side',                     'buttons', 500, '{"button_style":"deluxe-sketch"}',         NULL, true, 332),
  ('Tape Label Buttons',        'Retro cassette-tape style labels — right side',                     'buttons', 500, '{"button_style":"deluxe-tape"}',           NULL, true, 333),
  ('Pearl Buttons',             'Iridescent pearl spheres with inner glow — right side',             'buttons', 500, '{"button_style":"deluxe-pearl"}',          NULL, true, 334),
  ('Morse Code Buttons',        'Flickering circles that pulse like morse — right side',             'buttons', 500, '{"button_style":"deluxe-morse"}',          NULL, true, 335),
  ('Underwater Buttons',        'Floating bubble buttons with gentle bob — right side',              'buttons', 500, '{"button_style":"deluxe-underwater"}',     NULL, true, 336),
  ('Stealth Buttons',           'Nearly invisible matte ghost buttons — right side',                 'buttons', 500, '{"button_style":"deluxe-stealth"}',        NULL, true, 337),
  ('Lava Buttons',              'Molten lava gradient with fire glow — right side',                  'buttons', 500, '{"button_style":"deluxe-lava"}',           NULL, true, 338),
  ('Cyber Slash Buttons',       'Slanted parallelogram cyber buttons — right side',                  'buttons', 500, '{"button_style":"deluxe-cyber-slash"}',    NULL, true, 339),
  ('Wireframe Buttons',         'Ultra-minimal wireframe circles — right side',                      'buttons', 500, '{"button_style":"deluxe-wireframe"}',      NULL, true, 340),
  ('Cross Stitch Buttons',      'Dashed border fabric-inspired buttons — right side',                'buttons', 500, '{"button_style":"deluxe-cross-stitch"}',   NULL, true, 341),
  ('Plasma Buttons',            'Plasma ball radial gradient spheres — right side',                  'buttons', 500, '{"button_style":"deluxe-plasma"}',         NULL, true, 342),

  -- ── SIDE LEFT — left side unique layouts ──
  ('Typewriter Buttons',        'Mechanical typewriter keys with press effect — left side',          'buttons', 500, '{"button_style":"deluxe-typewriter"}',     NULL, true, 350),
  ('Sapphire Buttons',          'Hexagonal gem-cut sapphire buttons — left side',                    'buttons', 500, '{"button_style":"deluxe-sapphire"}',       NULL, true, 351),
  ('Stamp Buttons',             'Double-border stamp-style circles — left side',                     'buttons', 500, '{"button_style":"deluxe-stamp"}',          NULL, true, 352),
  ('Crown Buttons',             'Regal gold and purple gradient spheres — left side',                'buttons', 500, '{"button_style":"deluxe-crown"}',          NULL, true, 353),
  ('Shield Buttons',            'Shield-shaped action buttons — left side',                          'buttons', 500, '{"button_style":"deluxe-shield"}',         NULL, true, 354),
  ('Compass Buttons',           'Directional arrow buttons with compass rings — left side',          'buttons', 500, '{"button_style":"deluxe-compass"}',        NULL, true, 355),

  -- ── RADIAL — arranged around a point ──
  ('Sunburst Buttons',          'Radial burst layout around center point — bottom-right',            'buttons', 500, '{"button_style":"deluxe-sunburst"}',       NULL, true, 360),
  ('Atom Buttons',              'Atomic orbital arrangement with thin rings — bottom-right',         'buttons', 500, '{"button_style":"deluxe-atom"}',           NULL, true, 361),
  ('Orbit Buttons',             'Planetary orbit layout with gradient planets — bottom-right',       'buttons', 500, '{"button_style":"deluxe-orbit"}',          NULL, true, 362),

  -- ── INLINE — compact horizontal strip ──
  ('Minimal Dot Buttons',       'Tiny glowing dots — ultra minimal — center-bottom',                 'buttons', 500, '{"button_style":"deluxe-minimal-dot"}',    NULL, true, 370),
  ('Bar Segment Buttons',       'Wide segmented bar buttons — center-bottom',                        'buttons', 500, '{"button_style":"deluxe-bar-segment"}',    NULL, true, 371),
  ('Text Only Buttons',         'Pure text no icons — bold uppercase — center-bottom',               'buttons', 500, '{"button_style":"deluxe-text-only"}',      NULL, true, 372),
  ('Emoji Face Buttons',        'Expressive emoji faces for each action — center-bottom',            'buttons', 500, '{"button_style":"deluxe-emoji-face"}',     NULL, true, 373),
  ('Gem Buttons',               'Octagonal gem-cut buttons with jewel gradients — center-bottom',    'buttons', 500, '{"button_style":"deluxe-gem"}',            NULL, true, 374)
ON CONFLICT DO NOTHING;
