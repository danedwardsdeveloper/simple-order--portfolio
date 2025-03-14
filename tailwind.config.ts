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
				'diagonal-graphic': zIndex[0],
				'notifications-container': zIndex[10],
				'notification-item': zIndex[20],
				'mobile-blurred-backdrop': zIndex[20],
				menu: zIndex[30],
				modal: zIndex[40],
				'splash-screen': zIndex[50],
			},
		},
	},
} satisfies Config
