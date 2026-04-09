-- Add Gaming Thumb Sleeves as new product

INSERT INTO products (id, name, description, price, rating, category, image_url) 
VALUES 
(9, 'Thumb Sleeves For Gaming', 'Matching Box New mobile game finger cover with cool patterned glass silvery fiber material. Designed for mobile game players, it is breathable, sweat-proof, and lightweight. Size: 4.6cm height × 2.5cm width. Improves touch sensitivity for mobile gaming. Free shipping available. Delivery as fast as 5 business days in Nigeria.', 3000, 4.7, 'Accessories', 'https://images.unsplash.com/photo-1611532736579-6b16e2b50449?w=400&q=80')
ON CONFLICT (id) DO NOTHING;
