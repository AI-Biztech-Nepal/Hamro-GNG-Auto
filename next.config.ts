
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
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
