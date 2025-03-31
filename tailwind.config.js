/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // This enables the class-based dark mode
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // We'll use CSS variables for these colors now
      },
      boxShadow: {
        // We'll use CSS variables for shadows too
      }
    },
  },
  safelist: [
    'hover:text-text'
  ],
  plugins: [],
} 