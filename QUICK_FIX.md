# ⚡ QUICK FIX - Profile Loading Stuck

## Problem
After signing in, you see "Profile Loading" stuck with a spinner for more than 15 seconds.

## Solution (3 Steps)

### **STEP 1: Run Database Setup SQL**

1. Go to your **Supabase Dashboard**
2. Click **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy ENTIRE contents of `SETUP_SUPABASE_DATABASE.sql`
5. Paste into Supabase SQL Editor
6. Click **Run** (top right)
7. Wait for it to complete (should show "Query complete" at bottom)

**✅ After running:** Your database table is now configured

---

### **STEP 2: Create Storage Bucket for Avatars**

1. Go to Supabase Dashboard → **Storage** (left sidebar)
2. Click **Create a new bucket**
3. Name it: `profiles`
4. Make sure **Public** checkbox is CHECKED ✅
5. Click **Create**

**✅ After creating:** Your avatar storage is ready

---

### **STEP 3: Set OAuth Redirect URL**

1. Go to Supabase Dashboard → **Authentication** (left sidebar)
2. Click **Providers** → **Google**
3. Scroll to "Authorized redirect URIs"
4. Add this line (if not already there):
   ```
   http://localhost:3000/auth/callback
   ```
5. Click **Save**

**✅ After saving:** Google OAuth callback is configured

---

## **NOW TEST IT**

1. Refresh your browser tab with the loading profile
2. OR go to home page (`localhost:3000`) and sign in again
3. You should now see your profile page loading successfully! 🎉

---

## If Still Not Working

1. Visit `http://localhost:3000/debug`
2. This shows your auth status
3. Check browser console for errors (F12 → Console tab)
4. Take a screenshot of the debug page and errors
5. Share with support

---

## Quick Checklist

- [ ] Ran SETUP_SUPABASE_DATABASE.sql in Supabase
- [ ] Created "profiles" storage bucket and made it PUBLIC
- [ ] Added `http://localhost:3000/auth/callback` to Google OAuth redirect URLs
- [ ] Refreshed browser after all steps
- [ ] Can see profile loading or profile page now

**That's it!** 🚀 Your profile system should now work!
