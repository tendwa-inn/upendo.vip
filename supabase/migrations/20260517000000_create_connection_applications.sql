-- Create connection_applications table for user-submitted connection requests
CREATE TABLE public.connection_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    age INTEGER NOT NULL CHECK (age >= 18 AND age <= 100),
    gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
    bio TEXT NOT NULL,
    location JSONB NOT NULL DEFAULT '{"name": "Unknown", "latitude": 0, "longitude": 0}'::jsonb,
    photos TEXT[] DEFAULT ARRAY[]::TEXT[],
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
    admin_note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES public.profiles(id)
);

-- Add columns to connections table for user-applied connections
ALTER TABLE public.connections
    ADD COLUMN IF NOT EXISTS is_user_applied BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS applicant_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS suitor_count INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS max_suitors INTEGER DEFAULT 10,
    ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Create connection_requests table for suitor tracking
CREATE TABLE public.connection_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    connection_id UUID NOT NULL REFERENCES public.connections(id) ON DELETE CASCADE,
    connection_applicant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'denied')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (connection_id, requester_id)
);

-- RLS policies for connection_applications
ALTER TABLE public.connection_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own applications"
    ON public.connection_applications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own applications"
    ON public.connection_applications FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- RLS policies for connection_requests
ALTER TABLE public.connection_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view requests they made or received"
    ON public.connection_requests FOR SELECT
    USING (auth.uid() = requester_id OR auth.uid() = connection_applicant_id);

CREATE POLICY "Users can insert connection requests"
    ON public.connection_requests FOR INSERT
    WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Connection owners can update request status"
    ON public.connection_requests FOR UPDATE
    USING (auth.uid() = connection_applicant_id);

-- Enable realtime
ALTER PUBLICATION supabase_tables ADD TABLE public.connection_applications;
ALTER PUBLICATION supabase_tables ADD TABLE public.connection_requests;
