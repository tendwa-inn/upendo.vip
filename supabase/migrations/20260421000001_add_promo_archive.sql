-- Add is_archived column to promo_codes table
ALTER TABLE public.promo_codes 
ADD COLUMN is_archived BOOLEAN DEFAULT FALSE;

-- Create index for better performance
CREATE INDEX idx_promo_codes_is_archived ON public.promo_codes(is_archived) 
WHERE is_archived = TRUE;