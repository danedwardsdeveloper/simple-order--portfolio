import type { Config } from 'tailwindcss'
import { spacing, zIndex } from 'tailwindcss/defaultTheme'

export default {
	content: ['./src/**/*.{ts,tsx}'],
	darkMode: 'selector',
	theme: {
		extend: {
			margin: {
				'menubar-offset': spacing[14],
			},
			zIndex: {
				'diagonal-graphic': zIndex[10],
				'notifications-container': zIndex[20],
				'notification-item': zIndex[30],
				'mobile-blurred-backdrop': zIndex[30],
				menu: zIndex[40],
				'splash-screen': zIndex[50],
			},
		},
	},
} satisfies Config
