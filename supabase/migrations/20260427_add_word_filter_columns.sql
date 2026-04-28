-- Add action and severity columns to word_filter table
ALTER TABLE public.word_filter
ADD COLUMN IF NOT EXISTS action TEXT DEFAULT 'warning',
ADD COLUMN IF NOT EXISTS severity INTEGER DEFAULT 1;