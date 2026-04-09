'use client';

import React, { useState, useEffect } from 'react';
import { useProducts, Product } from '@/contexts/ProductContext';
import { uploadProductImage } from '@/utils/supabase/storage';
import Image from 'next/image';

interface ProductFormProps {
  product?: Product;
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function ProductForm({
  product,
  onClose,
  onSuccess,
}: ProductFormProps) {
  const { addProduct, editProduct } = useProducts();
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || 0,
    category: product?.category || 'Accessories',
    image: product?.image || '',
    rating: product?.rating || 4.5,
    trending: product?.trending || false,
  });

  const [previewImage, setPreviewImage] = useState<string | null>(
    product?.image || null
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'rating' ? parseFloat(value) : val,
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    setError('');

    try {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image size must be less than 5MB');
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }

      const imageUrl = await uploadProductImage(file);
      setFormData(prev => ({
        ...prev,
        image: imageUrl,
      }));
      setPreviewImage(imageUrl);
      setSuccess('✅ Image uploaded successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(`❌ Image upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!formData.name) {
        throw new Error('Product name is required');
      }
      if (!formData.description) {
        throw new Error('Product description is required');
      }
      if (formData.price <= 0) {
        throw new Error('Price must be greater than 0');
      }
      if (!formData.image) {
        throw new Error('Product image is required');
      }

      const productData = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        category: formData.category,
        image: formData.image,
        rating: formData.rating,
        trending: formData.trending,
      };

      if (product) {
        await editProduct(product.id, productData);
        setSuccess('✅ Product updated successfully');
      } else {
        await addProduct(productData);
        setSuccess('✅ Product added successfully');
      }

      setTimeout(() => {
        onSuccess?.();
      }, 1500);
    } catch (err) {
      setError(`❌ ${err instanceof Error ? err.message : 'An error occurred'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900 border border-green-600/30 rounded-2xl p-8 max-w-2xl">
      <h2 className="text-2xl font-bold text-green-300 mb-6">
        {product ? '✏️ Edit Product' : '➕ Add New Product'}
      </h2>

      {error && (
        <div className="mb-6 p-4 bg-red-600/20 border border-red-600/50 rounded-lg text-red-300">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-600/20 border border-green-600/50 rounded-lg text-green-300">
          {success}
        </div>
      )}

      <div className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-green-300 font-semibold mb-2">Product Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-4 py-2 bg-slate-800 border border-green-600/30 rounded-lg text-green-100 placeholder-green-500/50 focus:border-green-500 focus:outline-none transition-colors"
            placeholder="Game controller, mouse pad, etc."
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-green-300 font-semibold mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-4 py-2 bg-slate-800 border border-green-600/30 rounded-lg text-green-100 placeholder-green-500/50 focus:border-green-500 focus:outline-none transition-colors"
            placeholder="Detailed product description..."
          />
        </div>

        {/* Price and Rating */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-green-300 font-semibold mb-2">Price (NGN)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-slate-800 border border-green-600/30 rounded-lg text-green-100 placeholder-green-500/50 focus:border-green-500 focus:outline-none transition-colors"
              placeholder="0"
              min="0"
              step="100"
            />
          </div>
          <div>
            <label className="block text-green-300 font-semibold mb-2">Rating (0-5)</label>
            <input
              type="number"
              name="rating"
              value={formData.rating}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-slate-800 border border-green-600/30 rounded-lg text-green-100 placeholder-green-500/50 focus:border-green-500 focus:outline-none transition-colors"
              placeholder="4.5"
              min="0"
              max="5"
              step="0.1"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-green-300 font-semibold mb-2">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="w-full px-4 py-2 bg-slate-800 border border-green-600/30 rounded-lg text-green-100 focus:border-green-500 focus:outline-none transition-colors"
          >
            <option value="Accessories">Accessories</option>
            <option value="Peripherals">Peripherals</option>
            <option value="Audio">Audio</option>
            <option value="Displays">Displays</option>
            <option value="Furniture">Furniture</option>
            <option value="Systems">Systems</option>
            <option value="Controllers">Controllers</option>
          </select>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-green-300 font-semibold mb-2">Product Image</label>
          <div className="border-2 border-dashed border-green-600/30 rounded-lg p-6 text-center hover:border-green-600/50 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={imageUploading}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              {imageUploading ? (
                <div className="text-green-300">📤 Uploading...</div>
              ) : (
                <div>
                  <div className="text-4xl mb-2">📸</div>
                  <p className="text-green-300 font-semibold">Click to upload or drag and drop</p>
                  <p className="text-green-200/70 text-sm">PNG, JPG, GIF up to 5MB</p>
                </div>
              )}
            </label>
          </div>

          {previewImage && (
            <div className="mt-4">
              <p className="text-green-300 font-semibold mb-2">Preview:</p>
              <Image
                src={previewImage}
                alt="Preview"
                width={200}
                height={200}
                className="rounded-lg border border-green-600/30"
              />
            </div>
          )}
        </div>

        {/* Trending */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            name="trending"
            checked={formData.trending}
            onChange={handleInputChange}
            id="trending"
            className="w-5 h-5 border border-green-600 rounded cursor-pointer"
          />
          <label htmlFor="trending" className="text-green-300 font-semibold cursor-pointer">
            Mark as Trending ⭐
          </label>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-4 mt-8">
        <button
          type="submit"
          disabled={loading || imageUploading}
          className="flex-1 px-6 py-3 bg-green-600 text-slate-900 font-bold rounded-lg hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? '⏳ Saving...' : product ? '✏️ Update Product' : '➕ Add Product'}
        </button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 bg-slate-800 text-green-300 font-bold rounded-lg hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
