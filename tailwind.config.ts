// import aspectRatio from '@tailwindcss/aspect-ratio'
import { type Config } from 'tailwindcss'

export default {
  plugins: [
    // aspectRatio
  ],
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'selector',
  theme: {
    extend: {
      fontFamily: {
        // sans: ['var(--font-readex-pro)'],
      },
    },
  },
} satisfies Config
