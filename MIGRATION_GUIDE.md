# GGHub Supabase Migration Guide

## What Changed

This document outlines all changes made to migrate GGHub from localStorage to Supabase for persistent data storage and authentication.

### Core Changes

#### 1. User ID System
- **Before**: Numeric IDs (1, 2, 3...)
- **After**: UUID format (e.g., `550e8400-e29b-41d4-a716-446655440000`)
- **Impact**: All existing user data is incompatible. Users need to re-register.

#### 2. Authentication
- **Before**: Username/password stored in localStorage
- **After**: Email/password authenticated via Supabase Auth service
- **UserContext methods now async**:
  ```typescript
  // Old
  const success = login(username, password);
  
  // New
  const success = await login(email, password);
  ```

#### 3. User Profiles
- **Before**: Stored entirely in localStorage
- **After**: Stored in `users` table in Supabase  with fields:
  - `id` (UUID, primary key, references auth.users)
  - `username` (unique text)
  - `display_name` (text)
  - `email` (text)
  - `bio` (text)
  - `balance` (integer)
  - `created_at`, `updated_at` (timestamps)

#### 4. Game Logs
- **Before**: Stored in localStorage as part of UserProfile
- **After**: Separate `game_logs` table with fields:
  - `id` (UUID, primary key)
  - `user_id` (UUID, foreign key to users)
  - `game` (text - game name)
  - `quest` (text - quest name)
  - `result` (text - win/loss)
  - `points` (integer)
  - `balance_change` (integer - amount balance changed)
  - `timestamp` (timestamp of play)

#### 5. Security (RLS Policies)
All tables protected with Row-Level Security:
- Users can only see/update their own profile
- Users can only see/insert their own game logs
- Users can only manage their own cart
- Products/announcements are publicly readable

### File Changes

#### Modified Files
- `contexts/UserContext.tsx` - Complete rewrite for Supabase
- `app/account/page.tsx` - Updated for async auth functions
- `contexts/CartContext.tsx` - Fixed user ID type (string instead of number)
- `lib/supabase.ts` - Added proper TypeScript types

#### New Files
- `types/supabase.ts` - Database type definitions
- `supabase-schema.sql` - SQL schema for all tables
- `SUPABASE_SETUP.md` - Setup instructions
- `.env.example` - Environment variable template

#### Configuration
- `tsconfig.json` - May need `ignoreDeprecations` flag if using TypeScript 7.0+

### Migration Steps Performed

1. ✅ Created Supabase client library (`lib/supabase.ts`)
   - Initialized Supabase with environment variables
   - Implemented auth helpers: signUp, signIn, signOut, getCurrentUser, getSession
   - Added proper TypeScript types

2. ✅ Created database schema (`supabase-schema.sql`)
   - Five main tables: users, game_logs, products, cart_items, announcements
   - RLS policies for row-level security
   - Performance indexes on frequently queried columns

3. ✅ Generated TypeScript types (`types/supabase.ts`)
   - Matches database schema structure
   - Enables IDE autocomplete and type safety

4. ✅ Migrated UserContext
   - Replaced localStorage with Supabase queries
   - All auth methods now async (Promise-based)
   - Real-time subscription for leaderboard updates
   - Game logs fetched from `game_logs` table
   - User balance stored and updated in `users` table

5. ✅ Updated authentication pages
   - Account page now handles async auth functions
   - Login uses email (not username)
   - Added loading states and error messages
   - Removed password update from profile settings

6. ✅ Fixed type compatibility
   - User IDs now strings (UUIDs) throughout
   - CartContext updated to accept string user IDs
   - All GameLogEntry fields typed properly

### Breaking Changes for Users

⚠️ **Users must create new accounts:**
- Old localStorage data is incompatible
- New accounts use email instead of username
- All game history starts fresh

### Data Models

#### UserProfile (Before)
```typescript
{
  id: number;
  username: string;
  password: string;
  displayName: string;
  email?: string;
  bio?: string;
  balance: number;
  gameLog: GameLogEntry[];
}
```

#### UserProfile (After)
```typescript
{
  id: string; // UUID
  username: string;
  displayName: string;
  email?: string;
  bio?: string;
  balance: number;
  gameLog: GameLogEntry[];
}
```

Note: Password is never stored in the app anymore - managed by Supabase Auth.

#### GameLogEntry (Before)
```typescript
{
  id: number;
  timestamp: string;
  game: string;
  quest: string;
  result: string;
  points: number;
  balanceChange?: number;
}
```

#### GameLogEntry (After)
Same structure, but `id` is now UUID and fetched from `game_logs` table.

### API Changes

#### UserContext Methods

| Method | Before | After |
|--------|--------|-------|
| `register()` | `boolean` | `Promise<boolean>` |
| `login()` | `(username, password) => boolean` | `(email, password) => Promise<boolean>` |
| `logout()` | `void` | `Promise<void>` |
| `updateProfile()` | `void` | `Promise<void>` |
| `addGameLog()` | `void` | `Promise<void>` |

All methods that modify data are now async and return Promises.

### Testing the Migration

1. **Start application**:
   ```bash
   npm install @supabase/supabase-js
   npm run dev
   ```

2. **Create test account**:
   - Go to Account page
   - Register with test@example.com
   - Check Supabase dashboard: users table should have new entry

3. **Test game log creation**:
   - Play a game (e.g., Aviator)
   - Verify game_logs table has new entry
   - Check balance field updated in users table

4. **Test leaderboard**:
   - Create multiple test accounts
   - Play games with each account
   - Leaderboard should update in real-time

### Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| "Supabase credentials missing" | Not in browser environment | Check `.env.local` is in project root |
| Login fails | Email not registered | Use the Register tab first |
| Game log not saved | User not logged in | Ensure `isLoggedIn` is true |
| RLS policy violation | User accessing other's data | Check RLS policies are set correctly |
| TypeScript errors on `@supabase/supabase-js` | Package not installed | Run `npm install @supabase/supabase-js` |

### Future Enhancements

Potential improvements now that we have a database:
- User achievements/badges table
- Friend system with requests
- Seasonal leaderboards (monthly, yearly)
- Game statistics aggregation
- Admin moderation panel
- User blocking system
- Notification system

### References

- Supabase Documentation: https://supabase.com/docs
- Next.js Environment Variables: https://nextjs.org/docs/basic-features/environment-variables
- Row Level Security: https://supabase.com/docs/guides/auth/row-level-security
