ALTER TABLE public.user_actions
ADD COLUMN status TEXT DEFAULT 'active',
ADD COLUMN appeal_reason TEXT;