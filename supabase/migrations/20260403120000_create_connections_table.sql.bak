-- Create connections table for admin-uploaded connection profiles
CREATE TABLE connections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    age INTEGER NOT NULL CHECK (age >= 18 AND age <= 100),
    gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
    location JSONB NOT NULL DEFAULT '{"name": "Unknown", "latitude": 0, "longitude": 0}'::jsonb,
    bio TEXT NOT NULL,
    photos TEXT[] DEFAULT ARRAY[]::TEXT[],
    whatsapp_number TEXT NOT NULL,
    whatsapp_message TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX idx_connections_gender ON connections(gender);
CREATE INDEX idx_connections_is_active ON connections(is_active);
CREATE INDEX idx_connections_created_at ON connections(created_at DESC);

-- Enable RLS
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

-- Create policies for connections table
-- Allow all users to view active connections
CREATE POLICY "Anyone can view active connections" ON connections
    FOR SELECT
    USING (is_active = true);

-- Allow admin to manage all connections
CREATE POLICY "Admin can manage all connections" ON connections
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Grant permissions
GRANT SELECT ON connections TO anon, authenticated;
GRANT ALL ON connections TO authenticated;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_connections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_connections_updated_at
    BEFORE UPDATE ON connections
    FOR EACH ROW
    EXECUTE FUNCTION update_connections_updated_at();

-- Use existing 'avatras' bucket for connection photos (no need to create new bucket)
-- The 'avatras' bucket already exists and can be used for connection photos

-- Grant permissions for storage
GRANT ALL ON storage.objects TO authenticated;
GRANT SELECT ON storage.objects TO anon;