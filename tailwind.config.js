/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // CONVERA Official Design System Tokens
        convera: {
          bg: '#08090B',
          sidebar: '#0B0D10',
          header: '#0B0D10',
          card: '#111419',
          elevated: '#161A20',
          elevatedHover: '#1C2129',
          border: '#272D35',
          borderSubtle: '#1C2229',
          textPrimary: '#E8EAED',
          textSecondary: '#A0A7B2',
          textMuted: '#737D8B',
          accent: '#A3B86C',
          accentHover: '#B7CA82',
          critical: '#F16D75',
          warning: '#E8B75C',
          success: '#69C9A0',
          info: '#86A9FF',
        },
        obsidian: {
          950: '#08090B',      // Main application canvas
          900: '#0B0D10',      // Sidebar and Header background
          850: '#111419',      // Main card background
          800: '#161A20',      // Elevated card background
          750: '#1C2129',      // Elevated hover surface
          700: '#272D35',      // Standard graphite borders
        },
        silver: {
          50: '#FFFFFF',
          100: '#E8EAED',      // Primary text
          200: '#D1D5DB',
          300: '#A0A7B2',      // Secondary text
          400: '#737D8B',      // Muted text
          500: '#525B69',
          border: '#272D35',
          'border-bright': '#38414D',
        },
        gov: {
          dark: '#08090B',
          sidebar: '#0B0D10',
          surface: '#111419',
          bg: '#08090B',
          border: '#272D35',
          textPrimary: '#E8EAED',
          textMuted: '#A0A7B2',
          olive: {
            DEFAULT: '#A3B86C', // Primary accent
            light: '#B7CA82',   // Accent hover
            soft: '#162214',    // Restrained olive dark tint
          },
          saffron: '#E8B75C',   // Warning amber
          navy: '#86A9FF',      // Information blue
          alert: '#F16D75',     // Critical alert red
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace']
      }
    },
  },
  plugins: [],
}
