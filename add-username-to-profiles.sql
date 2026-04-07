-- Migration: Add username column to user_profiles table
-- This migration adds the username column and ensures proper table structure

-- Add username column if it doesn't exist
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Create index for username for faster queries
CREATE INDEX IF NOT EXISTS user_profiles_username_idx ON public.user_profiles(username);

-- Ensure updated_at trigger exists
CREATE OR REPLACE FUNCTION public.update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER IF NOT EXISTS update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_profiles_updated_at();

-- Verify RLS is enabled
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Re-create or update RLS policies (drop and recreate to ensure they're correct)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
CREATE POLICY "Users can view their own profile"
  ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
CREATE POLICY "Users can update their own profile"
  ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Verify email index exists
CREATE INDEX IF NOT EXISTS user_profiles_email_idx ON public.user_profiles(email);

