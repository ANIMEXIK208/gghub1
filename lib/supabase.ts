import { getSupabaseClient } from '@/utils/supabase/client';

export const getSupabase = () => getSupabaseClient();

export const signUp = async (email: string, password: string, displayName: string) => {
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        displayName,
      },
    },
  });
  return { 
    user: data?.user || null, 
    session: data?.session || null,
    error 
  };
};

export const signIn = async (email: string, password: string) => {
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { 
    user: data?.user || null,
    session: data?.session || null,
    error 
  };
};

export const signOut = async () => {
  const supabase = getSupabase();
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.getUser();
  return { 
    user: data?.user || null,
    error 
  };
};

export const getSession = async () => {
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.getSession();
  return { 
    session: data?.session || null,
    error 
  };
};
