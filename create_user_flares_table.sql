-- Upendo Store: User Flares System
-- Run this in Supabase SQL Editor

-- 1. user_flares — tracks each user's flare balance
CREATE TABLE IF NOT EXISTS public.user_flares (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  balance INT NOT NULL DEFAULT 0,
  total_earned INT NOT NULL DEFAULT 0,
  total_spent INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_flares ENABLE ROW LEVEL SECURITY;

-- Users can read their own flare balance
CREATE POLICY "Users can view own flares"
  ON public.user_flares FOR SELECT
  USING (auth.uid() = user_id);

-- Only functions modify flares (via service role)
CREATE POLICY "Service role manages flares"
  ON public.user_flares FOR ALL
  USING (auth.role() = 'service_role');

-- 2. flare_transactions — ledger of all flare activity
CREATE TABLE IF NOT EXISTS public.flare_transactions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount INT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('game_reward', 'store_purchase', 'admin_grant', 'promo_bonus', 'daily_bonus', 'profile_bonus')),
  reference_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.flare_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions
CREATE POLICY "Users can view own transactions"
  ON public.flare_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Only functions modify transactions
CREATE POLICY "Service role manages transactions"
  ON public.flare_transactions FOR ALL
  USING (auth.role() = 'service_role');

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_flare_transactions_user_id ON public.flare_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_flare_transactions_type ON public.flare_transactions(type);
