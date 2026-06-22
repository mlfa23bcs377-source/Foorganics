/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        organic: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        earth: {
          50: '#fdfaf7',
          100: '#f7f3ee',
          200: '#ede7da',
          300: '#dfd8c8',
          400: '#d4c4b0',
          500: '#c8b39b',
          600: '#a68d68',
          700: '#856d44',
          800: '#6b5637',
          900: '#5a4731',
        }
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
