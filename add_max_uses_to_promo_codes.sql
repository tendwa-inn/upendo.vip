-- This script adds a 'max_uses' column to the 'promo_codes' table
-- to support limiting the number of times a promo code can be used.

ALTER TABLE public.promo_codes
ADD COLUMN IF NOT EXISTS max_uses INTEGER DEFAULT NULL;