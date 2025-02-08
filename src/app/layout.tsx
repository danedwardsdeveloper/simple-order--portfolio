import type { Metadata, Viewport } from 'next'

import { productionBaseURL } from '@/library/environment/publicVariables'
import { websiteCopy } from '@/library/websiteCopy'

import MenuBar from '@/components/menubar'
import NotificationsContainer from '@/components/notifications/NotificationContainer'
import Providers from '@/components/Providers'

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
          <div className="max-w-4xl w-full mx-auto mt-menubar-offset px-4 lg:px-0 pt-8 pb-60">{children}</div>
          <NotificationsContainer />
        </Providers>
      </body>
    </html>
  )
}
