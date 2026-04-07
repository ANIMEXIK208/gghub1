'use client';

import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { Product } from './ProductContext';
import { useUser } from './UserContext';
import { getSupabaseClient } from '@/utils/supabase/client';
import type { Database } from '@/types/supabase';

type SupabaseCartItem = Database['public']['Tables']['cart_items']['Row'];

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  loading: boolean;
  addToCart: (product: Product) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const supabase = useMemo(() => getSupabaseClient(), []);

  const getCartStorageKey = (userId?: string | number) =>
    userId ? `gghub-cart-user-${userId}` : 'gghub-cart-guest';

  const loadCartFromSupabase = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          quantity,
          products (
            id,
            name,
            price,
            image_url,
            description,
            rating,
            category
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error loading cart:', error);
        return;
      }

      if (data) {
        const mappedItems: CartItem[] = (data as any[])
          .filter((item) => item.products) // Filter out items with missing products
          .map((item) => ({
            product: {
              id: Number(item.products.id),
              name: item.products.name,
              price: Number(item.products.price) / 100, // Convert from cents
              image: item.products.image_url || 'https://via.placeholder.com/300x200?text=Product',
              description: item.products.description || '',
              rating: item.products.rating || 4.5,
              category: item.products.category || 'Gaming',
            },
            quantity: Number(item.quantity),
          }));
        setCartItems(mappedItems);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncCartToSupabase = async (items: CartItem[]) => {
    if (!user?.id) return;

    try {
      // First, clear existing cart items
      await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      // Then insert new cart items
      if (items.length > 0) {
        const cartData: Database['public']['Tables']['cart_items']['Insert'][] = items.map(item => ({
          user_id: user.id,
          product_id: item.product.id,
          quantity: item.quantity,
        }));

        const { error } = await (supabase.from('cart_items') as any)
          .insert(cartData);

        if (error) {
          console.error('Error syncing cart:', error);
        }
      }
    } catch (error) {
      console.error('Error syncing cart:', error);
    }
  };

  // Load cart from Supabase when user changes
  useEffect(() => {
    if (user?.id) {
      loadCartFromSupabase();
    } else {
      // For guest users, use localStorage
      if (typeof window !== 'undefined') {
        const storageKey = getCartStorageKey();
        const saved = window.localStorage.getItem(storageKey);
        if (saved) {
          try {
            setCartItems(JSON.parse(saved));
          } catch {
            setCartItems([]);
          }
        } else {
          setCartItems([]);
        }
      }
    }
  }, [user?.id]);

  // Save to localStorage for guest users
  useEffect(() => {
    if (!user?.id && typeof window !== 'undefined') {
      const storageKey = getCartStorageKey();
      window.localStorage.setItem(storageKey, JSON.stringify(cartItems));
    }
  }, [cartItems, user?.id]);

  const addToCart = (product: Product) => {
    setCartItems((current) => {
      const existing = current.find((item) => item.product.id === product.id);
      let newItems: CartItem[];

      if (existing) {
        newItems = current.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      } else {
        newItems = [...current, { product, quantity: 1 }];
      }

      // Sync to Supabase if user is logged in
      if (user?.id) {
        syncCartToSupabase(newItems);
      }

      return newItems;
    });
  };

  const removeFromCart = (id: number) => {
    setCartItems((current) => {
      const newItems = current.filter((item) => item.product.id !== id);

      // Sync to Supabase if user is logged in
      if (user?.id) {
        syncCartToSupabase(newItems);
      }

      return newItems;
    });
  };

  const updateQuantity = (id: number, quantity: number) => {
    setCartItems((current) => {
      const newItems = current
        .map((item) =>
          item.product.id === id ? { ...item, quantity: Math.max(1, quantity) } : item,
        )
        .filter((item) => item.quantity > 0);

      // Sync to Supabase if user is logged in
      if (user?.id) {
        syncCartToSupabase(newItems);
      }

      return newItems;
    });
  };

  const clearCart = () => {
    setCartItems([]);

    // Sync to Supabase if user is logged in
    if (user?.id) {
      syncCartToSupabase([]);
    }
  };

  const cartCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems],
  );

  const cartTotal = useMemo(
    () => cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0),
    [cartItems],
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};