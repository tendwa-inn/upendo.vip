-- Add message column to message_requests table
ALTER TABLE public.message_requests ADD COLUMN IF NOT EXISTS message TEXT;
