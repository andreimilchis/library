/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand Colors - EcommSuite.AI
        brand: {
          red: '#FF3131',
          orange: '#FF914D',
          // Gradient: from-brand-red to-brand-orange
        },
        // UI Colors
        primary: {
          50: '#FFF5F5',
          100: '#FFE5E5',
          200: '#FFCCCC',
          300: '#FF9999',
          400: '#FF6666',
          500: '#FF3131', // Main brand red
          600: '#E62B2B',
          700: '#CC2626',
          800: '#B32121',
          900: '#991C1C',
        },
        secondary: {
          50: '#FFF8F3',
          100: '#FFEFE3',
          200: '#FFDFC7',
          300: '#FFC99A',
          400: '#FFAD6D',
          500: '#FF914D', // Main brand orange
          600: '#E67F3D',
          700: '#CC6E2E',
          800: '#B35D1F',
          900: '#994C10',
        },
        // Neutral colors
        dark: {
          50: '#F5F5F7',
          100: '#E5E5EA',
          200: '#D1D1D6',
          300: '#AEAEB2',
          400: '#8E8E93',
          500: '#636366',
          600: '#48484A',
          700: '#363639',
          800: '#1C1C1E',
          900: '#0D0D0F',
        },
        // Success, Warning, Error
        success: {
          light: '#D1FAE5',
          DEFAULT: '#10B981',
          dark: '#047857',
        },
        warning: {
          light: '#FEF3C7',
          DEFAULT: '#F59E0B',
          dark: '#B45309',
        },
        error: {
          light: '#FEE2E2',
          DEFAULT: '#EF4444',
          dark: '#B91C1C',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Space Grotesk', 'monospace'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #FF3131 0%, #FF914D 100%)',
        'brand-gradient-hover': 'linear-gradient(135deg, #E62B2B 0%, #E67F3D 100%)',
        'brand-gradient-soft': 'linear-gradient(135deg, rgba(255,49,49,0.1) 0%, rgba(255,145,77,0.1) 100%)',
      },
      boxShadow: {
        'brand': '0 4px 14px 0 rgba(255, 49, 49, 0.25)',
        'brand-lg': '0 10px 40px 0 rgba(255, 49, 49, 0.3)',
        'card': '0 2px 8px 0 rgba(0, 0, 0, 0.08)',
        'card-hover': '0 8px 24px 0 rgba(0, 0, 0, 0.12)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
