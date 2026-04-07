-- Add image column to announcements if it doesn't exist
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Allow public INSERT on announcements (for admin platform)
CREATE POLICY IF NOT EXISTS "Anyone can add announcements" ON announcements
  FOR INSERT WITH CHECK (true);

-- Allow public UPDATE on announcements (for admin platform)
CREATE POLICY IF NOT EXISTS "Anyone can update announcements" ON announcements
  FOR UPDATE USING (true) WITH CHECK (true);

-- Allow public DELETE on announcements (for admin platform)
CREATE POLICY IF NOT EXISTS "Anyone can delete announcements" ON announcements
  FOR DELETE USING (true);
