-- Add columns for reporting system to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS warnings INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS suspension_end TIMESTAMPTZ;

-- Add columns for reporting system to reports table
ALTER TABLE public.reports
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS admin_note TEXT,
ADD COLUMN IF NOT EXISTS processed_at TIMESTAMPTZ;

-- Add columns for reporting system to appeals table  
ALTER TABLE public.appeals
ADD COLUMN IF NOT EXISTS admin_note TEXT,
ADD COLUMN IF NOT EXISTS processed_at TIMESTAMPTZ;