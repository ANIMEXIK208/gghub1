# User Profile System

## Overview
GGHub now features a complete user profile system where authenticated users can:
- Have unique usernames automatically generated
- Customize their display name and bio
- Upload profile photos
- View and track their gaming stats
- See their scores on the live leaderboard

## Setup Requirements

### 1. Database Migration
Run the migration file `add-username-to-profiles.sql` to add the username column:

```sql
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS user_profiles_username_idx ON public.user_profiles(username);
```

### 2. Supabase Storage Setup
Create a `profiles` storage bucket for avatar uploads:

1. Go to Supabase Dashboard > Storage
2. Create a new bucket named `profiles`
3. Set the bucket to **Public** to allow avatar URLs to be accessible
4. Configure CORS if needed for image uploads

### 3. Environment Variables
Make sure these are set in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## User Profile Features

### Automatic Username Generation
When a user signs in with Google for the first time:
- A unique username is generated based on their full name
- If the name is taken, a number suffix is added (e.g., `john_smith_1`)
- Usernames are unique and cannot be changed by users (for security)

### Profile Customization
Users can edit:
- **Display Name**: Full name or nickname (required)
- **Bio**: Short description (optional)
- **Avatar**: Profile photo upload (supports JPG, PNG, GIF, WebP - max 5MB)

### Profile Display
The profile page shows:
- Avatar with upload capability
- Username (@username format)
- Display name
- Email
- Game points (earned from playing games)
- Total wins
- Member since date
- Gaming stats (games played, win rate, leaderboard rank)

### Authentication Flow
1. User clicks "Sign in" button in header
2. Authenticates with Google
3. Automatically redirected to `/account` profile page
4. Profile is created automatically with unique username
5. User can customize profile information

## File Structure

```
app/
├── account/page.tsx          # User profile page
├── auth/callback/page.tsx    # Auth redirect to profile

contexts/
├── AuthContext.tsx           # Auth logic with avatar upload

components/
├── Header.tsx                # Profile dropdown in header

migrations/
├── add-username-to-profiles.sql  # Username column migration
```

## Key Functions

### AuthContext Functions

**`generateUniqueUsername(baseName: string)`**
- Generates unique username from user's full name
- Returns: `string` - unique username

**`uploadAvatar(file: File)`**
- Uploads profile photo to Supabase Storage
- Returns: `string` - public URL of uploaded image
- Validates: file type (images only), size (max 5MB)

**`updateProfile(updates: Partial<UserProfile>)`**
- Updates user profile in database
- Supports: display_name, bio, avatar_url, game_points, total_wins

### UserProfile Interface
```typescript
interface UserProfile {
  id: string;                    // Supabase User ID
  email: string | null;
  display_name: string | null;
  username: string | null;       // NEW: Unique username
  avatar_url: string | null;
  bio: string | null;
  game_points: number;           // Total points from games
  total_wins: number;            // Total game wins
  created_at: string;
}
```

## Usage Example

### Accessing User Profile in Components
```tsx
import { useAuth } from '@/contexts/AuthContext';

export default function MyComponent() {
  const { userProfile, uploadAvatar, updateProfile } = useAuth();

  // Use userProfile data
  if (userProfile) {
    console.log(`@${userProfile.username}`);
    console.log(`Points: ${userProfile.game_points}`);
  }

  // Upload avatar
  const handleUpload = async (file: File) => {
    try {
      const url = await uploadAvatar(file);
      console.log('New avatar URL:', url);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  // Update profile
  const handleUpdate = async () => {
    await updateProfile({
      display_name: 'New Name',
      bio: 'My gaming bio'
    });
  };
}
```

## Security Notes

- Usernames are unique and immutable (cannot be changed)
- Row-level security policies ensure users can only access their own data
- Avatar uploads are validated (file type and size)
- Profile photos are stored in public bucket with secure URLs
- Email and sensitive data are protected by RLS policies

## Future Enhancements

- User profile visibility settings
- Social features (follow other players)
- Profile badges/achievements
- Custom bio formatting
- Avatar selection from templates
- Profile themes
