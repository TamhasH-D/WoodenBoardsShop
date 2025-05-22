/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'wood-dark': '#5D4037',     // Темно-коричневый
        'wood-medium': '#8D6E63',   // Средне-коричневый
        'wood-light': '#D7CCC8',    // Светло-коричневый
        'wood-accent': '#4CAF50',   // Зеленый акцент
        'wood-accent-light': '#81C784', // Светло-зеленый
        'wood-gray': '#ECEFF1',     // Светло-серый фон
        'wood-text': '#263238',     // Темно-серый текст
      },
      fontFamily: {
        'sans': ['Inter', 'ui-sans-serif', 'system-ui'],
        'heading': ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      spacing: {
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },
      height: {
        'screen-90': '90vh',
      },
      maxWidth: {
        '8xl': '90rem',
      },
      zIndex: {
        '60': '60',
        '70': '70',
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
    },
  },
  plugins: [],
}