/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./JS/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3E54AC',
        secondary: '#655DBB',
        accent: '#BFACE2',
        background: '#ECF2FF',
      },
    },
  },
  plugins: [],
} 