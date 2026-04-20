-- This script creates the necessary tables for the admin reports and appeals system.

-- Create the 'reports' table
CREATE TABLE public.reports (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    reporter_id uuid NOT NULL,
    reported_id uuid,
    reason text NOT NULL,
    status text NOT NULL DEFAULT 'pending'::text,
    admin_note text,
    type text NOT NULL,
    message_id uuid,
    CONSTRAINT reports_pkey PRIMARY KEY (id),
    CONSTRAINT reports_message_id_fkey FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
    CONSTRAINT reports_reported_id_fkey FOREIGN KEY (reported_id) REFERENCES profiles(id) ON DELETE CASCADE,
    CONSTRAINT reports_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Create the 'appeals' table
CREATE TABLE public.appeals (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    user_id uuid NOT NULL,
    action_type text NOT NULL,
    reason text NOT NULL,
    appeal_reason text NOT NULL,
    status text NOT NULL DEFAULT 'pending'::text,
    admin_note text,
    expires_at timestamp with time zone,
    CONSTRAINT appeals_pkey PRIMARY KEY (id),
    CONSTRAINT appeals_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);
