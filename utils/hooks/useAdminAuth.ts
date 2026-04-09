import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/utils/supabase/client';
import type { User, AuthChangeEvent, Session } from '@supabase/supabase-js';

export const useAdminAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = getSupabaseClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          
          // Check if user is admin
          const adminEmails = process.env.NEXT_PUBLIC_GGHUB_ADMIN_EMAILS?.split(',') || [];
          const userEmail = session.user.email || '';
          const isAdminUser = adminEmails.includes(userEmail.trim());
          
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

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChanged(async (event: AuthChangeEvent, session: Session | null) => {
      if (session?.user) {
        setUser(session.user);
        const adminEmails = process.env.NEXT_PUBLIC_GGHUB_ADMIN_EMAILS?.split(',') || [];
        const userEmail = session.user.email || '';
        setIsAdmin(adminEmails.includes(userEmail.trim()));
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
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
