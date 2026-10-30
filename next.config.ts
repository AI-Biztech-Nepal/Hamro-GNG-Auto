
import type {NextConfig} from 'next';

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    // shortcut: no Content-Security-Policy yet (GA, maps, inline JSON-LD need a tested allow-list), add one after testing.
    return [{ source: '/:path*', headers: securityHeaders }];
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'scontent.fktm1-1.fna.fbcdn.net',
        port: '',
        pathname: '/**',
      },
      {
        // Vehicle photos served by the Auto-Stock-Manager backend (inventory source of truth)
        protocol: 'https',
        hostname: 'api.hamroauto.com.np',
        port: '',
        pathname: '/api/public/vehicles/**',
      },
      {
        // The same photos once moved to Supabase Storage: the backend then hands out these CDN links instead
        protocol: 'https',
        hostname: 'boiiqzkkbyzqkqsxuzyp.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/asm-photos/**',
      },
    ],
  },
};

export default nextConfig;
