import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: false,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
