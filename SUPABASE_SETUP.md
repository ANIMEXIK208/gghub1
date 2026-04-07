# Supabase Integration Setup Guide

This guide walks you through setting up your GGHub project with Supabase for persistent data storage and authentication.

## Prerequisites

- Supabase account (free tier available at https://supabase.com)
- A Supabase project created
- Node.js 18+ installed
- The @supabase/supabase-js package (will be installed via npm)

## Step 1: Create Supabase Project (if not already done)

1. Go to https://supabase.com and sign in
2. Click "New Project" and create a project
3. Note your project URL and anon API key (you'll need these)

## Step 2: Set Up Environment Variables

1. Create or update `.env.local` in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

2. Replace with your actual values from Supabase dashboard:
   - Go to Settings → API
   - Copy the Project URL and Anon public key

## Step 3: Create Database Schema

1. In Supabase dashboard, go to SQL Editor
2. Click "New Query"
3. Copy the contents of `supabase-schema.sql`
4. Paste into the SQL editor and click "Run"

This creates:
- `users` table (extends Supabase auth)
- `game_logs` table (for game history)
- `products` table (for shop)
- `cart_items` table (for shopping cart)
- `announcements` table (for in-app announcements)
- Proper RLS policies and indexes

## Step 4: Install Dependencies

```bash
npm install @supabase/supabase-js
```

## Step 5: Migrate UserContext to Supabase

The file `lib/supabase.ts` already contains helper functions. Update `contexts/UserContext.tsx` to use Supabase instead of localStorage:

Key changes needed:
- Replace localStorage getters with `supabase.from('users').select()`
- Replace localStorage setters with `supabase.from('users').update()`
- Use `supabase.auth.signUp()` for registration
- Use `supabase.auth.signInWithPassword()` for login
- Subscribe to real-time updates for leaderboard

## Step 6: Authentication

Supabase Auth is automatically enabled. Users can:
- Sign up with email/password
- Log in with their credentials
- Reset password via email
- Session is managed by Supabase automatically

## Step 7: Test the Integration

1. Run `npm run dev`
2. Create a new account
3. Check the Supabase dashboard "users" table for the new entry
4. Play a game and verify entries appear in "game_logs"

## Troubleshooting

### Missing environment variables
- Ensure `.env.local` is in the project root
- Check variable names match exactly (case-sensitive)
- Restart dev server after adding env vars

### RLS policy errors
- Verify you're signed in before performing operations
- Check the SQL queries include `auth.uid()` checks

### Schema creation failed
- Ensure your Supabase project has an empty public schema
- Try running migrations through a separate SQL file in dashboard

## Next Steps

- Enable additional auth methods (Google, GitHub) in Supabase dashboard
- Set up automated backups
- Configure custom domain (production)
- Set up monitoring and error tracking

## Connecting Tables

Once schema is created:

1. **User Registration**: New users are created in both `auth.users` and public `users` table
2. **Game Logs**: Each game result writes to `game_logs` with user_id reference
3. **Leaderboard**: Query aggregated game_logs by user for rankings
4. **Cart**: Store user's shopping cart in cart_items table

## Database Functions (Optional)

You can create Supabase functions for complex operations:
- Aggregate leaderboard stats
- Calculate user rankings
- Process batch game results
- Auto-cleanup old game logs

See Supabase docs for creating PostgreSQL functions in the dashboard.
