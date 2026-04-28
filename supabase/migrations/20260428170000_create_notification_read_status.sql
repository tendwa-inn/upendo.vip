CREATE TABLE public.notification_read_status (
  notification_id UUID NOT NULL,
  user_id UUID NOT NULL,
  read_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (notification_id, user_id),
  FOREIGN KEY (notification_id) REFERENCES public.notifications(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE public.notification_read_status ENABLE ROW LEVEL SECURITY;
