'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getSupabaseClient } from '@/utils/supabase/client';
import { ThemeCustomization, ThemeCustomizationForm, DEFAULT_THEME } from '@/types/admin';

interface ThemeContextType {
  theme: ThemeCustomization | null;
  loading: boolean;
  error: string | null;
  updateTheme: (theme: ThemeCustomizationForm) => Promise<void>;
  resetTheme: () => Promise<void>;
  previewTheme: (theme: Partial<ThemeCustomization>) => void;
  applyTheme: (theme: ThemeCustomization) => void;
  clearError: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeCustomization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = getSupabaseClient();

  const applyTheme = useCallback((themeData: ThemeCustomization) => {
    // Apply CSS variables
    const root = document.documentElement;
    root.style.setProperty('--color-primary', themeData.primary_color);
    root.style.setProperty('--color-secondary', themeData.secondary_color);
    root.style.setProperty('--color-accent', themeData.accent_color);
    root.style.setProperty('--font-family', themeData.font_family);

    // Apply dark mode class
    if (themeData.dark_mode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Store in localStorage for persistence
    localStorage.setItem('admin-theme', JSON.stringify(themeData));
  }, []);

  const fetchTheme = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session?.user?.id) {
        // Use default theme if not authenticated
        setTheme(null);
        return;
      }

      const { data, error } = await supabase
        .from('theme_customization')
        .select('*')
        .eq('admin_id', sessionData.session.user.id)
        .eq('is_active', true)
        .single();

      if (error) {
        // PGRST116 is "no rows" error - this is expected if no theme is set
        // 42P01 is "table does not exist" error
        if (error.code === 'PGRST116') {
          // No theme set, use default
        } else if (
          error.message.includes('does not exist') ||
          error.code === '42P01'
        ) {
          setError(
            'Database not initialized. Please run the migration in Supabase SQL Editor first.'
          );
          return;
        } else {
          throw error;
        }
      }

      if (data) {
        setTheme(data as ThemeCustomization);
        applyTheme(data as ThemeCustomization);
      } else {
        // Apply default theme if none exists
        applyTheme(DEFAULT_THEME);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch theme';
      setError(errorMessage);
      console.error('Error fetching theme:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase, applyTheme]);

  useEffect(() => {
    fetchTheme();

    // Real-time subscription
    const channel = supabase
      .channel('theme_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'theme_customization' }, () => {
        fetchTheme();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTheme, supabase]);

  const updateTheme = useCallback(
    async (themeUpdates: ThemeCustomizationForm) => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();

        if (!sessionData.session?.user?.id) {
          throw new Error('User not authenticated');
        }

        // If theme exists, update it. Otherwise, create it.
        if (theme?.id) {
          const { error } = await supabase
            .from('theme_customization')
            .update({
              ...themeUpdates,
              updated_at: new Date().toISOString(),
            })
            .eq('id', theme.id);

          if (error) throw error;
        } else {
          const { error } = await supabase.from('theme_customization').insert({
            admin_id: sessionData.session.user.id,
            ...themeUpdates,
            is_active: true,
          });

          if (error) throw error;
        }

        await fetchTheme();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update theme';
        setError(errorMessage);
        throw err;
      }
    },
    [theme, supabase, fetchTheme]
  );

  const resetTheme = useCallback(async () => {
    try {
      if (theme?.id) {
        const { error } = await supabase
          .from('theme_customization')
          .update({
            primary_color: DEFAULT_THEME.primary_color,
            secondary_color: DEFAULT_THEME.secondary_color,
            accent_color: DEFAULT_THEME.accent_color,
            font_family: DEFAULT_THEME.font_family,
            layout_template: DEFAULT_THEME.layout_template,
            dark_mode: DEFAULT_THEME.dark_mode,
            sidebar_position: DEFAULT_THEME.sidebar_position,
            updated_at: new Date().toISOString(),
          })
          .eq('id', theme.id);

        if (error) throw error;
      }

      await fetchTheme();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset theme';
      setError(errorMessage);
      throw err;
    }
  }, [theme, supabase, fetchTheme]);

  const previewTheme = useCallback(
    (themePreview: Partial<ThemeCustomization>) => {
      const preview = { ...theme || DEFAULT_THEME, ...themePreview } as ThemeCustomization;
      applyTheme(preview);
    },
    [theme, applyTheme]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        loading,
        error,
        updateTheme,
        resetTheme,
        previewTheme,
        applyTheme,
        clearError,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
