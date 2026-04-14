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
          DEFAULT: '#E87722',
          dark: '#D16A1E',
          light: '#F59042',
        },
        brown: {
          DEFAULT: '#5C3317',
          dark: '#3D210F',
          light: '#7A4A2A',
        },
        cream: {
          DEFAULT: '#FDF6ED',
          dark: '#F5E6D3',
          light: '#FFFBF7',
        },
        gold: '#FFB800',
        beige: '#FEF3E2',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Inter', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
