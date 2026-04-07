# Google OAuth Setup for Supabase

## Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click "Select a Project" → "New Project"
3. Name: `GGHub`
4. Click "Create"

## Step 2: Enable Google OAuth API
1. Search for "OAuth 2.0" in the search bar
2. Click "OAuth 2.0 Client IDs"
3. Click "Create Credentials" → "OAuth 2.0 Client ID"
4. Choose "Web Application"
5. Name: `GGHub Web Client`

## Step 3: Add Authorized Redirect URIs
Add these redirect URIs in the credentials form:

```
http://localhost:3000/auth/callback
https://aqpdlydoytfnfidcslno.supabase.co/auth/v1/callback?provider=google
```

## Step 4: Get Your Credentials
Copy these values:
- **Client ID**
- **Client Secret**

## Step 5: Add to Supabase
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to: Authentication → Providers → Google
4. Paste **Client ID** and **Client Secret**
5. Enable the provider
6. Copy the **Callback URL** from Supabase
7. Update Google Cloud Console with the Supabase callback URL

## Step 6: Create .env.local
Create a `.env.local` file in your project root:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

That's it! The implementation below will handle the rest.
