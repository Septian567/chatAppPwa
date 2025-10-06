// next.config.js
import { createRequire } from 'module';
const require = createRequire( import.meta.url );
const withPWA = require( 'next-pwa' )( {
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      // Cache semua static assets (CSS, JS, gambar)
      urlPattern: /^https?.*\.(js|css|png|jpg|jpeg|svg|gif|woff2?)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-assets',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 hari
        },
      },
    },
    {
      // Cache API calls tapi tetap utamakan jaringan (untuk chat real-time)
      urlPattern: /^https:\/\/your-api\.com\/api\/.*$/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        networkTimeoutSeconds: 5,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 24 * 60 * 60, // 1 hari
        },
      },
    },
  ],
} );

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output mode untuk deployment
  output: 'standalone',
  trailingSlash: true,

  // Abaikan ESLint dan TypeScript error saat build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Optimasi gambar (untuk static export atau hosting di vercel/nginx)
  images: {
    unoptimized: true,
    domains: [], // tambahkan domain image eksternal jika ada
  },

  // Variabel lingkungan runtime
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Redirect opsional untuk behavior SPA
  async redirects()
  {
    return [
      {
        source: '/',
        has: [
          {
            type: 'query',
            key: 'page',
            value: 'home',
          },
        ],
        destination: '/home',
        permanent: false,
      },
    ];
  },

  // Rewrites untuk API backend
  async rewrites()
  {
    if ( process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_API_URL )
    {
      return [
        {
          source: '/api/:path*',
          destination: `${ process.env.NEXT_PUBLIC_API_URL }/api/:path*`,
        },
      ];
    }
    // Tidak rewrite apa pun kalau variabel tidak ada
    return [];
  },

};

// Export konfigurasi final dengan PWA
export default withPWA( nextConfig );
