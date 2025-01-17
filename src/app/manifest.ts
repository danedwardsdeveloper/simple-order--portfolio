import { MetadataRoute } from 'next'

import { siteDetails } from '@/library/misc/copy'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteDetails.siteNameWithTag,
    short_name: siteDetails.siteName,
    description: siteDetails.metaDescription138,
    start_url: '/',
    display: 'browser',
    background_color: 'hsl(0, 0%, 100%)',
    theme_color: 'hsl(217, 91%, 60%)', // blue-500
    icons: [
      {
        src: '/favicon/favicon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/favicon/favicon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    orientation: 'portrait',
    scope: '/',
  }
}
