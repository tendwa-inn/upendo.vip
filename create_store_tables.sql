-- Upendo Store: Store Items and Purchases
-- Run this in Supabase SQL Editor AFTER create_user_flares_table.sql

-- 1. store_items — admin-managed inventory
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

-- Enable RLS
ALTER TABLE public.store_items ENABLE ROW LEVEL SECURITY;

-- Everyone can view active store items
CREATE POLICY "Anyone can view active store items"
  ON public.store_items FOR SELECT
  USING (is_active = TRUE);

-- Admin can manage all store items
CREATE POLICY "Admin manages store items"
  ON public.store_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- 2. store_purchases — purchase history
CREATE TABLE IF NOT EXISTS public.store_purchases (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  store_item_id BIGINT NOT NULL REFERENCES public.store_items(id),
  promo_code_id BIGINT REFERENCES public.promo_codes(id),
  flare_cost INT NOT NULL,
  status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.store_purchases ENABLE ROW LEVEL SECURITY;

-- Users can view their own purchases
CREATE POLICY "Users can view own purchases"
  ON public.store_purchases FOR SELECT
  USING (auth.uid() = user_id);

-- Admin can view all purchases
CREATE POLICY "Admin can view all purchases"
  ON public.store_purchases FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Only functions modify purchases
CREATE POLICY "Service role manages purchases"
  ON public.store_purchases FOR ALL
  USING (auth.role() = 'service_role');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_store_purchases_user_id ON public.store_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_store_items_category ON public.store_items(category);
CREATE INDEX IF NOT EXISTS idx_store_items_active ON public.store_items(is_active);
