-- Migration: Add multi-image support to products table
-- Created: 2026-04-09
-- Purpose: Enable products to have multiple images with slideshow functionality

-- Add image_urls column to store array of image URLs
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Migrate existing image_url data to image_urls array (if image_url exists)
UPDATE products 
SET image_urls = ARRAY[image_url]
WHERE image_url IS NOT NULL AND image_url != '' AND (image_urls IS NULL OR array_length(image_urls, 1) IS NULL);

-- Add comment for documentation
COMMENT ON COLUMN products.image_urls IS 'Array of image URLs for slideshow functionality. First image is primary.';
