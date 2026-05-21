-- =============================================
-- UPENDO STORE — Complete SQL Setup
-- Run this ENTIRE script in Supabase SQL Editor
-- =============================================

-- ============ 1. USER FLARES TABLE ============
CREATE TABLE IF NOT EXISTS public.user_flares (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  balance INT NOT NULL DEFAULT 0,
  total_earned INT NOT NULL DEFAULT 0,
  total_spent INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_flares ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own flares" ON public.user_flares;
CREATE POLICY "Users can view own flares"
  ON public.user_flares FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own flares" ON public.user_flares;
CREATE POLICY "Users can insert own flares"
  ON public.user_flares FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own flares" ON public.user_flares;
CREATE POLICY "Users can update own flares"
  ON public.user_flares FOR UPDATE
  USING (auth.uid() = user_id);

-- ============ 2. FLARE TRANSACTIONS TABLE ============
CREATE TABLE IF NOT EXISTS public.flare_transactions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount INT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('game_reward', 'store_purchase', 'admin_grant', 'promo_bonus', 'daily_bonus', 'profile_bonus')),
  reference_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.flare_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own transactions" ON public.flare_transactions;
CREATE POLICY "Users can view own transactions"
  ON public.flare_transactions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own transactions" ON public.flare_transactions;
CREATE POLICY "Users can insert own transactions"
  ON public.flare_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_flare_transactions_user_id ON public.flare_transactions(user_id);

-- ============ 3. STORE ITEMS TABLE ============
CREATE TABLE IF NOT EXISTS public.store_items (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('swipes', 'themes', 'ghost_package', 'read_receipts', 'subscription', 'buttons')),
  price_flares INT NOT NULL CHECK (price_flares > 0),
  effect JSONB NOT NULL DEFAULT '{}',
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.store_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active store items" ON public.store_items;
CREATE POLICY "Anyone can view active store items"
  ON public.store_items FOR SELECT
  USING (is_active = TRUE);

DROP POLICY IF EXISTS "Admin can manage store items" ON public.store_items;
CREATE POLICY "Admin can manage store items"
  ON public.store_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- ============ 4. STORE PURCHASES TABLE ============
CREATE TABLE IF NOT EXISTS public.store_purchases (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  store_item_id BIGINT NOT NULL REFERENCES public.store_items(id),
  promo_code_id BIGINT REFERENCES public.promo_codes(id),
  flare_cost INT NOT NULL,
  status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.store_purchases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own purchases" ON public.store_purchases;
CREATE POLICY "Users can view own purchases"
  ON public.store_purchases FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin can view all purchases" ON public.store_purchases;
CREATE POLICY "Admin can view all purchases"
  ON public.store_purchases FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Users can insert purchases" ON public.store_purchases;
CREATE POLICY "Users can insert purchases"
  ON public.store_purchases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_store_purchases_user_id ON public.store_purchases(user_id);

-- ============ 5. GAME SESSIONS TABLE ============
CREATE TABLE IF NOT EXISTS public.game_sessions (
  id BIGSERIAL PRIMARY KEY,
  player1_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  player2_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  match_id TEXT,
  game_type TEXT DEFAULT 'neon_ghost',
  rounds_total INT DEFAULT 3,
  rounds_completed INT DEFAULT 0,
  player1_score INT DEFAULT 0,
  player2_score INT DEFAULT 0,
  flares_awarded_p1 INT DEFAULT 0,
  flares_awarded_p2 INT DEFAULT 0,
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Players can view own game sessions" ON public.game_sessions;
CREATE POLICY "Players can view own game sessions"
  ON public.game_sessions FOR SELECT
  USING (auth.uid() = player1_id OR auth.uid() = player2_id);

DROP POLICY IF EXISTS "Players can create game sessions" ON public.game_sessions;
CREATE POLICY "Players can create game sessions"
  ON public.game_sessions FOR INSERT
  WITH CHECK (auth.uid() = player1_id);

DROP POLICY IF EXISTS "Players can update own game sessions" ON public.game_sessions;
CREATE POLICY "Players can update own game sessions"
  ON public.game_sessions FOR UPDATE
  USING (auth.uid() = player1_id OR auth.uid() = player2_id);

CREATE INDEX IF NOT EXISTS idx_game_sessions_match ON public.game_sessions(match_id);

-- ============ 6. RPC FUNCTIONS ============

-- add_flares
CREATE OR REPLACE FUNCTION public.add_flares(
  p_user_id UUID, p_amount INT, p_type TEXT, p_reference_id TEXT DEFAULT NULL
) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.user_flares (user_id, balance, total_earned, updated_at)
  VALUES (p_user_id, p_amount, p_amount, NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    balance = user_flares.balance + EXCLUDED.balance,
    total_earned = user_flares.total_earned + EXCLUDED.total_earned,
    updated_at = NOW();
  INSERT INTO public.flare_transactions (user_id, amount, type, reference_id)
  VALUES (p_user_id, p_amount, p_type, p_reference_id);
END;
$$;

-- spend_flares
CREATE OR REPLACE FUNCTION public.spend_flares(
  p_user_id UUID, p_amount INT, p_type TEXT, p_reference_id TEXT DEFAULT NULL
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_bal INT;
BEGIN
  SELECT balance INTO v_bal FROM public.user_flares WHERE user_id = p_user_id FOR UPDATE;
  IF v_bal IS NULL THEN RAISE EXCEPTION 'No flare account'; END IF;
  IF v_bal < p_amount THEN RETURN FALSE; END IF;
  UPDATE public.user_flares SET balance = balance - p_amount, total_spent = total_spent + p_amount, updated_at = NOW() WHERE user_id = p_user_id;
  INSERT INTO public.flare_transactions (user_id, amount, type, reference_id) VALUES (p_user_id, -p_amount, p_type, p_reference_id);
  RETURN TRUE;
END;
$$;

-- purchase_store_item
CREATE OR REPLACE FUNCTION public.purchase_store_item(p_user_id UUID, p_item_id BIGINT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_item RECORD; v_promo_id BIGINT; v_purchase_id BIGINT; v_code TEXT; v_ptype TEXT; v_days INT; v_ok BOOLEAN;
BEGIN
  SELECT * INTO v_item FROM public.store_items WHERE id = p_item_id AND is_active = TRUE;
  IF v_item IS NULL THEN RETURN jsonb_build_object('success', false, 'error', 'Item not found'); END IF;
  SELECT public.spend_flares(p_user_id, v_item.price_flares, 'store_purchase', p_item_id::TEXT) INTO v_ok;
  IF NOT v_ok THEN RETURN jsonb_build_object('success', false, 'error', 'Insufficient flares'); END IF;
  v_ptype := CASE v_item.category WHEN 'swipes' THEN 'limited_swipes' WHEN 'themes' THEN 'theme' WHEN 'ghost_package' THEN 'unlimited_swipes' WHEN 'read_receipts' THEN 'profile_views' WHEN 'subscription' THEN CASE WHEN (v_item.effect->>'account_type') = 'vip' THEN 'vip_account' ELSE 'pro_account' END WHEN 'buttons' THEN 'popularity_boost' ELSE 'limited_swipes' END;
  v_days := COALESCE((v_item.effect->>'duration_days')::INT, 7);
  v_code := 'STORE-' || upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));
  INSERT INTO public.promo_codes (code, name, description, type, duration_days, max_uses, effect) VALUES (v_code, v_item.name, v_item.description, v_ptype, v_days, 1, v_item.effect) RETURNING id INTO v_promo_id;
  INSERT INTO public.user_promos (user_id, promo_code_id, expires_at) VALUES (p_user_id, v_promo_id, NOW() + (v_days || ' days')::INTERVAL);
  INSERT INTO public.store_purchases (user_id, store_item_id, promo_code_id, flare_cost) VALUES (p_user_id, p_item_id, v_promo_id, v_item.price_flares) RETURNING id INTO v_purchase_id;
  IF v_item.category = 'subscription' AND v_item.effect ? 'account_type' THEN UPDATE public.profiles SET account_type = v_item.effect->>'account_type', subscription_expires_at = NOW() + (v_days || ' days')::INTERVAL WHERE id = p_user_id; END IF;
  IF v_item.category = 'themes' AND v_item.effect ? 'theme_id' THEN UPDATE public.profiles SET selected_theme_id = v_item.effect->>'theme_id' WHERE id = p_user_id; END IF;
  RETURN jsonb_build_object('success', true, 'purchase_id', v_purchase_id, 'promo_code', v_code, 'promo_id', v_promo_id);
END;
$$;

-- ============ 7. SEED STORE ITEMS ============
INSERT INTO public.store_items (name, description, category, price_flares, effect, sort_order) VALUES
  ('50 Extra Swipes', 'Get 50 additional daily swipes for 3 days', 'swipes', 100, '{"swipe_count": 50, "duration_days": 3}', 1),
  ('100 Extra Swipes', 'Get 100 additional daily swipes for 7 days', 'swipes', 180, '{"swipe_count": 100, "duration_days": 7}', 2),
  ('Unlimited Swipes (24h)', 'Swipe without limits for 24 hours', 'swipes', 250, '{"unlimited": true, "duration_days": 1}', 3),
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
  ('Cyber Theme', 'Red cyberpunk for 7 days', 'themes', 300, '{"theme_id": "cyber", "duration_days": 7}', 20),
  ('No Ghost Package', 'Neon ghost theme + ghost mode for 7 days', 'ghost_package', 400, '{"theme_id": "neon-ghost", "ghost_mode": true, "duration_days": 7}', 30),
  ('No Ghost Package (30 days)', 'Neon ghost theme + ghost mode for 30 days', 'ghost_package', 1000, '{"theme_id": "neon-ghost", "ghost_mode": true, "duration_days": 30}', 31),
  ('Read Receipts (7 days)', 'See when messages are read for 7 days', 'read_receipts', 200, '{"read_receipts": true, "duration_days": 7}', 40),
  ('Read Receipts (30 days)', 'See when messages are read for 30 days', 'read_receipts', 500, '{"read_receipts": true, "duration_days": 30}', 41),
  ('Pro Upgrade (3 days)', 'Unlock Pro features for 3 days', 'subscription', 500, '{"account_type": "pro", "duration_days": 3}', 50),
  ('Pro Upgrade (7 days)', 'Unlock Pro features for 7 days', 'subscription', 1000, '{"account_type": "pro", "duration_days": 7}', 51),
  ('VIP Upgrade (3 days)', 'Unlock VIP features for 3 days', 'subscription', 800, '{"account_type": "vip", "duration_days": 3}', 52),
  ('VIP Upgrade (7 days)', 'Unlock VIP features for 7 days', 'subscription', 1500, '{"account_type": "vip", "duration_days": 7}', 53),
  ('Vintage Button Pack', 'Retro media-player style buttons for 14 days', 'buttons', 120, '{"button_style": "vintage", "duration_days": 14}', 60),
  ('Upendo 205 Button Pack', 'Retro 3D push-button style for 14 days', 'buttons', 120, '{"button_style": "upendo-205", "duration_days": 14}', 61);

-- Done! All tables, RLS policies, RPC functions, and seed data created.
