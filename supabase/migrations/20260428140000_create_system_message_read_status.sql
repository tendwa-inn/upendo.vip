CREATE TABLE public.system_message_read_status (
  message_id UUID NOT NULL,
  user_id UUID NOT NULL,
  read_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (message_id, user_id),
  FOREIGN KEY (message_id) REFERENCES public.system_messages(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE public.system_message_read_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to manage their own read status" ON public.system_message_read_status
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
