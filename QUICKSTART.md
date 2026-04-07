# GGHub Supabase Quick Start

Get GGHub running with Supabase in 5 minutes.

## Prerequisites
- Node.js 18+
- Free Supabase account (https://supabase.com)

## Step 1: Supabase Project Setup (2 minutes)

1. **Create project** at https://supabase.com
   - New Project → Enter project name → Choose region → Create

2. **Copy credentials**:
   - Go to Settings → API
   - Copy "Project URL"
   - Copy "anon public" key

## Step 2: Environment Setup (1 minute)

1. **Create `.env.local` in project root**:
   ```bash
   cp .env.example .env.local
   ```

2. **Add your Supabase credentials**:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Step 3: Database Schema (1 minute)

1. **In Supabase dashboard → SQL Editor**
2. **Create new query** and paste contents of `supabase-schema.sql`
3. **Click Run** (green button)
4. Wait for "Success" message

## Step 4: Install & Run (1 minute)

```bash
# Install Supabase client
npm install @supabase/supabase-js

# Start development server
npm run dev
```

Visit http://localhost:3000 in your browser.

## Step 5: Test

1. **Register** new account (use any email, password)
2. **Play a game** (e.g., Aviator)
3. **Verify in Supabase**:
   - Dashboard → Table Editor
   - Check `users` table has your account
   - Check `game_logs` has your game result
   - Check balance updated in `users` table

## Done! 🎮

Your GGHub is now running with Supabase. All data persists automatically.

### Common Next Steps

**Enable More Auth Methods** (optional):
- Google, GitHub, Discord login
- Settings → Authentication → Providers

**Deploy to Production**:
- Add environment variables to hosting platform
- Disable email confirmations (Settings → Auth)
- Set up proper domain

**View Data**:
- Supabase Table Editor for visual browsing
- SQL Editor for complex queries
- Logs for debugging

### Troubleshooting

| Problem | Fix |
|---------|-----|
| "Cannot find module '@supabase/supabase-js'" | Run `npm install @supabase/supabase-js` |
| Login fails with "Invalid credentials" | Register first - you must exist in users table |
| "Supabase credentials missing" | Check `.env.local` and restart `npm run dev` |
| Game balance doesn't update | Check user is logged in (`isLoggedIn` should be true) |

### Useful Commands

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Run production build locally
npm run start

# Lint code
npm run lint
```

### File Structure

```
gghub.com/
├── app/                    # Next.js app directory
│   ├── page.tsx          # Home page
│   ├── account/          # Login/register/profile page
│   └── layout.tsx        # Root layout
├── components/           # React components
│   ├── GameChallenges.tsx # All 6 games
│   └── ...
├── contexts/             # React context providers
│   ├── UserContext.tsx   # User/auth state (now Supabase)
│   └── ...
├── lib/
│   └── supabase.ts       # Supabase client & helpers
├── types/
│   └── supabase.ts       # Database types
├── supabase-schema.sql   # Database schema
├── .env.local            # (create this) Your credentials
└── .env.example          # Template for .env.local
```

### Getting Help

- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Discord**: https://discord.supabase.com

---

**You're all set! Start building with GGHub.** 🚀
