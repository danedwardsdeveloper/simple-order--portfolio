import { type Config } from 'tailwindcss'
import { spacing, zIndex } from 'tailwindcss/defaultTheme'

export default {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'selector',
  theme: {
    extend: {
      margin: {
        'menubar-offset': spacing[20],
      },
      zIndex: {
        menubar: zIndex[10],
        'notification-container': zIndex[20],
        notification: zIndex[30],
      },
    },
  },
} satisfies Config
