'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { user, userProfile, loading, refreshProfile } = useAuth();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleAuth = async () => {
      if (user && !userProfile) {
        try {
          await refreshProfile();
        } catch (error) {
          console.error('Failed to refresh profile after login:', error);
        }
      }

      // Force redirect after 3 seconds regardless of loading state
      timeoutId = setTimeout(() => {
        if (user) {
          router.replace('/account');
        } else {
          router.replace('/login');
        }
      }, 3000);
    };

    if (!loading) {
      handleAuth();
    }

    return () => clearTimeout(timeoutId);
  }, [user, loading, router, userProfile, refreshProfile]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
        <p className="text-green-300">Completing authentication...</p>
      </div>
    </div>
  );
}
