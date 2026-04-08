CREATE TABLE public.app_settings (
    id SERIAL PRIMARY KEY,
    account_type TEXT NOT NULL UNIQUE,
    swipes_per_week INT NOT NULL,
    rewind_count INT NOT NULL,
    visibility_rate INT NOT NULL,
    message_requests INT NOT NULL,
    profile_views INT NOT NULL,
    ghost_mode BOOLEAN NOT NULL,
    read_receipts BOOLEAN NOT NULL
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage app settings" ON public.app_settings FOR ALL
USING (auth.jwt()->>'role' = 'admin') WITH CHECK (auth.jwt()->>'role' = 'admin');

CREATE POLICY "Users can read app settings" ON public.app_settings FOR SELECT
USING (true);

INSERT INTO public.app_settings (account_type, swipes_per_week, rewind_count, visibility_rate, message_requests, profile_views, ghost_mode, read_receipts) VALUES
('free', 50, 5, 50, 10, 10, false, false),
('pro', -1, -1, 75, -1, -1, true, true),
('vip', -1, -1, 100, -1, -1, true, true);
