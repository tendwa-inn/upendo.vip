-- This script creates the necessary table for the user blocking system.

CREATE TABLE public.blocked_users (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    blocker_id uuid NOT NULL,
    blocked_id uuid NOT NULL,
    CONSTRAINT blocked_users_pkey PRIMARY KEY (id),
    CONSTRAINT blocked_users_blocker_id_fkey FOREIGN KEY (blocker_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
    CONSTRAINT blocked_users_blocked_id_fkey FOREIGN KEY (blocked_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
    CONSTRAINT unique_block UNIQUE (blocker_id, blocked_id)
);
