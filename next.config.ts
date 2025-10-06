// next.config.js
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Konfigurasi PWA dengan caching runtime
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,       // otomatis registrasi service worker
  skipWaiting: true,     // aktifkan SW baru langsung
  disable: process.env.NODE_ENV === 'development', // nonaktifkan PWA saat dev
  runtimeCaching: [
    {
      // Cache semua static assets (JS, CSS, gambar, font)
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
      // Cache API calls tapi utamakan jaringan (network first)
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
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Mode output untuk standalone deployment
  output: 'standalone',
  trailingSlash: true,

  // Abaikan error ESLint/TypeScript saat build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Optimasi gambar
  images: {
    unoptimized: true,
    domains: [], // tambahkan domain eksternal jika diperlukan
  },

  // Variabel environment
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Redirect opsional (misal query ?page=home → /home)
  async redirects() {
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

  // Rewrites API backend
  async rewrites() {
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_API_URL) {
      return [
        {
          source: '/api/:path*',
          destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`,
        },
      ];
    }
    return [];
  },
};

// Export konfigurasi final dengan PWA
export default withPWA(nextConfig);
