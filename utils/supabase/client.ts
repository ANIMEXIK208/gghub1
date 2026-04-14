import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

export const isSupabaseBrowserConfigured = () => {
  return Boolean(
    typeof window !== 'undefined' &&
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
};

export const getSupabaseClient = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase browser config missing: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is not set.');
    return null;
  }

  if (!supabaseInstance) {
    supabaseInstance = createSupabaseClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    }) as SupabaseClient;
  }

  return supabaseInstance;
};

export const getBrowserSupabaseClient = () => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase client is not available in this environment.');
  }
  return supabase;
};
