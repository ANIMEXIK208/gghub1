'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSupabaseClient } from '@/utils/supabase/client';
import { normalizeSupabaseImageUrl } from '@/utils/supabase/storage';

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  images?: string[];
  description: string;
  rating?: number;
  category?: string;
  trending?: boolean;
}

interface ProductContextType {
  products: Product[];
  loading: boolean;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  editProduct: (id: number, updatedProduct: Partial<Product>) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const getBrowserSupabase = () => getSupabaseClient();

  useEffect(() => {
    fetchProducts();
    setupRealtimeSubscription();
  }, []);

  const setupRealtimeSubscription = () => {
    const supabase = getBrowserSupabase();
    if (!supabase) {
      console.error('Supabase client not configured for products realtime.');
      return () => {};
    }
    const subscription = supabase
      .channel('products_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload: any) => {
          console.log('Product change detected:', payload.eventType);
          // Refetch products when changes occur
          fetchProducts();
        }
      )
      .subscribe((status: string) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Real-time product updates enabled');
        } else if (status === 'CHANNEL_ERROR') {
          console.warn('⚠️ Real-time subscription error, will retry');
        }
      });

    return () => {
      supabase.removeChannel(subscription);
    };
  };

  const fetchProducts = async () => {
    try {
      const supabase = getBrowserSupabase();
      if (!supabase) {
        console.error('Supabase client not configured for fetching products.');
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        return;
      }

      if (data) {
        const formattedProducts: Product[] = (data as any[]).map(item => {
          // Use image_urls array if available, otherwise fall back to single image_url
          const rawImages = item.image_urls && item.image_urls.length > 0 
            ? item.image_urls 
            : (item.image_url ? [item.image_url] : []);

          const imageArray = rawImages
            .map((url: string) => normalizeSupabaseImageUrl(url, 'product-images'))
            .filter((url: string | null): url is string => !!url);

          return {
            id: item.id,
            name: item.name,
            price: item.price,
            image: imageArray[0] || '',
            images: imageArray,
            description: item.description || '',
            rating: item.rating || 4.5,
            category: item.category || '',
            trending: false,
          };
        });
        setProducts(formattedProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      const supabase = getBrowserSupabase();
      if (!supabase) {
        console.error('Supabase client not configured for addProduct.');
        return;
      }
      const imageArray = product.images && product.images.length > 0 
        ? product.images 
        : (product.image ? [product.image] : []);

      const { error } = await supabase
        .from('products')
        .insert({
          name: product.name,
          description: product.description,
          price: product.price,
          image_url: product.image,
          image_urls: imageArray,
          rating: product.rating || 4.5,
          category: product.category || '',
        });

      if (error) {
        console.error('Error adding product:', error);
        throw error;
      }

      // fetchProducts will be called automatically via real-time subscription
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  };

  const editProduct = async (id: number, updatedProduct: Partial<Product>) => {
    try {
      const updateData: any = {};
      if (updatedProduct.name !== undefined) updateData.name = updatedProduct.name;
      if (updatedProduct.description !== undefined) updateData.description = updatedProduct.description;
      if (updatedProduct.price !== undefined) updateData.price = updatedProduct.price;
      if (updatedProduct.image !== undefined) updateData.image_url = updatedProduct.image;
      if (updatedProduct.images !== undefined) updateData.image_urls = updatedProduct.images;
      if (updatedProduct.rating !== undefined) updateData.rating = updatedProduct.rating;
      if (updatedProduct.category !== undefined) updateData.category = updatedProduct.category;

      const supabase = getBrowserSupabase();
      if (!supabase) {
        console.error('Supabase client not configured for editProduct.');
        return;
      }
      const { error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Error updating product:', error);
        throw error;
      }

      // fetchProducts will be called automatically via real-time subscription
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  const deleteProduct = async (id: number) => {
    try {
      const supabase = getBrowserSupabase();
      if (!supabase) {
        console.error('Supabase client not configured for deleteProduct.');
        return;
      }
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting product:', error);
        throw error;
      }

      // fetchProducts will be called automatically via real-time subscription
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  return (
    <ProductContext.Provider value={{
      products,
      loading,
      addProduct,
      editProduct,
      deleteProduct,
    }}>
      {children}
    </ProductContext.Provider>
  );
};
