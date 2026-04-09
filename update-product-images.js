#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Update thumb sleeves product with better image
const productUpdates = {
  id: 9,
  image_url: '/products/thumb-sleeves-main.jpg'
  // Alternative Supabase Storage URL:
  // image_url: `${supabaseUrl}/storage/v1/object/public/product-images/thumb-sleeves-main.jpg`
};

async function updateProductImage() {
  console.log('\n🎮 Updating product image...\n');
  
  try {
    const { data, error } = await supabase
      .from('products')
      .update({ image_url: productUpdates.image_url })
      .eq('id', productUpdates.id)
      .select();

    if (error) {
      console.error('❌ Error updating product:', error.message);
      process.exit(1);
    }

    console.log('✅ Product image updated successfully!');
    console.log(`   Product ID: ${productUpdates.id}`);
    console.log(`   New Image URL: ${productUpdates.image_url}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateProductImage();
