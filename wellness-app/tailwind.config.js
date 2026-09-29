/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        google: {
          blue: '#1a73e8',
          blueHover: '#1557b0',
          blueBg: '#e8f0fe',
          red: '#d93025',
          yellow: '#f9ab00',
          green: '#1e8e3e',
          greenBg: '#e6f4ea',
          grayBg: '#f8f9fa',
          surface: '#ffffff',
          border: '#dadce0',
          textPrimary: '#202124',
          textSecondary: '#5f6368',
        }
      },
      fontFamily: {
        sans: ['"Google Sans"', 'Roboto', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Arial', 'sans-serif']
      }
    },
  },
  plugins: [],
}
