'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, loading, isAuthenticated } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/admin');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    const success = login(password);
    if (!success) {
      setError('Sign in failed. Please check the admin password and try again.');
      return;
    }

    router.replace('/admin');
  };

  return (
    <main className="min-h-screen bg-[#020202] py-8 text-green-100">
      <div className="container mx-auto px-4 max-w-md">
        <div className="bg-black/90 border border-green-600 p-8 rounded-3xl shadow-2xl shadow-green-900/30">
          <h1 className="text-3xl font-black mb-4 text-center text-green-300">Admin Sign In</h1>
          <p className="text-sm text-green-200 mb-6 text-center">
            Enter your admin password to manage products, announcements, and site operations.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Admin Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full border border-green-500 bg-slate-950 text-green-100 rounded-md shadow-sm p-2"
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-green-600 text-black px-4 py-2 rounded-full font-semibold hover:bg-green-500"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}