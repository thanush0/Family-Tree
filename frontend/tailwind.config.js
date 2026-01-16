/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#0a0e27',
        'dark-card': '#1a1f3a',
        'male': '#3b82f6',
        'female': '#ec4899',
        'other': '#a855f7',
      }
    },
  },
  plugins: [],
}
