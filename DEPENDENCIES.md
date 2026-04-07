# Supabase Integration - Required Packages

## Before Running

You need to install the Supabase JavaScript client:

```bash
npm install @supabase/supabase-js
```

## What This Package Provides

`@supabase/supabase-js` is the official Supabase client library for JavaScript/TypeScript.

**Version**: >= 2.38.0 (as of this integration)

### Key Features Used

1. **Authentication**:
   - `auth.signUp()` - Register new users
   - `auth.signInWithPassword()` - Login users
   - `auth.signOut()` - Logout users
   - `auth.getSession()` - Get current session
   - `auth.getUser()` - Get current user

2. **Database**:
   - `.from(table).select()` - Query data
   - `.from(table).insert()` - Create records
   - `.from(table).update()` - Modify records
   - `.from(table).delete()` - Delete records

3. **Real-time**:
   - `.on('*', callback)` - Subscribe to changes
   - Real-time leaderboard updates

## Package Info

| Property | Value |
|----------|-------|
| **Name** | @supabase/supabase-js |
| **Repository** | https://github.com/supabase/supabase-js |
| **Docs** | https://supabase.com/docs/reference/javascript/introduction |
| **License** | Apache 2.0 |
| **Type Definitions** | Included ✓ |
| **Size** | ~50KB (gzipped) |

## Installation Command

```bash
# Using npm
npm install @supabase/supabase-js

# Using yarn
yarn add @supabase/supabase-js

# Using pnpm
pnpm add @supabase/supabase-js

# Using bun
bun add @supabase/supabase-js
```

## Node Version Requirement

- Node.js 14.5+ (recommended 18+)

## Verify Installation

```bash
npm ls @supabase/supabase-js
```

Should show:
```
@supabase/supabase-js@X.X.X
```

## Dependencies This Brings

The package automatically installs its own dependencies:
- `@supabase/gotrue-js` - Auth client
- `@supabase/postgrest-js` - PostgreSQL client
- `@supabase/realtime-js` - Real-time subscriptions
- `@supabase/supabase-storage-js` - File storage

You don't need to install these separately.

## Environment Variables

After installing the package, ensure you have `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

## TypeScript Support

Types are included automatically. You can reference them:

```typescript
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabase: SupabaseClient<Database> = createClient(...);
```

## Testing Installation

After `npm install`, try this:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://your-project.supabase.co',
  'your-anon-key'
);

// If this works, installation is successful
console.log(supabase); // Should show client object
```

## Troubleshooting

### "Cannot find module '@supabase/supabase-js'"
- Run: `npm install @supabase/supabase-js`
- Clear node_modules: `rm -rf node_modules && npm install`
- Restart dev server: `npm run dev`

### TypeScript errors about types
- Package includes types automatically
- If missing, TypeScript cache may be stale
- Try: `npm run build` to regenerate

### Version conflicts
- Check `package.json` for correct version
- Delete `package-lock.json` and reinstall: `npm install`

---

**After Installation**: Restart your dev server with `npm run dev`
