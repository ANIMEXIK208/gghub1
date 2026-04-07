'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  addProduct: (product: Omit<Product, 'id'>) => void;
  editProduct: (id: number, updatedProduct: Partial<Product>) => void;
  deleteProduct: (id: number) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);
const STORAGE_KEY = 'gghub-products';

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Premium Gaming Headset',
    description: 'Reliable surround sound, a clear microphone, and a comfortable fit for long sessions.',
    price: 12999,
    image: 'https://images.unsplash.com/photo-1599669454699-248893623440?w=400',
    rating: 4.8,
    category: 'Audio',
    trending: true,
  },
  {
    id: 2,
    name: 'Professional Mechanical Keyboard',
    description: 'Responsive mechanical keys with a strong build and clean interface for steady performance.',
    price: 8999,
    image: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400',
    rating: 4.6,
    category: 'Peripherals',
    trending: true,
  },
  {
    id: 3,
    name: 'High-Precision Gaming Mouse',
    description: 'Fast tracking with adjustable sensitivity and a stable grip for steady control.',
    price: 7999,
    image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400',
    rating: 4.7,
    category: 'Peripherals',
    trending: true,
  },
  {
    id: 4,
    name: '4K Gaming Monitor',
    description: '27-inch 4K display with smooth refresh and crisp picture quality for every gaming session.',
    price: 49999,
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400',
    rating: 4.9,
    category: 'Displays',
  },
  {
    id: 5,
    name: 'Ergonomic Gaming Chair',
    description: 'Supportive chair with adjustable comfort and a modern design for long use.',
    price: 29999,
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
    rating: 4.5,
    category: 'Furniture',
  },
  {
    id: 6,
    name: 'High-Performance Gaming PC',
    description: 'Ready-to-use gaming system with strong performance and fast storage.',
    price: 199999,
    image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400',
    rating: 4.8,
    category: 'Systems',
  },
  {
    id: 7,
    name: 'Wireless Controller',
    description: 'Wireless controller with precise controls and long battery life.',
    price: 6999,
    image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400',
    rating: 4.4,
    category: 'Controllers',
  },
  {
    id: 8,
    name: 'Extended Mouse Pad',
    description: 'Large surface with a non-slip base and smooth finish for precise movement.',
    price: 2499,
    image: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=400',
    rating: 4.3,
    category: 'Accessories',
  },
];

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

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setProducts(JSON.parse(stored));
        } else {
          // Initialize with default products
          setProducts(DEFAULT_PRODUCTS);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PRODUCTS));
        }
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts(DEFAULT_PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = (product: Omit<Product, 'id'>) => {
    try {
      const id = Math.max(0, ...products.map(p => p.id), 0) + 1;
      const newProduct: Product = {
        id,
        ...product,
      };
      const updated = [newProduct, ...products];
      setProducts(updated);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const editProduct = (id: number, updatedProduct: Partial<Product>) => {
    try {
      const updated = products.map(p =>
        p.id === id ? { ...p, ...updatedProduct } : p
      );
      setProducts(updated);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const deleteProduct = (id: number) => {
    try {
      const updated = products.filter(p => p.id !== id);
      setProducts(updated);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  return (
    <ProductContext.Provider value={{ products, loading, addProduct, editProduct, deleteProduct }}>
      {children}
    </ProductContext.Provider>
  );
};