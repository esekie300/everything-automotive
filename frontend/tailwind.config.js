/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#5c95e6',
        'primary-dark': '#4a7bc9',
        dark: '#121212',
        light: '#ffffff',
        gray: '#f5f5f5',
        'nav-bg': '#e0e0e0',
        'footer-bg': '#2a2a2a',
      },
      // <<< ADD CUSTOM WIDTHS >>>
      width: {
        'calc-100-32': 'calc(100% - 32px)',
      },
      maxWidth: {
        'calc-100-32': 'calc(100% - 32px)',
        'md': '28rem', // Ensure md max-width is defined here if not default
      },
      height: {
        '80vh': '80vh',
        '600px': '600px',
      },
      maxHeight: {
        '80vh': '80vh',
        '600px': '600px',
      },
      // <<< END ADD CUSTOM WIDTHS >>>
      animation: {
        floating: 'floating 15s linear infinite',
        fadeInUp: 'fadeInUp 1s forwards',
      },
      keyframes: {
        floating: {
          '0%': { transform: 'translateX(-100px) translateY(0) rotate(0deg)', opacity: '0' },
          '10%': { opacity: '0.9' },
          '90%': { opacity: '0.9' },
          '100%': { transform: 'translateX(calc(100vw + 100px)) translateY(-20px) rotate(5deg)', opacity: '0' },
        },
        fadeInUp: {
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}