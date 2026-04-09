#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Load environment variables from .env.local
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.log('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const productData = {
  id: 9,
  name: 'Thumb Sleeves For Gaming',
  description: 'Matching Box New mobile game finger cover with cool patterned glass silvery fiber material. Designed for mobile game players, it is breathable, sweat-proof, and lightweight. Size: 4.6cm height × 2.5cm width. Improves touch sensitivity for mobile gaming. Free shipping available. Delivery as fast as 5 business days in Nigeria.',
  price: 3000,
  rating: 4.7,
  category: 'Accessories',
  image_url: 'https://images.unsplash.com/photo-1611532736579-6b16e2b50449?w=400&q=80'
};

async function addProduct() {
  console.log('\n🎮 Adding new product to GGHub store...\n');
  
  try {
    // Insert the product
    const { data: insertResult, error: insertError } = await supabase
      .from('products')
      .insert([productData])
      .select();

    if (insertError) {
      console.error('❌ Error inserting product:', insertError.message);
      process.exit(1);
    }

    console.log('✅ Product inserted successfully!');
    console.log('\n📝 Product Details:');
    console.log(`   ID: ${productData.id}`);
    console.log(`   Name: ${productData.name}`);
    console.log(`   Price: ₦${productData.price}`);
    console.log(`   Rating: ${productData.rating}`);
    console.log(`   Category: ${productData.category}`);
    
    // Verify the product by fetching it
    console.log('\n🔍 Verifying product in the database...\n');
    
    const { data: verifyData, error: verifyError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productData.id);

    if (verifyError) {
      console.error('❌ Error verifying product:', verifyError.message);
      process.exit(1);
    }

    if (verifyData && verifyData.length > 0) {
      console.log('✅ Product verification successful!');
      console.log('\n📦 Verified Product Data:');
      const product = verifyData[0];
      console.log(`   ID: ${product.id}`);
      console.log(`   Name: ${product.name}`);
      console.log(`   Description: ${product.description.substring(0, 80)}...`);
      console.log(`   Price: ₦${product.price}`);
      console.log(`   Rating: ${product.rating}⭐`);
      console.log(`   Category: ${product.category}`);
      console.log(`   Image: ${product.image_url}`);
    } else {
      console.error('❌ Product not found after insertion');
      process.exit(1);
    }

    // Fetch all products to show the complete list
    console.log('\n📊 Fetching complete product list...\n');
    
    const { data: allProducts, error: allError } = await supabase
      .from('products')
      .select('id, name, price, rating, category')
      .order('id', { ascending: true });

    if (allError) {
      console.error('❌ Error fetching products:', allError.message);
      process.exit(1);
    }

    console.log('✅ All Products in Store:');
    console.log(`\n   Total Products: ${allProducts.length}\n`);
    
    allProducts.forEach(product => {
      console.log(`   [${product.id}] ${product.name}`);
      console.log(`       Price: ₦${product.price} | Rating: ${product.rating}⭐ | Category: ${product.category}`);
    });

    console.log('\n✅ Product has been successfully added and is now visible in the store!\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    process.exit(1);
  }
}

addProduct();
