-- GGHub Supabase Schema Setup

-- Users table (extends Supabase auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  email TEXT,
  bio TEXT,
  avatar_url TEXT,
  balance BIGINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Game logs table
CREATE TABLE IF NOT EXISTS game_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game TEXT NOT NULL,
  quest TEXT,
  result TEXT,
  points BIGINT DEFAULT 0,
  balance_change BIGINT DEFAULT 0,
  timestamp TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id BIGINT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price BIGINT NOT NULL,
  rating DOUBLE PRECISION DEFAULT 4.5,
  category TEXT,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Cart items table
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES products(id),
  quantity BIGINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id BIGINT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  emoji TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view all users (for leaderboard)
DROP POLICY IF EXISTS "Users can view own data" ON users;
CREATE POLICY "Users can view all data" ON users
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own data" ON users;
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Game logs are readable by the owner
DROP POLICY IF EXISTS "Users can view own game logs" ON game_logs;
CREATE POLICY "Users can view own game logs" ON game_logs
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own game logs" ON game_logs;
CREATE POLICY "Users can insert own game logs" ON game_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Cart items are readable and writable by the owner
DROP POLICY IF EXISTS "Users can view own cart" ON cart_items;
CREATE POLICY "Users can view own cart" ON cart_items
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own cart" ON cart_items;
CREATE POLICY "Users can manage own cart" ON cart_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own cart items" ON cart_items;
CREATE POLICY "Users can update own cart items" ON cart_items
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own cart items" ON cart_items;
CREATE POLICY "Users can delete own cart items" ON cart_items
  FOR DELETE USING (auth.uid() = user_id);

-- Products and announcements are publicly readable
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Products are public" ON products;
CREATE POLICY "Products are public" ON products
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Products can insert" ON products;
CREATE POLICY "Products can insert" ON products
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Products can update" ON products;
CREATE POLICY "Products can update" ON products
  FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Products can delete" ON products;
CREATE POLICY "Products can delete" ON products
  FOR DELETE USING (true);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Announcements are public" ON announcements;
CREATE POLICY "Announcements are public" ON announcements
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Announcements can insert" ON announcements;
CREATE POLICY "Announcements can insert" ON announcements
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Announcements can update" ON announcements;
CREATE POLICY "Announcements can update" ON announcements
  FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Announcements can delete" ON announcements;
CREATE POLICY "Announcements can delete" ON announcements
  FOR DELETE USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_game_logs_user_id ON game_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_game_logs_timestamp ON game_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Sample Products
INSERT INTO products (id, name, description, price, rating, category, image_url) VALUES
(1, 'GGHub Pro Gaming Headset', 'Immersive 7.1 surround sound with noise-cancelling microphone. RGB lighting and comfortable memory foam cushions for extended gaming sessions.', 12999, 4.8, 'Audio', 'https://images.unsplash.com/photo-1599669454699-248893623440?w=400'),
(2, 'Mechanical Gaming Keyboard', 'Cherry MX Red switches with RGB backlighting. Anti-ghosting technology and programmable keys for ultimate gaming performance.', 8999, 4.6, 'Peripherals', 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400'),
(3, 'Ultra Gaming Mouse', '1000Hz polling rate with customizable DPI up to 16000. Ergonomic design with 11 programmable buttons and RGB lighting.', 7999, 4.7, 'Peripherals', 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400'),
(4, '4K Gaming Monitor', '27-inch 4K UHD display with 144Hz refresh rate. HDR support and 1ms response time for crystal-clear gaming visuals.', 49999, 4.9, 'Displays', 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400'),
(5, 'RGB Gaming Chair', 'Ergonomic gaming chair with lumbar support and adjustable height. Premium leather upholstery with RGB lighting system.', 29999, 4.5, 'Furniture', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400'),
(6, 'High-Performance Gaming PC', 'Custom-built gaming rig with RTX 4070, Intel i7 processor, 32GB RAM, and 1TB SSD. Ready for 4K gaming at maximum settings.', 199999, 4.8, 'Systems', 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400'),
(7, 'Wireless Gaming Controller', 'DualSense-style controller with haptic feedback and adaptive triggers. 12-hour battery life and precision controls.', 6999, 4.4, 'Controllers', 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400'),
(8, 'Gaming Mouse Pad', 'Extended XXL mouse pad with stitched edges and non-slip rubber base. Optimized surface for precision gaming.', 2499, 4.3, 'Accessories', 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=400')
ON CONFLICT (id) DO NOTHING;

-- Sample Announcements
INSERT INTO announcements (id, title, description, emoji) VALUES
(1, 'New Product Launch!', 'Check out our latest gaming accessories arriving this week', '🚀'),
(2, 'Flash Sale Alert', '50% off all headsets for the next 24 hours only!', '⚡'),
(3, 'Community Tournament', 'Join our monthly gaming tournament with $1000 prize pool', '🏆'),
(4, 'Free Shipping Weekend', 'Enjoy free shipping on all orders over $50 this weekend', '📦')
ON CONFLICT (id) DO NOTHING;
