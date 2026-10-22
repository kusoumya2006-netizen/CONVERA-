/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#080C14',      // Deepest obsidian base canvas
          900: '#0F172A',      // Primary charcoal background
          850: '#141E33',      // Card and section surface
          800: '#1E293B',      // Elevated charcoal surface
          750: '#26354D',      // Surface hover / active highlight
          700: '#334155',      // Silver-graphite borders
        },
        silver: {
          50: '#F8FAFC',       // Cool white primary typography
          100: '#F1F5F9',      // Off-white / platinum text
          200: '#E2E8F0',      // Brushed silver accents
          300: '#CBD5E1',      // Secondary silver text
          400: '#94A3B8',      // Muted silver-grey labels
          500: '#64748B',      // Tertiary captions
          border: 'rgba(226, 232, 240, 0.12)', // Subtle brushed silver border
          'border-bright': 'rgba(226, 232, 240, 0.24)',
        },
        gov: {
          dark: '#080C14',      // Obsidian base
          sidebar: '#0D1424',   // Deep graphite sidebar
          surface: '#141E33',   // Charcoal card surface
          bg: '#080C14',        // Obsidian canvas
          border: '#26354D',    // Subtle silver-slate border
          textPrimary: '#F8FAFC',
          textMuted: '#94A3B8',
          olive: {
            DEFAULT: '#365314', // Restrained olive green 900
            light: '#4d7c0f',   // Olive green 700
            soft: '#1A2E05'     // Deep dark olive tint
          },
          saffron: '#d97706',   // Restrained amber 600
          navy: '#1e3a8a',      // Navy 900
          alert: '#b91c1c'      // Deep red 700
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
