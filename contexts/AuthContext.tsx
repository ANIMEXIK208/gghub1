'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/utils/supabase/client';
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const ensureUserProfile = async (user: User | null) => {
    if (!user) return;

    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        throw new Error('Supabase client is not available in this environment.');
      }
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (profileData) return;
      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Profile lookup error:', profileError);
        return;
      }

      const baseUsername = (user.user_metadata?.full_name || user.email || 'user')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');

      let username = baseUsername;
      let counter = 1;

      while (true) {
        const { data: existing, error: usernameError } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('username', username)
          .single();

        if (!existing) break;
        if (usernameError && (usernameError as any).code !== 'PGRST116') {
          console.error('Username lookup error:', usernameError);
          break;
        }

        username = `${baseUsername}_${counter}`;
        counter += 1;
      }

      const newProfile = {
        id: user.id,
        username,
        display_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        bio: null,
        avatar_url: user.user_metadata?.avatar_url || null,
        game_points: 0,
        total_wins: 0,
        games_played: 0,
      };

      const { error: insertError } = await supabase
        .from('user_profiles')
        .insert(newProfile);

      if (insertError) {
        console.error('Profile creation error:', insertError);
      }
    } catch (error) {
      console.error('Error ensuring user profile:', error);
    }
  };

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.error('Supabase client unavailable during auth initialization.');
      setLoading(false);
      return;
    }

    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        await ensureUserProfile(session?.user ?? null);
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_: AuthChangeEvent, session: Session | null) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await ensureUserProfile(session.user);
        }
      }
    );

    getInitialSession();

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        throw new Error('Supabase auth is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
      }
      const redirectBase = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL || '';
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${redirectBase}/auth/callback`,
        },
      });

      if (error) {
        console.error('Google sign in error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        throw new Error('Supabase client is not available.');
      }
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Sign out error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};