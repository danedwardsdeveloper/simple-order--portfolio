import MenuBar from '@/components/menubar'
import { websiteCopy } from '@/library/constants'
import { dynamicBaseURL } from '@/library/environment/publicVariables'
import type { Metadata, Viewport } from 'next'
import './globals.tailwind.css'
import Providers from '@/components/Providers'
import SplashScreen from '@/components/SplashScreen'
import Footer from '@/components/footer'
import Script from 'next/script'
import type { ReactNode } from 'react'

const socialImagePath = '/images/simple-order-wholesale-order-management-software-website.png'

export const metadata: Metadata = {
	metadataBase: new URL(dynamicBaseURL),
	title: {
		default: 'Simple Order | Wholesale order management website',
		template: '%s | Simple Order - Wholesale order management website',
	},
	description: websiteCopy.metadata.descriptions.home138,
	openGraph: {
		images: {
			url: socialImagePath,
			height: 630,
			width: 1200,
			alt: websiteCopy.extras.selfContainedDescription,
		},
	},
	twitter: {
		images: {
			url: socialImagePath,
			height: 630,
			width: 1200,
			alt: websiteCopy.extras.selfContainedDescription,
		},
	},
	alternates: {
		canonical: dynamicBaseURL,
	},
	robots: { index: true, follow: true },
}

export const viewport: Viewport = {
	initialScale: 1,
	width: 'device-width',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: ReactNode
}>) {
	return (
		<html lang="en-GB" suppressHydrationWarning>
			<body className="flex flex-col w-full">
				<Providers>
					<SplashScreen />
					<MenuBar />
					{children}
					<Footer />
				</Providers>
				<Script src="https://scripts.simpleanalyticscdn.com/latest.js" strategy="lazyOnload" />
			</body>
		</html>
	)
}
