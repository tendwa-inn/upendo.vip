-- Upendo Store: RPC Functions for Flare Economy
-- Run this in Supabase SQL Editor AFTER all table creation scripts

-- ============================================================
-- 1. add_flares — Atomic flare credit + transaction log
-- ============================================================
CREATE OR REPLACE FUNCTION public.add_flares(
  p_user_id UUID,
  p_amount INT,
  p_type TEXT,
  p_reference_id TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Upsert the balance
  INSERT INTO public.user_flares (user_id, balance, total_earned, updated_at)
  VALUES (p_user_id, p_amount, p_amount, NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    balance = user_flares.balance + EXCLUDED.balance,
    total_earned = user_flares.total_earned + EXCLUDED.total_earned,
    updated_at = NOW();

  -- Log the transaction
  INSERT INTO public.flare_transactions (user_id, amount, type, reference_id)
  VALUES (p_user_id, p_amount, p_type, p_reference_id);
END;
$$;

-- ============================================================
-- 2. spend_flares — Atomic flare debit with balance check
-- ============================================================
CREATE OR REPLACE FUNCTION public.spend_flares(
  p_user_id UUID,
  p_amount INT,
  p_type TEXT,
  p_reference_id TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_balance INT;
BEGIN
  -- Lock the row and check balance
  SELECT balance INTO v_current_balance
  FROM public.user_flares
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_current_balance IS NULL THEN
    RAISE EXCEPTION 'User has no flare account';
  END IF;

  IF v_current_balance < p_amount THEN
    RETURN FALSE; -- Insufficient funds
  END IF;

  -- Deduct
  UPDATE public.user_flares
  SET balance = balance - p_amount,
      total_spent = total_spent + p_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Log the transaction (negative amount)
  INSERT INTO public.flare_transactions (user_id, amount, type, reference_id)
  VALUES (p_user_id, -p_amount, p_type, p_reference_id);

  RETURN TRUE;
END;
$$;

-- ============================================================
-- 3. purchase_store_item — Full purchase flow
-- ============================================================
CREATE OR REPLACE FUNCTION public.purchase_store_item(
  p_user_id UUID,
  p_item_id BIGINT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_item RECORD;
  v_promo_id BIGINT;
  v_purchase_id BIGINT;
  v_promo_code TEXT;
  v_promo_type TEXT;
  v_duration_days INT;
  v_can_spend BOOLEAN;
BEGIN
  -- Fetch the store item
  SELECT * INTO v_item
  FROM public.store_items
  WHERE id = p_item_id AND is_active = TRUE;

  IF v_item IS NULL THEN
    RAISE EXCEPTION 'Store item not found or inactive';
  END IF;

  -- Try to spend flares
  SELECT public.spend_flares(p_user_id, v_item.price_flares, 'store_purchase', p_item_id::TEXT)
  INTO v_can_spend;

  IF NOT v_can_spend THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient flares');
  END IF;

  -- Determine promo type from category
  v_promo_type := CASE v_item.category
    WHEN 'swipes' THEN 'limited_swipes'
    WHEN 'themes' THEN 'theme'
    WHEN 'ghost_package' THEN 'unlimited_swipes'
    WHEN 'read_receipts' THEN 'profile_views'
    WHEN 'subscription' THEN
      CASE WHEN (v_item.effect->>'account_type') = 'vip' THEN 'vip_account' ELSE 'pro_account' END
    WHEN 'buttons' THEN 'popularity_boost'
    ELSE 'limited_swipes'
  END;

  -- Duration from effect or default 7 days
  v_duration_days := COALESCE((v_item.effect->>'duration_days')::INT, 7);

  -- Generate unique promo code
  v_promo_code := 'STORE-' || upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));

  -- Insert promo code
  INSERT INTO public.promo_codes (
    code, name, description, type, duration_days, max_uses, effect, expires_at
  ) VALUES (
    v_promo_code,
    v_item.name,
    v_item.description,
    v_promo_type,
    v_duration_days,
    1,
    v_item.effect,
    NOW() + (v_duration_days || ' days')::INTERVAL
  )
  RETURNING id INTO v_promo_id;

  -- Auto-apply: insert into user_promos
  INSERT INTO public.user_promos (user_id, promo_code_id, expires_at)
  VALUES (
    p_user_id,
    v_promo_id,
    NOW() + (v_duration_days || ' days')::INTERVAL
  );

  -- Record the purchase
  INSERT INTO public.store_purchases (user_id, store_item_id, promo_code_id, flare_cost)
  VALUES (p_user_id, p_item_id, v_promo_id, v_item.price_flares)
  RETURNING id INTO v_purchase_id;

  -- Handle subscription items: update profile account_type
  IF v_item.category = 'subscription' AND v_item.effect ? 'account_type' THEN
    UPDATE public.profiles
    SET account_type = v_item.effect->>'account_type',
        subscription_expires_at = NOW() + (v_duration_days || ' days')::INTERVAL
    WHERE id = p_user_id;
  END IF;

  -- Handle theme items: set selected_theme_id
  IF v_item.category = 'themes' AND v_item.effect ? 'theme_id' THEN
    UPDATE public.profiles
    SET selected_theme_id = v_item.effect->>'theme_id'
    WHERE id = p_user_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'purchase_id', v_purchase_id,
    'promo_code', v_promo_code,
    'promo_id', v_promo_id
  );
END;
$$;

-- ============================================================
-- 4. get_user_flare_balance — Quick balance lookup
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_user_flare_balance(p_user_id UUID)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_balance INT;
BEGIN
  SELECT balance INTO v_balance
  FROM public.user_flares
  WHERE user_id = p_user_id;

  RETURN COALESCE(v_balance, 0);
END;
$$;
