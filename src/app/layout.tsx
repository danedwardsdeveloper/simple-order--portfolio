import type { Metadata, Viewport } from 'next'

import { websiteCopy } from '@/library/constants/websiteCopy'
import { productionBaseURL } from '@/library/environment/publicVariables'

import Providers from '@/components/Providers'
import MenuBar from '@/components/menubar'
import NotificationsContainer from '@/components/notifications/NotificationContainer'

import './globals.tailwind.css'

export const metadata: Metadata = {
	title: websiteCopy.metadata.titles.home41,
	description: websiteCopy.metadata.descriptions.home138,
	alternates: {
		canonical: productionBaseURL,
	},
}

export const viewport: Viewport = {
	initialScale: 1,
	width: 'device-width',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en-GB" suppressHydrationWarning>
			<body>
				<Providers>
					<MenuBar />
					{children}
					<NotificationsContainer />
				</Providers>
			</body>
		</html>
	)
}
