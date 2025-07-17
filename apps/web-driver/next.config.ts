import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
  },
  transpilePackages: [
    'database',
    'firebase-config',
    'shared-types',
    'shared-ui',
    'shared-utils'
  ],
  experimental: {
    // Enable experimental features for better monorepo support
    externalDir: true,
  },
};

export default nextConfig;
