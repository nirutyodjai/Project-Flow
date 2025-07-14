import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  // Removing output: 'export' to enable server-side rendering
  // Keeping default .next directory for build output
  // distDir: 'out', 
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
  basePath: '',
  assetPrefix: '',
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
    ],
  },
};

export default nextConfig;
