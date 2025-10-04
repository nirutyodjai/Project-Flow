import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  // ปิด output: 'export' เพื่อให้ API routes ทำงานได้
  // output: 'export', // ปิดไว้ก่อน เพื่อให้ API ทำงาน
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
    unoptimized: true,
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
