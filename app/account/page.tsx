'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/utils/supabase/client';
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

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const supabase = getSupabaseClient();
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

  const loadProfile = async (userId: string) => {
    try {
      const supabase = getSupabaseClient();
      const { data: profileData, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
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
        // Create profile if it doesn't exist
        await createProfile(userId);
      }
    } catch (error) {
      console.error('Profile load error:', error);
    }
  };

  const createProfile = async (userId: string) => {
    try {
      const supabase = getSupabaseClient();
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
        const { data: existing } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('username', username)
          .single();

        if (!existing) break;
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
  };

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
      const supabase = getSupabaseClient();
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

      const supabase = getSupabaseClient();
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
      const supabase = getSupabaseClient();
      await supabase.auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
          <p className="text-green-400 text-lg">Loading profile...</p>
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
    <div className="min-h-screen bg-black text-green-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-900 rounded-lg p-8 border border-green-600">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-green-400">My Profile</h1>
              <button
                onClick={handleSignOut}
                className="bg-red-600 text-white px-4 py-2 rounded-full font-semibold hover:bg-red-700 transition-colors"
              >
                Sign Out
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Profile Info */}
              <div>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative">
                    <img
                      src={avatarPreview || profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`}
                      alt="Profile"
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
                  <div className="space-y-4">
                    <div>
                      <label className="block text-green-400 mb-2">Display Name</label>
                      <input
                        type="text"
                        value={formData.display_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                        className="w-full bg-slate-800 border border-green-600 rounded px-3 py-2 text-green-100 focus:border-green-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-green-400 mb-2">Bio</label>
                      <textarea
                        value={formData.bio}
                        onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                        rows={3}
                        className="w-full bg-slate-800 border border-green-600 rounded px-3 py-2 text-green-100 focus:border-green-400 focus:outline-none"
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-green-600 text-black px-4 py-2 rounded font-semibold hover:bg-green-500 disabled:opacity-50"
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
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
                        className="bg-slate-600 text-white px-4 py-2 rounded font-semibold hover:bg-slate-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-lg font-semibold text-green-300 mb-2">{profile.display_name}</h3>
                    {profile.bio && <p className="text-green-400 mb-4">{profile.bio}</p>}
                    <button
                      onClick={() => setEditing(true)}
                      className="bg-green-600 text-black px-4 py-2 rounded-full font-semibold hover:bg-green-500 transition-colors"
                    >
                      Edit Profile
                    </button>
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