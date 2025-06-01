/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // Enterprise color palette with semantic naming
      colors: {
        // Primary brand colors
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },

        // Brand colors (alias for primary)
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        
        // Secondary brand colors
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0', 
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        
        // Success semantic colors
        success: {
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
          950: '#052e16',
        },
        
        // Warning semantic colors
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        
        // Error semantic colors
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
        
        // Info semantic colors
        info: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        
        // Surface colors for glassmorphism
        surface: {
          glass: 'rgba(255, 255, 255, 0.1)',
          'glass-dark': 'rgba(0, 0, 0, 0.1)',
          backdrop: 'rgba(255, 255, 255, 0.8)',
          'backdrop-dark': 'rgba(0, 0, 0, 0.8)',
        },
      },
      
      // Typography scale
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'monospace'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
      
      // Spacing scale
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
      },
      
      // Premium shadows for depth and glassmorphism
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 30px -5px rgba(0, 0, 0, 0.05)',
        'large': '0 10px 50px -12px rgba(0, 0, 0, 0.15), 0 20px 40px -10px rgba(0, 0, 0, 0.1)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'glow': '0 0 20px rgba(59, 130, 246, 0.15), 0 0 40px rgba(59, 130, 246, 0.1)',
        'glow-success': '0 0 20px rgba(34, 197, 94, 0.15), 0 0 40px rgba(34, 197, 94, 0.1)',
        'glow-warning': '0 0 20px rgba(245, 158, 11, 0.15), 0 0 40px rgba(245, 158, 11, 0.1)',
        'glow-error': '0 0 20px rgba(239, 68, 68, 0.15), 0 0 40px rgba(239, 68, 68, 0.1)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'inner-medium': 'inset 0 4px 8px 0 rgba(0, 0, 0, 0.1)',
      },
      
      // Advanced animations for micro-interactions
      animation: {
        // Fade animations
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-in-fast': 'fadeIn 0.3s ease-in-out',
        'fade-in-slow': 'fadeIn 0.8s ease-in-out',
        'fade-in-up': 'fadeInUp 0.5s ease-out',
        'fade-in-down': 'fadeInDown 0.5s ease-out',
        'fade-in-left': 'fadeInLeft 0.5s ease-out',
        'fade-in-right': 'fadeInRight 0.5s ease-out',
        
        // Slide animations
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'slide-in-up': 'slideInUp 0.3s ease-out',
        'slide-in-down': 'slideInDown 0.3s ease-out',
        
        // Scale animations
        'scale-in': 'scaleIn 0.2s ease-out',
        'scale-in-fast': 'scaleIn 0.15s ease-out',
        'scale-up': 'scaleUp 0.2s ease-out',
        
        // Bounce and elastic
        'bounce-gentle': 'bounceGentle 2s infinite',
        'bounce-in': 'bounceIn 0.6s ease-out',
        'elastic': 'elastic 0.6s ease-out',
        
        // Pulse and glow
        'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        
        // Float and hover effects
        'float': 'float 3s ease-in-out infinite',
        'float-slow': 'float 6s ease-in-out infinite',
        'hover-lift': 'hoverLift 0.3s ease-out',
        
        // Loading and shimmer
        'shimmer': 'shimmer 2s linear infinite',
        'skeleton': 'skeleton 1.5s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        
        // Notification animations
        'toast-enter': 'toastEnter 0.3s ease-out',
        'toast-exit': 'toastExit 0.2s ease-in',
        
        // Modal animations
        'modal-enter': 'modalEnter 0.3s ease-out',
        'modal-exit': 'modalExit 0.2s ease-in',
        'backdrop-enter': 'backdropEnter 0.3s ease-out',
        'backdrop-exit': 'backdropExit 0.2s ease-in',
      },

      // Custom keyframes for animations
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        fadeInRight: {
          '0%': { opacity: '0', transform: 'translateX(10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        scaleUp: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.05)' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(-5%)' },
          '50%': { transform: 'translateY(0)' },
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        elastic: {
          '0%': { transform: 'scale(0)' },
          '50%': { transform: 'scale(1.1)' },
          '75%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.15)' },
          '50%': { boxShadow: '0 0 40px rgba(59, 130, 246, 0.3)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        hoverLift: {
          '0%': { transform: 'translateY(0px)' },
          '100%': { transform: 'translateY(-2px)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        skeleton: {
          '0%': { backgroundColor: 'rgba(165, 180, 252, 0.1)' },
          '50%': { backgroundColor: 'rgba(165, 180, 252, 0.2)' },
          '100%': { backgroundColor: 'rgba(165, 180, 252, 0.1)' },
        },
        toastEnter: {
          '0%': { opacity: '0', transform: 'translateX(100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        toastExit: {
          '0%': { opacity: '1', transform: 'translateX(0)' },
          '100%': { opacity: '0', transform: 'translateX(100%)' },
        },
        modalEnter: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        modalExit: {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(0.9)' },
        },
        backdropEnter: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        backdropExit: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
}
