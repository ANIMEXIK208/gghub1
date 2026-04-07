/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      animation: {
        fly: 'fly 3s ease-in-out infinite',
      },
      keyframes: {
        fly: {
          '0%, 100%': { transform: 'translateY(-4px) rotateX(10deg)' },
          '50%': { transform: 'translateY(4px) rotateX(-10deg)' },
        },
      },
    },
  },
  plugins: [],
}