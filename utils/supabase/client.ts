import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const ensureSupabaseEnv = () => {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }
};

let supabaseInstance: any = null;

export const getSupabaseClient = () => {
  ensureSupabaseEnv();
  if (!supabaseInstance) {
    supabaseInstance = createSupabaseClient<Database, 'public'>(supabaseUrl!, supabaseKey!) as any;
  }
  return supabaseInstance;
};
