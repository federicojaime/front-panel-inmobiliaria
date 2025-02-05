// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        karttem: {
          gold: '#FFD700',  // Color dorado del logo
          black: '#000000', // Color negro del fondo del logo
        }
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}