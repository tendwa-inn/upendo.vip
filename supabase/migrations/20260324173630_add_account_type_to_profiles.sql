ALTER TABLE public.profiles ADD COLUMN account_type TEXT DEFAULT 'free';
UPDATE public.profiles SET account_type = 'free' WHERE account_type IS NULL;
