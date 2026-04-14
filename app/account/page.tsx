'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getSafeImageUrl } from '@/utils/supabase/storage';
import { getBrowserSupabaseClient } from '@/utils/supabase/client';
import type { User } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  game_points: number;
  total_wins: number;
  games_played: number;
  created_at: string;
  updated_at: string;
}

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    display_name: '',
    bio: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const router = useRouter();

  const getBrowserSupabase = () => getBrowserSupabaseClient();

  const createProfile = useCallback(async (userId: string) => {
    try {
      const supabase = getBrowserSupabase();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      // Generate unique username
      const baseUsername = (user.user_metadata?.full_name || user.email || 'user')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');

      let username = baseUsername;
      let counter = 1;

      while (true) {
        const { data: existing, error: usernameError } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('username', username)
          .single();

        if (!existing) break;

        if (usernameError && (usernameError as any).code !== 'PGRST116') {
          console.error('Username lookup error:', usernameError);
          break;
        }

        username = `${baseUsername}_${counter}`;
        counter++;
      }

      const newProfile = {
        id: userId,
        username,
        display_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        bio: null,
        avatar_url: user.user_metadata?.avatar_url || null,
        game_points: 0,
        total_wins: 0,
        games_played: 0,
      };

      const { data, error } = await supabase
        .from('user_profiles')
        .insert(newProfile)
        .select()
        .single();

      if (error) {
        console.error('Profile creation error:', error);
        return;
      }

      setProfile(data);
      setFormData({
        display_name: data.display_name,
        bio: data.bio || '',
      });
    } catch (error) {
      console.error('Profile creation error:', error);
    }
  }, []);

  const loadProfile = useCallback(async (userId: string) => {
    try {
      const supabase = getBrowserSupabase();
      const { data: profileData, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Profile load error:', error);
        return;
      }

      if (profileData) {
        setProfile(profileData);
        setFormData({
          display_name: profileData.display_name || '',
          bio: profileData.bio || '',
        });
      } else {
        await createProfile(userId);
      }
    } catch (error) {
      console.error('Profile load error:', error);
    }
  }, [createProfile]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
const supabase = getBrowserSupabase();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
          router.push('/');
          return;
        }

        setUser(session.user);
        await loadProfile(session.user.id);
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, loadProfile]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File size must be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile || !user) return null;

    try {
      const supabase = getBrowserSupabase();
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('profiles')
        .upload(fileName, avatarFile);

      if (error) {
        console.error('Avatar upload error:', error);
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Avatar upload error:', error);
      return null;
    }
  };

  const handleSave = async () => {
    if (!profile || !user) return;

    setSaving(true);
    try {
      let avatarUrl = profile.avatar_url;

      if (avatarFile) {
        const uploadedUrl = await uploadAvatar();
        if (uploadedUrl) {
          avatarUrl = uploadedUrl;
        }
      }

      const updates = {
        display_name: formData.display_name,
        bio: formData.bio || null,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      };

      const supabase = getBrowserSupabase();
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Profile update error:', error);
        alert('Failed to update profile');
        return;
      }

      setProfile(data);
      setEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (error) {
      console.error('Profile update error:', error);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const supabase = getBrowserSupabase();
      await supabase.auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-black flex items-center justify-center">
        <div className="text-center animate-pulse">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-400 border-t-transparent mx-auto mb-6 shadow-lg shadow-green-400/30"></div>
          <p className="text-green-400 text-xl font-semibold animate-bounce">Loading your gaming profile...</p>
          <div className="mt-4 flex justify-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-ping" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-ping" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-green-400 text-lg mb-4">Please sign in to view your profile</p>
          <button
            onClick={() => router.push('/')}
            className="bg-green-600 text-black px-6 py-2 rounded-full font-semibold hover:bg-green-500 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-black text-green-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Animated background elements */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-32 h-32 bg-green-500/10 rounded-full blur-xl animate-float"></div>
            <div className="absolute top-40 right-20 w-24 h-24 bg-blue-500/10 rounded-full blur-xl animate-float-delayed"></div>
            <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-purple-500/10 rounded-full blur-xl animate-float"></div>
          </div>

          <div className="relative bg-slate-900/90 backdrop-blur-sm rounded-xl p-8 border border-green-600/50 shadow-2xl shadow-green-500/20 animate-fade-in-up">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center animate-pulse">
                  <span className="text-2xl">🎮</span>
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent animate-slide-in-left">
                  My Gaming Profile
                </h1>
              </div>
              <button
                onClick={handleSignOut}
                className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-full font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-red-500/30"
              >
                Sign Out
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Profile Info */}
              <div>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative">
                    <Image
                      src={
                        avatarPreview?.startsWith('data:')
                          ? avatarPreview
                          : getSafeImageUrl(
                              profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`,
                              'profiles'
                            )
                      }
                      alt="Profile"
                      width={80}
                      height={80}
                      className="w-20 h-20 rounded-full border-2 border-green-400"
                    />
                    {editing && (
                      <label className="absolute bottom-0 right-0 bg-green-600 text-black p-1 rounded-full cursor-pointer hover:bg-green-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-green-300">@{profile.username}</h2>
                    <p className="text-green-500">{user.email}</p>
                  </div>
                </div>

                {editing ? (
                  <div className="space-y-6 animate-fade-in-up">
                    <div className="space-y-2">
                      <label className="block text-green-400 font-semibold mb-2 animate-slide-in-left">Display Name</label>
                      <input
                        type="text"
                        value={formData.display_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                        className="w-full bg-slate-800 border border-green-600 rounded-lg px-4 py-3 text-green-100 focus:border-green-400 focus:ring-2 focus:ring-green-500/25 focus:outline-none transition-all duration-300 hover:border-green-500"
                        placeholder="Enter your display name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-green-400 font-semibold mb-2 animate-slide-in-left" style={{animationDelay: '0.1s'}}>Bio</label>
                      <textarea
                        value={formData.bio}
                        onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                        rows={4}
                        className="w-full bg-slate-800 border border-green-600 rounded-lg px-4 py-3 text-green-100 focus:border-green-400 focus:ring-2 focus:ring-green-500/25 focus:outline-none transition-all duration-300 hover:border-green-500 resize-none"
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                    <div className="flex space-x-4 pt-4">
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-3 rounded-full font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Saving...</span>
                          </div>
                        ) : (
                          'Save Changes'
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setEditing(false);
                          setAvatarFile(null);
                          setAvatarPreview(null);
                          setFormData({
                            display_name: profile.display_name,
                            bio: profile.bio || '',
                          });
                        }}
                        className="border-2 border-green-600 text-green-400 px-8 py-3 rounded-full font-semibold hover:bg-green-600 hover:text-black transition-all duration-300 transform hover:scale-105"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-green-300">{profile.display_name}</h3>
                        <p className="text-green-500 mt-1">{profile.bio || 'No bio yet'}</p>
                      </div>
                      <button
                        onClick={() => setEditing(true)}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-full font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/30"
                      >
                        Edit Profile
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div>
                <h3 className="text-xl font-semibold text-green-300 mb-4">Gaming Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800 p-4 rounded border border-green-700">
                    <div className="text-2xl font-bold text-green-400">{profile.game_points}</div>
                    <div className="text-green-500">Game Points</div>
                  </div>
                  <div className="bg-slate-800 p-4 rounded border border-green-700">
                    <div className="text-2xl font-bold text-green-400">{profile.total_wins}</div>
                    <div className="text-green-500">Total Wins</div>
                  </div>
                  <div className="bg-slate-800 p-4 rounded border border-green-700">
                    <div className="text-2xl font-bold text-green-400">{profile.games_played}</div>
                    <div className="text-green-500">Games Played</div>
                  </div>
                  <div className="bg-slate-800 p-4 rounded border border-green-700">
                    <div className="text-2xl font-bold text-green-400">
                      {profile.games_played > 0 ? Math.round((profile.total_wins / profile.games_played) * 100) : 0}%
                    </div>
                    <div className="text-green-500">Win Rate</div>
                  </div>
                </div>
                <div className="mt-4 text-green-500">
                  Member since {new Date(profile.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}