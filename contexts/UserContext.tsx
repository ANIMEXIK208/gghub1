'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getSupabaseClient } from '@/utils/supabase/client';
import type { Database } from '@/types/supabase';

type SupabaseUser = Database['public']['Tables']['users']['Row'];
type GameLog = Database['public']['Tables']['game_logs']['Row'];

export interface GameLogEntry {
  id?: string;
  timestamp: string;
  game: string;
  quest: string;
  result: string;
  points: number;
  balanceChange?: number;
}

export interface UserProfile {
  id: string; // UUID from Supabase auth
  username: string;
  displayName: string;
  email?: string;
  bio?: string;
  avatar_url?: string;
  balance: number;
  gameLog: GameLogEntry[];
  totalPoints: number;
  totalScore: number;
}

type LoginResult = {
  success: boolean;
  isAdmin?: boolean;
  reason?: 'unverified' | 'invalid';
};

interface UserContextType {
  users: UserProfile[];
  user: UserProfile | null;
  initialized: boolean;
  isLoggedIn: boolean;
  isAdmin: boolean;
  leaderboard: UserProfile[];
  register: (username: string, password: string, displayName: string, email: string) => Promise<boolean>;
  login: (emailOrUsername: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  refreshLeaderboards: () => Promise<void>;
  updateProfile: (updates: Partial<Pick<UserProfile, 'displayName' | 'email' | 'bio'>>) => Promise<void>;
  addGameLog: (entry: Omit<GameLogEntry, 'id' | 'timestamp'>) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [initialized, setInitialized] = useState(false);
  const supabase = React.useMemo(() => getSupabaseClient(), []);

  const adminEmails = React.useMemo(() => {
    const raw = process.env.NEXT_PUBLIC_GGHUB_ADMIN_EMAILS || '';
    return raw.split(',').map((email) => email.trim().toLowerCase()).filter(Boolean);
  }, []);

  const isAdmin = React.useMemo(() => {
    if (!user?.email) return false;
    return adminEmails.includes(user.email.toLowerCase());
  }, [adminEmails, user]);

  const buildUserProfile = async (userData: SupabaseUser): Promise<UserProfile> => {
    const { data: gameLogs } = await supabase
      .from('game_logs')
      .select('*')
      .eq('user_id', userData.id)
      .order('created_at', { ascending: false });

    const gameLogEntries: GameLogEntry[] = (gameLogs || []).map((log: GameLog) => ({
      id: log.id,
      timestamp: log.timestamp || new Date().toISOString(),
      game: log.game,
      quest: log.quest || '',
      result: log.result || '',
      points: log.points || 0,
      balanceChange: log.balance_change || 0,
    }));

    const totalPoints = gameLogEntries.reduce((sum, log) => sum + log.points, 0);
    const totalScore = totalPoints + (userData.balance || 0);

    return {
      id: userData.id,
      username: userData.username,
      displayName: userData.display_name || userData.username || '',
      email: userData.email || undefined,
      bio: userData.bio || undefined,
      avatar_url: (userData as any).avatar_url || undefined,
      balance: userData.balance || 0,
      gameLog: gameLogEntries,
      totalPoints,
      totalScore,
    };
  };

  const fetchAllUsers = async () => {
    try {
      const { data } = await supabase
        .from('users')
        .select('*')
        .order('balance', { ascending: false });

      if (!data) {
        setUsers([]);
        return;
      }

      const userProfiles: UserProfile[] = await Promise.all(
        (data as SupabaseUser[]).map((userData) => buildUserProfile(userData))
      );

      setUsers(userProfiles);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const refreshCurrentUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const authUserId = session?.user?.id;
      if (!authUserId) {
        setUser(null);
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUserId)
        .single() as { data: SupabaseUser | null; error: any };

      if (error || !data) {
        console.error('Failed to refresh current user:', error);
        setUser(null);
        return;
      }

      const updatedProfile = await buildUserProfile(data);
      setUser(updatedProfile);
    } catch (error) {
      console.error('Unexpected refresh current user error:', error);
    }
  };

  const refreshLeaderboards = React.useCallback(async () => {
    try {
      await fetchAllUsers();
      await refreshCurrentUser();
    } catch (error) {
      console.error('Failed to refresh leaderboard data:', error);
    }
  }, []);

  // Initialize: check for existing session on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initializeAuth = async () => {
      try {
        await refreshLeaderboards();
      } catch (error) {
        console.error('Auth initialization error:', error);
      }
      setInitialized(true);
    };

    initializeAuth();
  }, [refreshLeaderboards]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async () => {
      await refreshLeaderboards();
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [refreshLeaderboards]);

  // Fetch all users for leaderboard
  useEffect(() => {
    if (!initialized) return;

    let isActive = true;

    refreshLeaderboards();

    const leaderboardChannel = supabase.channel('public:leaderboard-updates');

    leaderboardChannel
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        async () => {
          if (!isActive) return;
          await refreshLeaderboards();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'game_logs' },
        async () => {
          if (!isActive) return;
          await refreshLeaderboards();
        }
      )
      .subscribe();

    return () => {
      isActive = false;
      leaderboardChannel.unsubscribe();
    };
  }, [initialized, refreshLeaderboards]);

  const register = async (username: string, password: string, displayName: string, email: string) => {
    try {
      // First check if username is already taken
      const { data: existingUser } = await supabase
        .from('users')
        .select('username')
        .eq('username', username)
        .single();

      if (existingUser) {
        console.error('Username already exists');
        return false;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            displayName,
          },
        },
      });

      if (error || !data?.user) {
        console.error('Registration error:', error);
        return false;
      }
      const authUser = data.user;

      // Create user profile in Supabase
      const userData: Database['public']['Tables']['users']['Insert'] = {
        id: authUser.id,
        username,
        display_name: displayName,
        email,
        bio: 'This player is ready to play.',
        balance: 0,
      };

      const { error: profileError } = await (supabase.from('users') as any).insert([userData]);

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Cannot safely delete auth users from the browser; just return false so the user can retry.
        return false;
      }

      // Don't set as current user immediately - user needs to verify email first
      return true;
    } catch (error) {
      console.error('Unexpected registration error:', error);
      return false;
    }
  };

  const login = async (emailOrUsername: string, password: string) => {
    try {
      let email = emailOrUsername;
      if (!emailOrUsername.includes('@')) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('email')
          .eq('username', emailOrUsername)
          .single();

        if (userError || !userData?.email) {
          console.error('Login user lookup error:', userError);
          return { success: false, reason: 'invalid' } as LoginResult;
        }

        email = userData.email;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data?.user) {
        console.error('Login error:', error);
        return { success: false, reason: 'invalid' } as LoginResult;
      }
      const authUser = data.user;
      const emailConfirmed = Boolean(
        (authUser as any).email_confirmed_at ||
        (authUser as any).confirmed_at ||
        (authUser as any).user_metadata?.email_verified,
      );

      if (!emailConfirmed) {
        await supabase.auth.signOut();
        return { success: false, reason: 'unverified' } as LoginResult;
      }

      // Fetch user profile
      const { data: profileData, error: fetchError } = await (supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single() as any);

      if (fetchError || !profileData) {
        console.error('Failed to fetch user profile:', fetchError);
        return { success: false, reason: 'invalid' } as LoginResult;
      }

      // Fetch game logs
      const { data: gameLogs } = await supabase
        .from('game_logs')
        .select('*')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false });

      const gameLogEntries: GameLogEntry[] = (gameLogs || []).map((log: GameLog) => ({
        id: log.id,
        timestamp: log.timestamp || new Date().toISOString(),
        game: log.game,
        quest: log.quest || '',
        result: log.result || '',
        points: log.points || 0,
        balanceChange: log.balance_change || 0,
      }));

      const totalPoints = gameLogEntries.reduce((sum, log) => sum + log.points, 0);
      const totalScore = totalPoints + (profileData.balance || 0);

      const userProfile: UserProfile = {
        id: profileData.id,
        username: profileData.username,
        displayName: profileData.display_name || '',
        email: profileData.email || undefined,
        bio: profileData.bio || undefined,
        avatar_url: (profileData as any).avatar_url || undefined,
        balance: profileData.balance || 0,
        gameLog: gameLogEntries,
        totalPoints,
        totalScore,
      };
      setUser(userProfile);
      return { success: true, isAdmin: adminEmails.includes((userProfile.email || '').toLowerCase()) } as LoginResult;
    } catch (error) {
      console.error('Unexpected login error:', error);
      return { success: false, reason: 'invalid' } as LoginResult;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateProfile = async (updates: Partial<Pick<UserProfile, 'displayName' | 'email' | 'bio'>>) => {
    if (!user) return;

    try {
      const { error } = await (supabase
        .from('users') as any)
        .update({
          display_name: updates.displayName,
          email: updates.email,
          bio: updates.bio,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        console.error('Update error:', error);
        return;
      }

      // Update local state
      setUser({
        ...user,
        displayName: updates.displayName ?? user.displayName,
        email: updates.email ?? user.email,
        bio: updates.bio ?? user.bio,
      });
    } catch (error) {
      console.error('Unexpected update error:', error);
    }
  };

  const addGameLog = async (entry: Omit<GameLogEntry, 'id' | 'timestamp'>) => {
    if (!user) return;

    try {
      const balanceChange = entry.balanceChange ?? 0;
      const timestamp = new Date().toISOString();

      // Insert game log
      const { error: logError } = await (supabase.from('game_logs') as any).insert([
        {
          user_id: user.id,
          game: entry.game,
          quest: entry.quest,
          result: entry.result,
          points: entry.points,
          balance_change: balanceChange,
          timestamp,
        },
      ]);

      if (logError) {
        console.error('Game log error:', logError);
        return;
      }

      // Update user balance
      const newBalance = Math.max(0, user.balance + balanceChange);
      const { error: balanceError } = await (supabase.from('users') as any)
        .update({ balance: newBalance, updated_at: timestamp })
        .eq('id', user.id);

      if (balanceError) {
        console.error('Balance update error:', balanceError);
        return;
      }

      // Update local state
      const newEntry: GameLogEntry = {
        ...entry,
        timestamp,
      };

      const totalPoints = user.totalPoints + entry.points;
      const totalScore = newBalance + totalPoints;
      const updatedUser = {
        ...user,
        balance: newBalance,
        gameLog: [newEntry, ...user.gameLog],
        totalPoints,
        totalScore,
      };

      setUser(updatedUser);
      setUsers((prevUsers) =>
        prevUsers.map((player) =>
          player.id === user.id
            ? {
                ...player,
                balance: newBalance,
                gameLog: [newEntry, ...player.gameLog],
                totalPoints,
                totalScore,
              }
            : player
        )
      );

      await refreshLeaderboards();
    } catch (error) {
      console.error('Unexpected game log error:', error);
    }
  };

  const leaderboard = React.useMemo(() => {
    return [...users]
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 100);
  }, [users]);

  return (
    <UserContext.Provider
      value={{
        users,
        user,
        initialized,
        isLoggedIn: Boolean(user),
        isAdmin,
        leaderboard,
        register,
        login,
        logout,
        refreshLeaderboards,
        updateProfile,
        addGameLog,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
