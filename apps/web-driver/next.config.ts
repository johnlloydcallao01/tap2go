import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Standalone output for better deployment
  output: 'standalone',
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
  // Critical for monorepo builds on Vercel - includes files from monorepo root
  outputFileTracingRoot: path.join(__dirname, '../../'),

  // Additional webpack configuration for better module resolution
  webpack: (config, { isServer }) => {
    // Ensure proper module resolution for TypeScript paths
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };

    return config;
  },
};

export default nextConfig;
