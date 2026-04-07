// Auto-generated Supabase types
// Run: npx supabase gen types typescript --project-id [your-project-id] > types/supabase.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          display_name: string | null;
          email: string | null;
          bio: string | null;
          avatar_url: string | null;
          balance: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name?: string | null;
          email?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          balance?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          display_name?: string | null;
          email?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          balance?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      game_logs: {
        Row: {
          id: string;
          user_id: string;
          game: string;
          quest: string | null;
          result: string | null;
          points: number;
          balance_change: number;
          timestamp: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          game: string;
          quest?: string | null;
          result?: string | null;
          points?: number;
          balance_change?: number;
          timestamp?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          game?: string;
          quest?: string | null;
          result?: string | null;
          points?: number;
          balance_change?: number;
          timestamp?: string;
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: number;
          name: string;
          description: string | null;
          price: number;
          rating: number;
          category: string | null;
          image_url: string | null;
          created_at: string;
        };
        Insert: {
          id: number;
          name: string;
          description?: string | null;
          price: number;
          rating?: number;
          category?: string | null;
          image_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          description?: string | null;
          price?: number;
          rating?: number;
          category?: string | null;
          image_url?: string | null;
          created_at?: string;
        };
      };
      cart_items: {
        Row: {
          id: string;
          user_id: string;
          product_id: number;
          quantity: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: number;
          quantity?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: number;
          quantity?: number;
          created_at?: string;
        };
      };
      announcements: {
        Row: {
          id: number;
          title: string;
          description: string | null;
          emoji: string | null;
          created_at: string;
        };
        Insert: {
          id: number;
          title: string;
          description?: string | null;
          emoji?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          title?: string;
          description?: string | null;
          emoji?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
