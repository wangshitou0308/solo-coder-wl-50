/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
        },
        secondary: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
        },
      },
      fontFamily: {
        sans: ['Noto Sans SC', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'pulse-border': 'pulse-border 2s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
        'stagger-1': 'fade-in-up 0.5s ease-out 0.1s forwards',
        'stagger-2': 'fade-in-up 0.5s ease-out 0.2s forwards',
        'stagger-3': 'fade-in-up 0.5s ease-out 0.3s forwards',
        'stagger-4': 'fade-in-up 0.5s ease-out 0.4s forwards',
        'count-up': 'count-up 1s ease-out forwards',
      },
      keyframes: {
        'pulse-border': {
          '0%, 100%': { borderColor: 'rgba(245, 158, 11, 0.3)' },
          '50%': { borderColor: 'rgba(245, 158, 11, 1)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'count-up': {
          '0%': { opacity: '0', transform: 'scale(0.5)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
