# GGHub

This is a Next.js project for GGHub, a gaming accessories shopping website with user profiles, personalized carts, quest-driven games, and a live leaderboard.

## Features

- User registration and login with unique profiles
- Profile updates (name, password, bio)
- Personalized shopping carts per user
- 3D action-adventure games with quests and goals
- Game logging and live leaderboard
- Product browsing and purchasing
- Contact form for customer inquiries
- Responsive design with gaming theme

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3004](http://localhost:3004) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Database Setup

This project uses Supabase as the backend. Follow these steps to set up the database:

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → API and copy your Project URL and anon public key
4. Create a `.env.local` file in the project root with:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```
5. Run the SQL schema in `supabase-schema.sql` in your Supabase SQL Editor

## Deployment

### Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Add your environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

### Deploy on Other Platforms

For other hosting platforms, make sure to:
- Set the environment variables
- Run `npm run build` to create a production build
- Serve the `.next` folder contents

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx          # Landing page
│   ├── account/          # User account pages
│   ├── admin/            # Admin dashboard
│   ├── contact/          # Contact form page
│   └── register/         # Registration page
├── components/           # Reusable components
│   ├── Header.tsx       # Navigation header
│   ├── Footer.tsx       # Site footer
│   ├── ProductCard.tsx  # Product display card
│   ├── GameChallenges.tsx # Gaming components
│   └── CartPanel.tsx    # Shopping cart
├── contexts/            # React contexts
│   ├── UserContext.tsx  # User authentication & data
│   ├── ProductContext.tsx # Product management
│   ├── CartContext.tsx  # Shopping cart
│   └── AuthContext.tsx  # Admin authentication
├── lib/                 # Utility libraries
├── types/              # TypeScript type definitions
└── utils/              # Helper functions
```

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Styling**: Tailwind CSS with custom gaming theme
- **State Management**: React Context API
- **Deployment**: Vercel (recommended)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.