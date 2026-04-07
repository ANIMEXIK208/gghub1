-- GGHub Supabase Setup - Run this in Supabase SQL Editor
-- This script sets up the complete user_profiles table with all necessary columns and permissions

-- Step 1: Create or update user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  game_points INTEGER DEFAULT 0,
  total_wins INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop existing policies (to recreate them fresh)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;

-- Step 4: Create RLS policies
CREATE POLICY "Users can view their own profile"
  ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Step 5: Create indexes for performance
CREATE INDEX IF NOT EXISTS user_profiles_email_idx ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS user_profiles_username_idx ON public.user_profiles(username);

-- Step 6: Create update trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_profiles_updated_at();

-- Step 7: Verify the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;
