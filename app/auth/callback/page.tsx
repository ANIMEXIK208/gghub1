'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/utils/supabase/client';

const DEFAULT_ADMIN_EMAILS = ['ikechukwunelson31@gmail.com'];

const getAdminEmails = () => {
  const envEmails = process.env.NEXT_PUBLIC_GGHUB_ADMIN_EMAILS
    ? process.env.NEXT_PUBLIC_GGHUB_ADMIN_EMAILS.split(',').map((email) => email.trim()).filter(Boolean)
    : [];
  return Array.from(new Set([...envEmails, ...DEFAULT_ADMIN_EMAILS]));
};

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const supabase = getSupabaseClient();

        // Handle the OAuth callback and persist the session
        const { data, error } = await supabase.auth.getSessionFromUrl();

        if (error) {
          console.error('Auth callback error:', error);
          router.push('/?error=auth_callback_error');
          return;
        }

        if (data.session?.user) {
          const userEmail = (data.session.user.email || '').trim();
          const adminEmails = getAdminEmails();

          if (adminEmails.includes(userEmail)) {
            router.push('/admin');
          } else {
            router.push('/account');
          }
        } else {
          router.push('/');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        router.push('/?error=auth_callback_error');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
        <p className="text-green-400 text-lg">Completing sign in...</p>
      </div>
    </div>
  );
}