CREATE TABLE public.system_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  message TEXT NOT NULL,
  type TEXT,
  target TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.system_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admins to manage system messages" ON public.system_messages
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());
