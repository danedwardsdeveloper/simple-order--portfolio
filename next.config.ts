/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    formats: ['image/webp'],
  },
  // async redirects() {
  //   return [
  //     {
  //       source: '/:path*',
  //       has: [
  //         {
  //           type: 'host', // Redirect from www.
  //           value: 'www.my-site.co.uk',
  //         },
  //       ],
  //       destination: 'https://my-site.co.uk/:path*',
  //       permanent: true,
  //     },
  //     {
  //       source: '/:path*',
  //       has: [
  //         {
  //           type: 'host', // Redirect from Fly.io
  //           value: 'my-site.fly.dev',
  //         },
  //       ],
  //       destination: 'https://my-site.co.uk/:path*',
  //       permanent: true,
  //     },
  //   ]
  // },
}

export default nextConfig
