/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    // Ensure these classes are never purged
    'w-full', 'px-4', 'py-2', 'rounded-md', 'font-medium', 'transition-colors',
    'bg-blue-500', 'bg-blue-600', 'bg-green-500', 'bg-green-600',
    'text-white', 'hover:bg-blue-600', 'hover:bg-green-600',
    'min-h-screen', 'flex', 'flex-col', 'items-center', 'justify-center',
    'p-4', 'max-w-md', 'p-6', 'bg-white', 'rounded-lg', 'shadow-md',
    'text-3xl', 'font-bold', 'text-center', 'mb-6', 'space-y-6',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#10B981',
        background: '#F3F4F6',
        'player-x': '#3B82F6',
        'player-o': '#EF4444',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};