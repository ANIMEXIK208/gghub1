import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/utils/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

const DEFAULT_ADMIN_EMAILS = ['ikechukwunelson31@gmail.com'];

const getAdminEmails = () => {
  const envEmails = process.env.NEXT_PUBLIC_GGHUB_ADMIN_EMAILS
    ? process.env.NEXT_PUBLIC_GGHUB_ADMIN_EMAILS.split(',').map((email) => email.trim()).filter(Boolean)
    : [];
  return Array.from(new Set([...envEmails, ...DEFAULT_ADMIN_EMAILS]));
};

export const useAdminAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = typeof window !== 'undefined' ? getSupabaseClient() : null;

  useEffect(() => {
    const checkAuth = async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          
          const adminEmails = getAdminEmails();
          const userEmail = (session.user.email || '').trim();
          const isAdminUser = adminEmails.includes(userEmail);
          
          setIsAdmin(isAdminUser);
        } else {
          setUser(null);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error checking admin auth:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  return { user, isAdmin, loading };
};

export const useRequireAdmin = () => {
  const { user, isAdmin, loading } = useAdminAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!loading && isAdmin) {
      setIsAuthorized(true);
    }
  }, [isAdmin, loading]);

  return { isAuthorized, loading, user };
};
