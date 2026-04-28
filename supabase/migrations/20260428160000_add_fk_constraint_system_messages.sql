ALTER TABLE public.system_message_read_status
ADD CONSTRAINT fk_system_message_id
FOREIGN KEY (message_id)
REFERENCES public.system_messages(id)
ON DELETE CASCADE;
