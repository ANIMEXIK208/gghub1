# GGHub Supabase Deployment Checklist

## Pre-Deployment

### Local Development Setup
- [ ] Node.js 18+ installed
- [ ] Cloned/have GGHub project running
- [ ] npm working correctly (`npm --version` shows version)

### Supabase Project
- [ ] Supabase account created (https://supabase.com)
- [ ] New Supabase project created
- [ ] Project loaded and accessible in dashboard
- [ ] Settings → API page opened

## Credentials Collection

### From Supabase Dashboard
- [ ] Copied Project URL (Settings → API)
- [ ] Copied Anon Public Key (Settings → API)
- [ ] Stored both in secure location (not in git!)

### Create .env.local
- [ ] Created `.env.local` file in project root
- [ ] Added `NEXT_PUBLIC_SUPABASE_URL=https://...`
- [ ] Added `NEXT_PUBLIC_SUPABASE_ANON_KEY=...`
- [ ] Verified file is NOT in git (check .gitignore)

## Database Schema

### Supabase SQL Editor
- [ ] Opened Supabase dashboard
- [ ] Navigated to: SQL Editor
- [ ] Created new query
- [ ] Copied entire contents of `supabase-schema.sql`
- [ ] Pasted into SQL editor
- [ ] Executed query (green Run button)
- [ ] Verified "Success" message
- [ ] Checked Table Editor shows new tables:
  - [ ] `users` table exists
  - [ ] `game_logs` table exists
  - [ ] `products` table exists
  - [ ] `cart_items` table exists
  - [ ] `announcements` table exists

## Installation & Dependencies

### npm Installations
- [ ] Ran `npm install @supabase/supabase-js`
- [ ] Verified successful install: `npm ls @supabase/supabase-js`
- [ ] No error messages

### Start Development Server
- [ ] Ran `npm run dev`
- [ ] Server started on http://localhost:3000
- [ ] Browser shows GGHub home page
- [ ] No console errors

## Functional Testing

### Authentication Tests
- [ ] Navigated to Account page
- [ ] Registration form visible
- [ ] Registered test account:
  - [ ] Username: test-user-1
  - [ ] Email: test1@example.com
  - [ ] Password: test123
  - [ ] Display Name: Test Player 1
- [ ] Success message showed
- [ ] Logged in automatically after registration
- [ ] Profile shows correct username/email
- [ ] Test account visible in Supabase `users` table

### Multi-User Test
- [ ] Registered second account (test2@example.com)
- [ ] Logged out from first account
- [ ] Logged in with second account
- [ ] Profile shows second user's data
- [ ] Both users in `users` table

### Game Playing Test
- [ ] Logged in with test account
- [ ] Played Aviator game at least 3 times
- [ ] Made some stake changes to vary bets
- [ ] Won some games, lost some
- [ ] Balance changed by wins/losses
- [ ] Balance displayed correctly in profile

### Database Verification
- [ ] Opened Supabase Table Editor
- [ ] Checked `users` table:
  - [ ] Test users exist
  - [ ] Balance field updated (not 0)
  - [ ] `created_at`, `updated_at` populated
- [ ] Checked `game_logs` table:
  - [ ] Has entries from test games
  - [ ] `user_id` matches test user ID
  - [ ] `balance_change` reflects wins/losses
  - [ ] `points` calculated correctly

### Leaderboard Test
- [ ] Played additional games to accumulate points
- [ ] Checked Account page leaderboard section
- [ ] Test user appears in leaderboard
- [ ] Rankings based on balance + points
- [ ] Top 100 users displayed

### Real-time Updates
- [ ] Opened two browser windows/tabs
- [ ] Logged in as same user in both
- [ ] Played game in first window
- [ ] Checked if leaderboard updates in second window
- [ ] Balance updates reflected in both

## Error Handling Tests

### Missing Environment Variables
- [ ] Temporarily rename `.env.local`
- [ ] Try loading app
- [ ] Console shows warning about missing credentials
- [ ] Restore `.env.local`
- [ ] Refresh page and verify it works

### Failed Login
- [ ] Try logging in with non-existent email
- [ ] See error message: "Login failed"
- [ ] Try wrong password with correct email
- [ ] See error message
- [ ] Try correct credentials - login succeeds

### Offline/Database Down Simulation
- [ ] In browser DevTools, go to Network tab
- [ ] Set to "Offline" mode
- [ ] Try to play a game
- [ ] See error or game doesn't save
- [ ] Go back online
- [ ] Game continues normally

## Security Tests

### RLS Policies
- [ ] Open Supabase SQL Editor
- [ ] Run: `SELECT * FROM game_logs WHERE user_id != 'my-uuid';`
- [ ] Should return no results (RLS is blocking)
- [ ] Run: `SELECT * FROM game_logs WHERE user_id = 'my-uuid';`
- [ ] Should return only your own logs

### JWT Token Security
- [ ] DevTools → Application → Cookies
- [ ] See no Supabase token exposed
- [ ] DevTools → Application → Local Storage
- [ ] See no auth credentials stored
- [ ] (Supabase manages this automatically)

## Types & TypeScript

### Type Checking
- [ ] Ran `npm run build`
- [ ] No TypeScript errors
- [ ] All files compile successfully

### Auto-complete Working
- [ ] In VSCode, open `contexts/UserContext.tsx`
- [ ] Type: `addGameLog(` and use Ctrl+Space
- [ ] IntelliSense shows: `entry: Omit<GameLogEntry, "id" | "timestamp">`
- [ ] Types are recognized properly

## Production Deployment Prep

### Code Review
- [ ] Reviewed `lib/supabase.ts`
- [ ] Reviewed `contexts/UserContext.tsx`
- [ ] No hardcoded credentials anywhere
- [ ] All auth flows use environment variables

### Documentation Check
- [ ] `.env.example` present (template for deploy)
- [ ] `SUPABASE_SETUP.md` ready for team
- [ ] `QUICKSTART.md` ready for users
- [ ] `MIGRATION_GUIDE.md` explains changes

### Configuration
- [ ] `.env.local` NOT in git (verify .gitignore)
- [ ] `.env.example` IS in git (template)
- [ ] No debugging flags left in code

### Before Deploy
- [ ] All tests passing
- [ ] No console errors
- [ ] Verified RLS policies set
- [ ] Email confirmation enabled/disabled as needed

## Deployment

### Upload to Server/Hosting
- [ ] Code pushed to git (without .env.local)
- [ ] Hosting platform accessed
- [ ] Environment variables added:
  - [ ] NEXT_PUBLIC_SUPABASE_URL
  - [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] Build triggered

### Production Verification
- [ ] Deployed app loaded at production URL
- [ ] Can register new account
- [ ] Can login
- [ ] Play game and balance updates
- [ ] Check Supabase sees production data

### Post-Deployment Tasks
- [ ] Configured custom domain (if applicable)
- [ ] Set up automated backups in Supabase
- [ ] Enabled monitoring/error tracking
- [ ] Tested password reset flow
- [ ] Set up production email (if needed)

## Ongoing Maintenance

### Monitoring
- [ ] Set up error notifications
- [ ] Monitor database usage/costs
- [ ] Check auth logs regularly
- [ ] Review game_logs for anomalies

### Backups
- [ ] Supabase automated backups enabled
- [ ] Test restore from backup
- [ ] Document backup schedule

### Updates
- [ ] Check for @supabase/supabase-js updates monthly
- [ ] Review Supabase release notes
- [ ] Test updates in staging first

---

## Final Checklist

- [ ] **Development Complete**: All tests passing locally
- [ ] **Production Ready**: Deployed and verified
- [ ] **Documentation**: All guides provided to team
- [ ] **Monitoring**: Error tracking enabled
- [ ] **Backups**: Automated and tested

---

**Deployment Status**: 

- When all boxes checked: ✅ **READY FOR PRODUCTION**
- If any boxes unchecked: ⚠️ **RESOLVE BEFORE PRODUCTION**

---

## Support

If anything fails:

1. Check `SUPABASE_SETUP.md` - detailed troubleshooting
2. Check `QUICKSTART.md` - common issues
3. Check `MIGRATION_GUIDE.md` - understand changes
4. Check Supabase dashboard - verify database state
5. Check browser console - error messages

---

**Last Updated**: Integration Complete
**Next Step**: Follow checklist from top to bottom
