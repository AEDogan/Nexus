/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        surface: 'rgba(25, 25, 25, 0.5)',
        'surface-border': 'rgba(255, 255, 255, 0.1)',
        primary: '#3b82f6',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
