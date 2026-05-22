import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'sans-serif'],
        serif: ['var(--font-playfair)', 'serif'],
      },
      colors: {
        red: { DEFAULT: '#C0392B', dark: '#a93226' },
        gold: '#D4A017',
        navy: '#1A1A2E',
      },
    },
  },
  plugins: [],
}

export default config
