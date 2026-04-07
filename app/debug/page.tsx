'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function DebugPage() {
  const { user, userProfile, isAuthenticated, loading } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-900 py-20 px-4">
      <div className="container mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-white mb-8">🔍 Auth Debug Info</h1>

        <div className="space-y-6">
          {/* Status */}
          <div className="rounded-lg border border-green-500/30 bg-slate-900/80 p-6">
            <h2 className="text-xl font-bold text-green-300 mb-4">Status</h2>
            <div className="space-y-2">
              <p className="text-green-100">Loading: <span className="font-mono text-yellow-300">{loading ? 'true' : 'false'}</span></p>
              <p className="text-green-100">Authenticated: <span className="font-mono text-yellow-300">{isAuthenticated ? 'true' : 'false'}</span></p>
            </div>
          </div>

          {/* User Data */}
          <div className="rounded-lg border border-green-500/30 bg-slate-900/80 p-6">
            <h2 className="text-xl font-bold text-green-300 mb-4">User Data</h2>
            <div className="space-y-2">
              <p className="text-green-100">User ID: <span className="font-mono text-yellow-300">{user?.id || 'null'}</span></p>
              <p className="text-green-100">Email: <span className="font-mono text-yellow-300">{user?.email || 'null'}</span></p>
              <p className="text-green-100">Full Name: <span className="font-mono text-yellow-300">{user?.user_metadata?.full_name || 'null'}</span></p>
            </div>
          </div>

          {/* Profile Data */}
          <div className="rounded-lg border border-green-500/30 bg-slate-900/80 p-6">
            <h2 className="text-xl font-bold text-green-300 mb-4">Profile Data</h2>
            {userProfile ? (
              <div className="space-y-2">
                <p className="text-green-100">ID: <span className="font-mono text-yellow-300">{userProfile.id}</span></p>
                <p className="text-green-100">Username: <span className="font-mono text-yellow-300">{userProfile.username || 'null'}</span></p>
                <p className="text-green-100">Display Name: <span className="font-mono text-yellow-300">{userProfile.display_name || 'null'}</span></p>
                <p className="text-green-100">Email: <span className="font-mono text-yellow-300">{userProfile.email || 'null'}</span></p>
                <p className="text-green-100">Bio: <span className="font-mono text-yellow-300">{userProfile.bio || 'null'}</span></p>
                <p className="text-green-100">Game Points: <span className="font-mono text-yellow-300">{userProfile.game_points}</span></p>
                <p className="text-green-100">Total Wins: <span className="font-mono text-yellow-300">{userProfile.total_wins}</span></p>
              </div>
            ) : (
              <p className="text-yellow-300">No profile data loaded</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Link
              href="/account"
              className="flex-1 bg-green-600 text-black px-6 py-3 rounded-lg font-bold hover:bg-green-500 transition-all text-center"
            >
              Go to Profile
            </Link>
            <Link
              href="/"
              className="flex-1 bg-slate-700 text-white px-6 py-3 rounded-lg font-bold hover:bg-slate-600 transition-all text-center"
            >
              Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
