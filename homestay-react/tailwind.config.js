/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0d6b3f',  // Your brand green
          light: '#10b981',
          dark: '#065f34',
        }
      }
    },
  },
  plugins: [],
}