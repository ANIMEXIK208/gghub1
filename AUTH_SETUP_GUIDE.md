# Authentication Setup & Troubleshooting

## Issue: Blank Profile Page After Sign-In

If you see a blank page after signing in, here are the steps to fix it:

### Step 1: Run Database Migrations

Go to your Supabase dashboard and run these SQL scripts in the SQL Editor:

#### Script 1: Create user_profiles table (if not exists)
```sql
-- Go to supabase-schema.sql or create-user-profiles-table.sql contents
-- Copy and paste into Supabase SQL Editor
-- This ensures the user_profiles table exists
```

#### Script 2: Add username column and verify RLS policies
```sql
-- Go to add-username-to-profiles.sql
-- Copy and paste content into Supabase SQL Editor
-- This adds the username column and ensures RLS policies are correct
```

### Step 2: Configure Supabase OAuth Callback URL

1. Go to **Supabase Dashboard** → **Authentication** → **Providers** → **Google**
2. In the "Authorized redirect URIs" section, add:
   - `http://localhost:3000/auth/callback` (for local development)
   - `https://your-domain.com/auth/callback` (for production)

### Step 3: Create Storage Bucket for Avatars

1. Go to **Supabase Dashboard** → **Storage**
2. Create a new bucket named `profiles`
3. Set the bucket to **PUBLIC** (so profile photos are accessible)
4. Click the bucket → **Policies** and ensure public read access is allowed

### Step 4: Verify Environment Variables

Make sure these are in your `.env.local` file:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Step 5: Test Authentication

1. Visit `http://localhost:3000/debug`
2. This shows you the current auth state
3. Click "Sign in" button
4. After sign-in, you should see user data populated

## Expected Flow

1. **User clicks "Sign in"** → Redirected to Google OAuth
2. **User approves** → Redirected to `/auth/callback`
3. **App authenticates** → Creates profile in database
4. **App redirects** → To `/account` (user profile page)
5. **Profile loads** → Shows username, avatar, stats

## Common Issues & Solutions

### Issue: "Access Denied" on profile page
- **Cause**: User not authenticated
- **Solution**: Check cookies/browser storage isn't blocking Supabase session
- **Fix**: Clear browser cache, try in incognito mode

### Issue: Profile page is blank/loading forever
- **Cause**: user_profiles table not created or RLS policies blocking access
- **Solution**: Run migrations in Supabase (see Step 1 above)
- **Fix**: Verify RLS policies allow INSERT for new users

### Issue: Username shows as "null"
- **Cause**: Username generation failed or migration not applied
- **Solution**: Run the `add-username-to-profiles.sql` migration
- **Fix**: Check that username column exists: `SELECT username FROM public.user_profiles LIMIT 1;`

### Issue: Avatar upload fails
- **Cause**: Storage bucket doesn't exist or isn't public
- **Solution**: Create "profiles" bucket and make it public (see Step 3)
- **Fix**: Verify bucket permissions in Supabase Storage

## Debug Page

Access `http://localhost:3000/debug` to see:
- Current auth status (loading, authenticated)
- User data (ID, email, full name)
- Profile data (username, display name, game points, etc)
- Any missing or null values that indicate issues

## Database Schema Check

Run these queries in Supabase SQL Editor to verify:

```sql
-- Check if user_profiles table exists
SELECT * FROM information_schema.tables 
WHERE table_name = 'user_profiles';

-- Check columns in user_profiles
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_profiles';

-- Check RLS policies
SELECT * FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'user_profiles';

-- Test insert permission (replace with your user ID)
INSERT INTO public.user_profiles (id, email, display_name, username) 
VALUES ('your-user-id-here', 'test@example.com', 'Test User', 'test_user');
```

## Production Deployment

For production:
1. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in your hosting environment
2. Update OAuth redirect URLs to your production domain
3. Ensure RLS policies are properly configured for security
4. Test authentication flow before going live

## Need More Help?

- Check browser console for error messages
- Visit `/debug` page to see current auth state
- Check Supabase logs for database errors
- Verify all migrations were successfully applied
