/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        'orbitron': ['Orbitron', 'monospace'],
        'rajdhani': ['Rajdhani', 'sans-serif'],
      },
      colors: {
        electric: '#00D4FF',
        neon: '#06FFA5',
        cyber: '#8B5CF6',
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'slide-up': 'slideUp 0.8s ease-out',
        'fade-in-out': 'fadeInOut 3s ease-in-out',
      },
      keyframes: {
        glow: {
          '0%': { 
            boxShadow: '0 0 20px rgba(0, 212, 255, 0.5)',
          },
          '100%': { 
            boxShadow: '0 0 30px rgba(0, 212, 255, 0.8)',
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        slideUp: {
          '0%': { 
            opacity: '0',
            transform: 'translateY(30px)',
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        fadeInOut: {
          '0%': { 
            opacity: '0',
          },
          '10%': { 
            opacity: '1',
          },
          '90%': { 
            opacity: '1',
          },
          '100%': { 
            opacity: '0',
          },
        },
      },
    },
  },
  plugins: [],
};