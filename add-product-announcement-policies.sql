-- Enable RLS and allow authenticated users to manage products and announcements

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Products are public" ON products;
CREATE POLICY "Products are public" ON products
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Products can insert" ON products;
CREATE POLICY "Products can insert" ON products
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Products can update" ON products;
CREATE POLICY "Products can update" ON products
  FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Products can delete" ON products;
CREATE POLICY "Products can delete" ON products
  FOR DELETE USING (auth.uid() IS NOT NULL);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Announcements are public" ON announcements;
CREATE POLICY "Announcements are public" ON announcements
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Announcements can insert" ON announcements;
CREATE POLICY "Announcements can insert" ON announcements
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Announcements can update" ON announcements;
CREATE POLICY "Announcements can update" ON announcements
  FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Announcements can delete" ON announcements;
CREATE POLICY "Announcements can delete" ON announcements
  FOR DELETE USING (auth.uid() IS NOT NULL);
