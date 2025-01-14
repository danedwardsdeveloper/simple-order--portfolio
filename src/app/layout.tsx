import type { Metadata, Viewport } from 'next'

import { productionBaseURL } from '@/library/environment/publicVariables'

import './styles.tailwind.css'

export const metadata: Metadata = {
  title: `My Site`,
  description: `Site description`,
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
      <body>{children}</body>
    </html>
  )
}
