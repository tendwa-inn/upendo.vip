-- Add welcome_message_mode column to system_messages table
ALTER TABLE public.system_messages ADD COLUMN welcome_message_mode BOOLEAN DEFAULT FALSE;

-- Create index for efficient querying of welcome messages
CREATE INDEX idx_system_messages_welcome_mode ON public.system_messages(welcome_message_mode) WHERE welcome_message_mode = TRUE;