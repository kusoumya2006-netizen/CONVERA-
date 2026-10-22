/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          dark: '#0f172a',      // Slate 900
          sidebar: '#1e293b',   // Slate 800
          surface: '#ffffff',
          bg: '#f8fafc',        // Slate 50
          border: '#e2e8f0',     // Slate 200
          textPrimary: '#0f172a',
          textMuted: '#64748b',
          olive: {
            DEFAULT: '#365314', // Olive green 900
            light: '#4d7c0f',   // Olive green 700
            soft: '#f7fee7'     // Olive green 50
          },
          saffron: '#d97706',   // Restrained amber 600
          navy: '#1e3a8a',      // Navy 900
          alert: '#b91c1c'      // Deep red 700
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif']
      }
    },
  },
  plugins: [],
}
