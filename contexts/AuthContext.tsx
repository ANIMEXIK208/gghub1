'use client';

import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { getSupabaseClient } from '@/utils/supabase/client';
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string | null;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  game_points: number;
  total_wins: number;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string>;
  login: (password: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const supabase = useMemo(() => getSupabaseClient(), []);

  // Admin password - change this in production
  const ADMIN_PASSWORD = 'admin123';

  // Generate unique username
  const generateUniqueUsername = async (baseName: string) => {
    const sanitized = baseName
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '')
      .slice(0, 20);
    
    let username = sanitized || 'gamer';
    let counter = 1;
    
    // Check if username exists, if so add number
    while (counter < 1000) {
      const { data, error } = await supabase
        .from('users')
        .select('username')
        .eq('username', username)
        .single();

      if (error?.code === 'PGRST116' || !data) {
        return username;
      }

      username = `${sanitized || 'gamer'}_${counter}`;
      counter += 1;
    }

    // Fallback to uuid-based username
    return `gamer_${Math.random().toString(36).substring(2, 10)}`;
  };

  useEffect(() => {
    // Check current logged in user on mount
    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      setLoading(true);

      if (currentUser) {
        await fetchUserProfile(currentUser.id);
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);

      if (currentUser) {
        await fetchUserProfile(currentUser.id);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async (userId: string, retries = 2) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error);
        if (retries > 0) {
          setTimeout(() => fetchUserProfile(userId, retries - 1), 1000);
          return;
        }
        // If database fails, create fallback profile from auth data
        throw error;
      }

      if (data) {
        setUserProfile(data as UserProfile);
      } else if (!data) {
        // Create profile if it doesn't exist
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const fullName = user.user_metadata?.full_name || 'Gamer';
          let uniqueUsername = '';
          
          try {
            uniqueUsername = await generateUniqueUsername(fullName);
          } catch (err) {
            console.warn('Failed to generate unique username, using default:', err);
            uniqueUsername = `user_${user.id.substring(0, 8)}`;
          }
          
          const newProfile: UserProfile = {
            id: user.id,
            email: user.email || null,
            display_name: fullName,
            username: uniqueUsername,
            avatar_url: user.user_metadata?.avatar_url || null,
            bio: null,
            game_points: 0,
            total_wins: 0,
            created_at: new Date().toISOString(),
          };

          console.log('Attempting to create profile:', { id: user.id, email: user.email });

          // Try inserting with username
          let { error: insertError, data: insertedData } = await supabase
            .from('users')
            .insert([newProfile])
            .select()
            .single();

          // If that fails, try without the generated username and extra fields
          if (insertError) {
            console.warn('Insert with username failed, trying without username:', insertError);
            const { error: fallbackError, data: fallbackData } = await supabase
              .from('users')
              .insert([{
                id: user.id,
                email: user.email || null,
                display_name: fullName,
                avatar_url: user.user_metadata?.avatar_url || null,
                bio: null,
                balance: 0,
                created_at: new Date().toISOString(),
              }])
              .select()
              .single();
            
            insertError = fallbackError;
            insertedData = fallbackData;
          }

          if (insertError) {
            console.error('Profile creation failed:', insertError);
            // Use local profile as fallback
            console.log('Using fallback profile from auth data');
            setUserProfile(newProfile);
            return;
          }
          
          console.log('Profile created successfully:', insertedData);
          setUserProfile((insertedData || newProfile) as UserProfile);
        }
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      // Create fallback profile from auth data as last resort
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const fallbackProfile: UserProfile = {
            id: user.id,
            email: user.email || null,
            display_name: user.user_metadata?.full_name || 'Gamer',
            username: `user_${user.id.substring(0, 8)}`,
            avatar_url: user.user_metadata?.avatar_url || null,
            bio: null,
            game_points: 0,
            total_wins: 0,
            created_at: new Date().toISOString(),
          };
          console.log('Setting fallback profile:', fallbackProfile);
          setUserProfile(fallbackProfile);
        }
      } catch (fallbackError) {
        console.error('Failed to create fallback profile:', fallbackError);
        setUserProfile(null);
      }
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    await fetchUserProfile(user.id);
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('No user found');

    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      setUserProfile(prev => prev ? { ...prev, ...updates } : null);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const uploadAvatar = async (file: File): Promise<string> => {
    if (!user) throw new Error('No user found');

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      const avatarUrl = data.publicUrl;

      // Update profile with new avatar URL
      await updateProfile({ avatar_url: avatarUrl });

      return avatarUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    }
  };

  const login = (password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      setIsAdminAuthenticated(true);
      return true;
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      loading,
      isAuthenticated: isAdminAuthenticated || !!user,
      signInWithGoogle,
      signOut,
      refreshProfile,
      updateProfile,
      uploadAvatar,
      login,
    }}>
      {children}
    </AuthContext.Provider>
  );
};