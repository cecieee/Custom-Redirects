import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Custom Redirects',
    short_name: 'Redirects',
    description: 'Manage your custom domain redirects',
    start_url: '/',
    display: 'standalone',
    background_color: '#f0fbff',
    theme_color: '#009eb5',
    icons: [
      {
        src: '/SB-logo30-.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/SB-logo30-.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      }
    ],
  }
}
