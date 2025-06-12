import MenuBar from '@/components/menubar'
import { getMetaDescription, websiteCopy } from '@/library/constants'
import { dynamicBaseURL, isProduction } from '@/library/environment/publicVariables'
import type { Metadata, Viewport } from 'next'
import '@/styles/globals.tailwind.css'
import DemoBadge from '@/components/DemoBadge'
import Footer from '@/components/footer'
import Providers from '@/components/providers'
import { ContentSplash, SiteSplash } from '@/components/splashes'
import { defaultImage } from '@/library/imagesCollection'
import Script from 'next/script'
import type { ReactNode } from 'react'

const metadataImageDetails = {
	url: defaultImage.absolute,
	height: 630,
	width: 1200,
	alt: websiteCopy.extras.selfContainedDescription,
}

export const metadata: Metadata = {
	metadataBase: new URL(dynamicBaseURL),
	title: {
		default: 'Simple Order | Wholesale order management website',
		template: '%s | Simple Order - Wholesale order management website',
	},
	description: getMetaDescription('GBP'),
	openGraph: {
		images: metadataImageDetails,
	},
	twitter: {
		images: metadataImageDetails,
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
			<body className="flex flex-col w-full text-base">
				<Providers>
					<SiteSplash />
					<MenuBar />

					{/* ToDo: find a way to change this so that the breadcrumbs and header for each page are displayed while data is loading */}
					<ContentSplash siteContent={children} />
					<Footer />
					<DemoBadge />
				</Providers>
				{isProduction && <Script src="https://scripts.simpleanalyticscdn.com/latest.js" strategy="lazyOnload" />}
			</body>
		</html>
	)
}
