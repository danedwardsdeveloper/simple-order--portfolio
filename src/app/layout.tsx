import Providers from '@/components/Providers';
import MenuBar from '@/components/menubar';
import NotificationsContainer from '@/components/notifications/NotificationContainer';
import { websiteCopy } from '@/library/constants/websiteCopy';
import { productionBaseURL } from '@/library/environment/publicVariables';
import type { Metadata, Viewport } from 'next';
import './globals.tailwind.css';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
	title: websiteCopy.metadata.titles.home41,
	description: websiteCopy.metadata.descriptions.home138,
	alternates: {
		canonical: productionBaseURL,
	},
};

export const viewport: Viewport = {
	initialScale: 1,
	width: 'device-width',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: ReactNode;
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
	);
}
