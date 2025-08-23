/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Ancient manuscript inspired palette
        'deep-blue': {
          50: '#f0f4ff',
          100: '#dbe4ff',
          200: '#bfcfff',
          300: '#9bb0ff',
          400: '#758bff',
          500: '#5b6eff',
          600: '#4c51f5',
          700: '#3f3fe1',
          800: '#3638b7',
          900: '#2d3282',
          950: '#1e1f4f',
        },
        'ancient-gold': {
          50: '#fffceb',
          100: '#fff6c7',
          200: '#ffec8a',
          300: '#ffdd4d',
          400: '#ffcc26',
          500: '#f9b50c',
          600: '#dd8b07',
          700: '#b7620a',
          800: '#954c0e',
          900: '#7a3e0f',
          950: '#472004',
        },
        'mystical-purple': {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21a8',
          900: '#581c87',
          950: '#3b0764',
        },
      },
      fontFamily: {
        'serif': ['Crimson Text', 'Georgia', 'Times New Roman', 'serif'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'greek': ['GFS Didot', 'Crimson Text', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glow: {
          '0%': { textShadow: '0 0 5px rgba(168, 85, 247, 0.5)' },
          '100%': { textShadow: '0 0 20px rgba(168, 85, 247, 0.8)' },
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
  plugins: [],
}
