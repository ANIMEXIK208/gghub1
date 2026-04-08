'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSupabaseClient } from '@/utils/supabase/client';

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
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
  const supabase = getSupabaseClient();

  useEffect(() => {
    fetchProducts();

    // Set up real-time subscription for live updates
    const channel = supabase
      .channel('products_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        fetchProducts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        return;
      }

      if (data) {
        const formattedProducts: Product[] = (data as any[]).map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image_url || '',
          description: item.description || '',
          rating: item.rating || 4.5,
          category: item.category || '',
          trending: false, // You can add a trending column to the database if needed
        }));
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
      const { error } = await supabase
        .from('products')
        .insert({
          name: product.name,
          description: product.description,
          price: product.price,
          image_url: product.image,
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
      if (updatedProduct.rating !== undefined) updateData.rating = updatedProduct.rating;
      if (updatedProduct.category !== undefined) updateData.category = updatedProduct.category;

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
