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
        romantic: {
          pink: '#ec4899',
          purple: '#a855f7',
          indigo: '#6366f1',
          soft: '#f472b6',
          dark: '#be185d',
        },
        pro: {
          black: '#1a1a1a',
          grey: '#404040',
          light: '#666666',
        },
        vip: {
          gold: '#ffd700',
          black: '#000000',
          dark: '#1a1a1a',
        },
      },
      backgroundImage: {
        'gradient-romantic': 'linear-gradient(135deg, #ec4899 0%, #a855f7 50%, #6366f1 100%)',
        'gradient-romantic-soft': 'linear-gradient(135deg, #f472b6 0%, #c084fc 50%, #818cf8 100%)',
        'gradient-romantic-dark': 'linear-gradient(135deg, #be185d 0%, #7c3aed 50%, #4f46e5 100%)',
        'gradient-pro': 'linear-gradient(135deg, #1a1a1a 0%, #404040 100%)',
        'vip-gradient': 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #ffd700 100%)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'heart-beat': 'heartBeat 1.5s ease-in-out infinite',
        'match-glow': 'matchGlow 2s ease-in-out infinite',
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        heartBeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
        },
        matchGlow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(236, 72, 153, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(236, 72, 153, 0.8)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'romantic': '0 10px 30px rgba(236, 72, 153, 0.3)',
        'romantic-soft': '0 5px 15px rgba(236, 72, 153, 0.2)',
        'vip': '0 0 20px rgba(255, 215, 0, 0.3)',
      },
    },
  },
  plugins: [],
};