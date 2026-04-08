-- Fixed Sample Data SQL (handles duplicates safely)
-- Run this in your Supabase SQL Editor to add sample products and announcements

-- Sample Products (safe insert - won't duplicate existing records)
INSERT INTO products (id, name, description, price, rating, category, image_url) VALUES
(1, 'Premium Gaming Headset', 'Reliable surround sound, a clear microphone, and a comfortable fit for long sessions.', 12999, 4.8, 'Audio', 'https://images.unsplash.com/photo-1599669454699-248893623440?w=400'),
(2, 'Professional Mechanical Keyboard', 'Responsive mechanical keys with a strong build and clean interface for steady performance.', 8999, 4.6, 'Peripherals', 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400'),
(3, 'High-Precision Gaming Mouse', 'Fast tracking with adjustable sensitivity and a stable grip for steady control.', 7999, 4.7, 'Peripherals', 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400'),
(4, '4K Gaming Monitor', '27-inch 4K display with smooth refresh and crisp picture quality for every gaming session.', 49999, 4.9, 'Displays', 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400'),
(5, 'Ergonomic Gaming Chair', 'Supportive chair with adjustable comfort and a modern design for long use.', 29999, 4.5, 'Furniture', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400'),
(6, 'High-Performance Gaming PC', 'Ready-to-use gaming system with strong performance and fast storage.', 199999, 4.8, 'Systems', 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400'),
(7, 'Wireless Controller', 'Wireless controller with precise controls and long battery life.', 6999, 4.4, 'Controllers', 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400'),
(8, 'Extended Mouse Pad', 'Large surface with a non-slip base and smooth finish for precise movement.', 2499, 4.3, 'Accessories', 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=400')
ON CONFLICT (id) DO NOTHING;

-- Sample Announcements (safe insert - won't duplicate existing records)
INSERT INTO announcements (id, title, description, emoji) VALUES
(1, 'Exclusive Gaming Offer', 'Explore premium accessories and reliable service for your next order.', '🎮'),
(2, 'Service Savings Event', 'Save on select accessories with smart pricing and fast delivery.', '💼'),
(3, 'Customer Support Update', 'Our support team is ready to help with orders and account questions.', '📞'),
(4, 'Free Shipping Offer', 'Enjoy free shipping on all orders over ₦20,000 this weekend.', '📦')
ON CONFLICT (id) DO NOTHING;