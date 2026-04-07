'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, signInWithGoogle, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/account');
    }
  }, [isAuthenticated, router]);

  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      await signInWithGoogle();
    } catch (err) {
      setError('Failed to sign in with Google. Please try again.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-white mb-2">GGHub</h1>
          <p className="text-green-400 text-lg">Premium Gaming Equipment</p>
        </div>

        {/* Login Box */}
        <div className="rounded-3xl border border-green-500/30 bg-slate-900/80 p-8 shadow-2xl shadow-green-500/20 backdrop-blur-sm">
          <h2 className="text-3xl font-bold text-white mb-2">Sign In</h2>
          <p className="text-green-300 mb-8">Sign in to manage your account, orders, and support requests</p>

          {error && (
            <div className="mb-6 rounded-lg bg-red-900/50 border border-red-500 p-4 text-red-200">
              {error}
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 font-bold text-white text-lg shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-1 hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign in with Google
          </button>

          {/* Divider */}
          <div className="my-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-green-500/20"></div>
            <span className="text-green-400 text-sm">or continue exploring</span>
            <div className="flex-1 h-px bg-green-500/20"></div>
          </div>

          {/* Guest Button */}
          <button
            onClick={() => router.push('/')}
            className="w-full rounded-full border border-green-500/50 px-6 py-4 font-bold text-green-200 text-lg transition-all hover:bg-green-500/10 hover:border-green-400"
          >
            Continue as Guest
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-8 rounded-xl border border-green-500/20 bg-green-500/5 p-4 text-center">
          <p className="text-sm text-green-300">
            Create a unique profile, track your gaming stats, and follow your progress.
          </p>
        </div>
      </div>
    </div>
  );
}
