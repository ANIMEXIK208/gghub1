# Supabase Integration - Key Files Reference

## Database & Schema

### `supabase-schema.sql`
- **Purpose**: SQL schema for all database tables
- **Tables**: users, game_logs, products, cart_items, announcements
- **How to use**: 
  1. Supabase dashboard → SQL Editor
  2. Copy entire file contents
  3. Paste and Run
- **Contains**: Table definitions, RLS policies, indexes

### `types/supabase.ts`
- **Purpose**: TypeScript type definitions matching database schema
- **Auto-generated**: Command provided in comments
- **Usage**: Import types for type-safe database queries
- **Types**: Database interface with Row/Insert/Update for each table

## Code - Supabase Integration

### `lib/supabase.ts` **[CORE]**
- **Purpose**: Supabase client initialization and auth helpers
- **Exports**:
  - `supabase`: Initialized Supabase client
  - `signUp(email, password, displayName)`: Register user
  - `signIn(email, password)`: Login user
  - `signOut()`: Logout user
  - `getCurrentUser()`: Get current auth user
  - `getSession()`: Get current session
- **Environment variables needed**:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### `contexts/UserContext.tsx` **[CORE]**
- **Purpose**: User authentication and profile management
- **Major changes**:
  - Replaced localStorage with Supabase queries
  - All methods now async (return Promises)
  - User IDs are now UUIDs (strings)
  - Game logs stored in separate database table
- **Key methods**:
  - `register(username, password, displayName, email)`: Async
  - `login(email, password)`: Async - note: uses email not username
  - `logout()`: Async
  - `addGameLog(entry)`: Creates entry in game_logs table
  - `updateProfile(updates)`: Updates user profile in database
- **Data flow**:
  1. User logs in → Supabase Auth validates
  2. User profile loaded from `users` table
  3. Game logs loaded from `game_logs` table via real-time subscription
  4. Leaderboard updated via Supabase data subscription

### `app/account/page.tsx`
- **Purpose**: User authentication UI and profile management
- **Changes**: Updated all auth handlers to be async
- **Key updates**:
  - `handleAuthSubmit`: Now async with await
  - `handleSaveProfile`: Now async with await
  - Status messages updated for async operations
  - Error handling added

### `contexts/CartContext.tsx`
- **Purpose**: Shopping cart state management
- **Changes**: Fixed user ID type from `number` to `string | number`
- **Why**: User IDs changed from numeric to UUID strings

## Configuration & Documentation

### `.env.local` (USER CREATES THIS)
- **Purpose**: Store Supabase credentials (never commit!)
- **Template**: Copy from `.env.example`
- **Credentials needed**:
  - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Anon public key from Supabase
- **How to get**:
  1. Supabase dashboard
  2. Settings → API
  3. Copy values

### `.env.example`
- **Purpose**: Template for environment variables
- **Do NOT edit**: This is just a template
- **Usage**: `cp .env.example .env.local`

### `SUPABASE_SETUP.md`
- **Purpose**: Detailed step-by-step setup instructions
- **Covers**:
  - Creating Supabase project
  - Setting environment variables
  - Running schema migrations
  - Testing the integration
  - Database functions (optional)

### `QUICKSTART.md` ⭐
- **Purpose**: 5-minute quick setup guide
- **Best for**: Getting started immediately
- **Includes**: Troubleshooting table

### `MIGRATION_GUIDE.md`
- **Purpose**: Explains all changes from localStorage → Supabase
- **Details**: Data models, breaking changes, API changes
- **Reference**: Comprehensive documentation of what changed

## How They Work Together

```
┌─────────────────────────────────────────────┐
│           GGHub Application                 │
│  (app/page.tsx, GameChallenges.tsx, etc.)  │
└────────────┬────────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────────┐
│      UserContext (contexts/UserContext.tsx) │
│  - Authentication state                     │
│  - User profile data                        │
│  - Game logs history                        │
│  - Leaderboard                              │
└────────────┬────────────────────────────────┘
             │ useUser() hook
             ↓
┌─────────────────────────────────────────────┐
│    lib/supabase.ts (Supabase Client)       │
│  - Auth helpers (signUp, signIn, etc.)     │
│  - Database queries (.from().select())     │
│  - Real-time subscriptions                 │
└────────────┬────────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────────┐
│          Supabase Backend                   │
│  - PostgreSQL Database                      │
│  - Auth Service                             │
│  - Real-time Updates                        │
└────────────┬────────────────────────────────┘
             │
             ↓
   Environment Variables
   (.env.local - USER PROVIDES)
```

## Type Safety Flow

```
Database (PostgreSQL)
         ↓
supabase-schema.sql (SQL definitions)
         ↓
types/supabase.ts (TypeScript types)
         ↓
lib/supabase.ts (Typed Supabase client)
         ↓
contexts/UserContext.tsx (Component code with types)
         ↓
app/account/page.tsx (UI with types)
```

## Workflow: User registers

1. User fills form in `account/page.tsx`
2. Form submitted → `register()` called
3. `register()` calls `signUp()` from `lib/supabase.ts`
4. `signUp()` creates auth user via Supabase Auth
5. New profile inserted into `users` table (db)
6. User data returned and saved to React state
7. `useUser()` hook updates across app

## Workflow: User plays game

1. Game component calls `addGameLog(entry)` from context
2. `addGameLog()` calls supabase.from('game_logs').insert()
3. Entry saved to database
4. User balance updated in `users` table
5. Real-time subscription triggers leaderboard refresh
6. Leaderboard component re-renders with new data

## Key Breaking Changes

| Aspect | Before | After |
|--------|--------|-------|
| **User ID** | number (1, 2, 3) | UUID string |
| **Auth** | username + password | email + password |
| **Storage** | localStorage | Supabase DB |
| **Methods** | sync (boolean) | async (Promise<boolean>) |
| **Game Logs** | User object array | Separate table with FK |
| **Session** | localStorage token | Supabase managed |

## Setup Checklist

- [ ] Create Supabase project
- [ ] Copy NEXT_PUBLIC_SUPABASE_URL
- [ ] Copy NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] Create .env.local with these values
- [ ] Run `npm install @supabase/supabase-js`
- [ ] Run supabase-schema.sql in Supabase SQL Editor
- [ ] Test register → play game → check database
- [ ] Verify leaderboard updates in real-time

---

**Start with QUICKSTART.md for immediate setup.**
**Refer to MIGRATION_GUIDE.md for concept explanations.**
