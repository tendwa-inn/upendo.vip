
CREATE TABLE IF NOT EXISTS system_profile (
    id INT PRIMARY KEY CHECK (id = 1),
    name TEXT NOT NULL,
    photo_url TEXT
);

-- RLS Policy: Allow public read access
ALTER TABLE system_profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to system_profile" ON system_profile
FOR SELECT USING (true);

-- RLS Policy: Allow admin write access
CREATE POLICY "Allow admin write access to system_profile" ON system_profile
FOR ALL USING (is_admin())
WITH CHECK (is_admin());

-- Seed the system profile
INSERT INTO system_profile (id, name, photo_url)
VALUES (1, 'Upendo', '/logo-splash.png');
