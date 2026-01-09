import type {NextConfig} from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Fix deprecation: usare remotePatterns invece di domains
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'romanoing.com',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
      // CSRF Protection automatica per Server Actions (abilitata di default)
      allowedOrigins: [
        'localhost:3000',
        'romanoing.com',
        'https://romanoing.com',
        process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      ],
    },
  },
  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
        ],
      },
    ]
  },
}

export default nextConfig
