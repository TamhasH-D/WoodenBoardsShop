/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-primary': '#5D4037', // Deep Brown
        'brand-secondary': '#A1887F', // Light Brown
        'brand-accent': '#4CAF50', // Vibrant Green
        'brand-background': '#F5F5F5', // Light Gray
        'brand-text': '#212121', // Dark Gray
      },
      fontFamily: {
        sans: ['Open Sans', 'sans-serif'],
        heading: ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
}