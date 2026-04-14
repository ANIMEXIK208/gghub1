'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminAuth } from '@/utils/hooks/useAdminAuth';

const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function AdminLoginPage() {
  const router = useRouter();
  const { signInWithGoogle } = useAuth();
  const { user, isAdmin, loading } = useAdminAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && isAdmin) {
      router.push('/admin');
    }
  }, [isAdmin, loading, router]);

  const handleAdminSignIn = async () => {
    try {
      setError(null);
      await signInWithGoogle();
    } catch (err) {
      console.error('Admin sign in failed:', err);
      setError('Unable to sign in. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-green-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-3xl rounded-3xl border border-green-600/30 bg-black/80 p-10 shadow-2xl shadow-green-500/10 backdrop-blur-xl">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-green-400 mb-4">Admin Access</p>
          <h1 className="text-4xl font-black text-white mb-3">Admin Login</h1>
          <p className="text-green-300 text-base max-w-2xl mx-auto">
            Sign in with your Google account to access the GGHub admin dashboard. Only authorized admin emails may proceed.
          </p>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-green-600/20 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold text-green-200 mb-3">Admin Email Recognized</h2>
            <ul className="space-y-2 text-green-300 text-sm leading-6">
              <li>• ikechukwunelson31@gmail.com</li>
              <li>• Any address included in <code className="bg-slate-800 px-2 py-1 rounded">NEXT_PUBLIC_GGHUB_ADMIN_EMAILS</code></li>
            </ul>
          </div>

          {user && !isAdmin && (
            <div className="rounded-3xl border border-yellow-500/20 bg-yellow-900/10 p-6 text-yellow-200">
              You are signed in as <strong>{user.email}</strong>, but this account is not authorized for admin access.
            </div>
          )}

          {!isSupabaseConfigured && (
            <div className="rounded-3xl border border-yellow-500/20 bg-yellow-900/10 p-6 text-yellow-200">
              <p className="font-semibold">Supabase is not configured.</p>
              <p>Please set <code className="bg-slate-800 px-2 py-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="bg-slate-800 px-2 py-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in Netlify environment variables.</p>
            </div>
          )}
          {error && (
            <div className="rounded-3xl border border-red-500/20 bg-red-900/10 p-6 text-red-200">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <button
              onClick={handleAdminSignIn}
              className="w-full rounded-full bg-gradient-to-r from-green-600 to-cyan-500 px-6 py-4 text-lg font-semibold text-black hover:from-green-500 hover:to-cyan-400 transition-all"
            >
              Sign in with Google
            </button>
            <Link
              href="/"
              className="w-full inline-flex items-center justify-center rounded-full border border-green-600 px-6 py-4 text-lg font-semibold text-green-200 hover:bg-green-600/10 transition-all"
            >
              Back to Store
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
