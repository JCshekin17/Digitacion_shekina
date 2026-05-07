import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ── Imágenes externas permitidas ────────────────────────────
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lirp.cdn-website.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },

  // ── Headers de seguridad HTTP ────────────────────────────────
  async headers() {
    return [
      {
        source: '/(.*)',
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
            value: 'DENY',
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
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },

  // ── Redireccionamiento canónico ──────────────────────────────
  async redirects() {
    return [
      {
        source: '/',
        destination: '/ventas',
        permanent: false,
      },
    ]
  },
};

export default nextConfig;
