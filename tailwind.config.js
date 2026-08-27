/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        base: {
          950: '#0a0a0d',
          900: '#0f0f13',
          850: '#15151b',
          800: '#1b1b22',
          700: '#26262f',
          600: '#34343f',
          500: '#4a4a58',
        },
        ink: {
          100: '#f4f3f1',
          300: '#c9c7c2',
          500: '#8f8d88',
        },
        gold: {
          200: '#f0dcae',
          300: '#e6c98a',
          400: '#dab766',
          500: '#caa14e',
          600: '#a9813a',
          700: '#7c5f2b',
        },
        state: {
          success: '#4caf7d',
          warning: '#e0a13c',
          danger: '#d3564a',
          info: '#5b9bd5',
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        panel: '0 1px 0 0 rgba(255,255,255,0.03) inset, 0 20px 40px -20px rgba(0,0,0,0.6)',
        card: '0 1px 0 0 rgba(255,255,255,0.03) inset, 0 12px 24px -16px rgba(0,0,0,0.5)',
      },
      borderRadius: {
        xl: '14px',
        '2xl': '20px',
      },
    },
  },
  plugins: [],
};
