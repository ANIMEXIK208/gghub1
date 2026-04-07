'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import Image from 'next/image';

export default function AccountPage() {
  const router = useRouter();
  const { user, userProfile, isAuthenticated, loading, signOut, updateProfile, uploadAvatar } = useAuth();
  const { user: userContextData, leaderboard } = useUser();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [stats, setStats] = useState({ gamesPlayed: 0, winRate: 0, leaderboardRank: 0 });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login');
    }
    
    if (userProfile) {
      setDisplayName(userProfile.display_name || '');
      setBio(userProfile.bio || '');
      setAvatarUrl(userProfile.avatar_url || '');
      setTimedOut(false);
      
      // Clear timeout when profile loads
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
  }, [isAuthenticated, loading, router, userProfile]);

  // Set a timeout for loading
  useEffect(() => {
    if (loading && !userProfile) {
      timeoutRef.current = setTimeout(() => {
        console.warn('Profile loading timed out after 15 seconds');
        setTimedOut(true);
      }, 15000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [loading, userProfile]);

  // Calculate real-time stats based on user context data
  useEffect(() => {
    if (userContextData) {
      const gamesPlayed = userContextData.gameLog.length;
      
      // Calculate win rate from game logs (count wins vs total)
      const wins = userContextData.gameLog.filter(
        (log) => log.result && log.result.toLowerCase().includes('win')
      ).length;
      const winRate = gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0;
      
      // Calculate leaderboard rank
      const currentRank = leaderboard.findIndex((u) => u.id === userContextData.id) + 1;
      
      setStats({
        gamesPlayed,
        winRate,
        leaderboardRank: currentRank > 0 ? currentRank : leaderboard.length + 1,
      });
    }
  }, [userContextData, leaderboard]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select an image file' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image must be less than 5MB' });
      return;
    }

    try {
      setUploading(true);
      const url = await uploadAvatar(file);
      setAvatarUrl(url);
      setMessage({ type: 'success', text: 'Profile photo updated successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to upload profile photo' });
      console.error(error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSaveProfile = async () => {
    if (!displayName.trim()) {
      setMessage({ type: 'error', text: 'Display name cannot be empty' });
      return;
    }

    try {
      setSaving(true);
      await updateProfile({
        display_name: displayName,
        bio: bio,
      });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile' });
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (loading || timedOut) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-900 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          {timedOut ? (
            <>
              <h1 className="text-3xl font-bold text-white mb-4">⏱️ Loading Timeout</h1>
              <p className="text-green-300 mb-8">Your profile is taking longer than expected to load.</p>
              <p className="text-yellow-300 mb-8 text-sm">This usually means:</p>
              <ul className="text-left text-sm text-yellow-200 mb-8 space-y-2">
                <li>✓ Database migrations haven&apos;t been applied yet</li>
                <li>✓ RLS policies are blocking profile creation</li>
                <li>✓ Network connection issue with Supabase</li>
              </ul>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setTimedOut(false);
                    router.refresh();
                  }}
                  className="flex-1 bg-green-600 text-black px-4 py-2 rounded-lg font-bold hover:bg-green-500 transition-all text-sm"
                >
                  🔄 Retry
                </button>
                <button
                  onClick={() => router.push('/debug')}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-500 transition-all text-sm"
                >
                  🔍 Debug
                </button>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-white mb-4">⏳ Profile Loading</h1>
              <p className="text-green-300 mb-8">Setting up your profile... This may take a moment.</p>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
            </>
          )}
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-900 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold text-white mb-4">🔒 Access Denied</h1>
          <p className="text-green-300 mb-8">You need to sign in to view your profile</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-green-600 text-black px-6 py-3 rounded-full font-bold hover:bg-green-500 transition-all"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-900 py-20 px-4">
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">My Profile</h1>
          <p className="text-green-300">Manage your GGHub account and gaming stats</p>
        </div>

        {/* Message Alert */}
        {message && (
          <div className={`mb-6 rounded-lg p-4 ${message.type === 'success' ? 'bg-green-900/50 border border-green-500 text-green-200' : 'bg-red-900/50 border border-red-500 text-red-200'}`}>
            {message.text}
          </div>
        )}

        {userProfile ? (
          <>
            {/* Database Setup Notice */}
            {userProfile.username?.startsWith('user_') && (
              <div className="mb-6 rounded-lg bg-blue-900/30 border border-blue-500/50 p-4">
                <p className="text-blue-200 text-sm">
                  <strong>ℹ️ Temporary Profile:</strong> Your profile is using temporary data. To sync with the database and enable features like avatar uploads, run the SQL setup in <strong>QUICK_FIX.md</strong>.
                </p>
              </div>
            )}

            {/* Profile Card */}
            <div className="rounded-3xl border border-green-500/30 bg-slate-900/80 p-8 shadow-2xl shadow-green-500/20 backdrop-blur-sm mb-6">
          {/* Profile Header */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex gap-6">
              {/* Avatar with Upload */}
              <div className="relative">
                <div className="rounded-full bg-gradient-to-br from-green-500 to-blue-500 p-1 w-24 h-24 cursor-pointer hover:from-green-400 hover:to-blue-400 transition-all" onClick={handleAvatarClick}>
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={userProfile.display_name || 'User'}
                      width={96}
                      height={96}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-3xl">
                      🎮
                    </div>
                  )}
                </div>
                <button
                  onClick={handleAvatarClick}
                  disabled={uploading || userProfile.username?.startsWith('user_')}
                  className="absolute bottom-0 right-0 bg-green-600 rounded-full p-2 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title={userProfile.username?.startsWith('user_') ? "Set up database to enable uploads" : "Upload photo"}
                >
                  📷
                </button>
              </div>

              {/* Basic Info */}
              <div className="flex-1">
                <div className="mb-2">
                  <p className="text-xs uppercase text-green-400 font-semibold">Username</p>
                  <p className="text-sm text-green-300">@{userProfile.username}</p>
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">{userProfile.display_name}</h2>
                <p className="text-green-400 mb-4 text-sm">{user?.email}</p>
                <div className="flex gap-4 flex-wrap">
                  <div>
                    <p className="text-xs uppercase text-green-400">Game Points</p>
                    <p className="text-xl font-bold text-white">{userProfile.game_points || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-green-400">Total Wins</p>
                    <p className="text-xl font-bold text-white">{userProfile.total_wins || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Edit/Save Button */}
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="rounded-full bg-green-600 px-6 py-2 font-bold text-black hover:bg-green-500 transition-all whitespace-nowrap"
              >
                ✏️ Edit
              </button>
            )}
          </div>

          {/* Bio */}
          <div className="mb-8">
            <p className="text-xs uppercase text-green-400 mb-2 font-semibold">Bio</p>
            {isEditing ? (
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full rounded-lg bg-slate-950 border border-green-500/30 p-3 text-green-100 placeholder-green-600/50"
                rows={3}
                placeholder="Tell us about yourself..."
              />
            ) : (
              <p className="text-green-100">{bio || 'No bio added yet'}</p>
            )}
          </div>

          {/* Editing Mode */}
          {isEditing && (
            <div className="mb-8 space-y-4">
              <div>
                <p className="text-xs uppercase text-green-400 mb-2 font-semibold">Display Name</p>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full rounded-lg bg-slate-950 border border-green-500/30 p-3 text-green-100"
                  placeholder="Your display name"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex-1 rounded-full bg-gradient-to-r from-green-500 to-green-600 px-6 py-3 font-bold text-black hover:from-green-400 hover:to-green-500 transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : '✅ Save Changes'}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 rounded-full bg-slate-800 border border-green-500/30 px-6 py-3 font-bold text-green-200 hover:bg-slate-700 transition-all"
                >
                  ❌ Cancel
                </button>
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="my-8 h-px bg-green-500/20"></div>

          {/* Account Info */}
          <div className="space-y-4 mb-8">
            <div>
              <p className="text-xs uppercase text-green-400 font-semibold">Email</p>
              <p className="text-green-100">{user?.email}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-green-400 font-semibold">Username</p>
              <p className="text-green-100">@{userProfile?.username}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-green-400 font-semibold">Member Since</p>
              <p className="text-green-100">{userProfile && new Date(userProfile.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            className="w-full rounded-full bg-red-600/20 border border-red-500/50 px-6 py-3 font-bold text-red-300 hover:bg-red-600/40 hover:border-red-400 transition-all"
          >
            🚪 Sign Out
          </button>
        </div>

        {/* Stats Card */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Games Played', value: stats.gamesPlayed, icon: '🎮' },
            { label: 'Win Rate', value: `${stats.winRate}%`, icon: '🏆' },
            { label: 'Performance Rank', value: `#${stats.leaderboardRank}`, icon: '📊' },
          ].map((stat, i) => (
            <div key={i} className="rounded-lg border border-green-500/20 bg-slate-900/50 p-4 text-center hover:border-green-500/40 transition-all">
              <p className="text-2xl mb-2">{stat.icon}</p>
              <p className="text-xs uppercase text-green-400 mb-1 font-semibold">{stat.label}</p>
              <p className="text-lg font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>
          </>
        ) : (
          <div className="rounded-3xl border border-yellow-500/30 bg-slate-900/80 p-8 shadow-2xl shadow-yellow-500/20 backdrop-blur-sm mb-6">
            <p className="text-yellow-300 text-center">Profile data is still loading. Please wait...</p>
          </div>
        )}

        {/* Hidden file input for avatar upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          className="hidden"
        />
      </div>
    </div>
  );
}
