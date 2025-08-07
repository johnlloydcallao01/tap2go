import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Standalone output for better deployment (outputs to .next/standalone)
  output: 'standalone',
  transpilePackages: [
    '@tap2go/database',
    '@tap2go/firebase-config',
    '@tap2go/shared-types',
    '@tap2go/shared-auth',
    '@tap2go/shared-ui',
    '@tap2go/shared-utils'
  ],
  experimental: {
    // Enable experimental features for better monorepo support
    externalDir: true,
  },
  // Critical for monorepo builds on Vercel - includes files from monorepo root
  // This should only affect .next/standalone, not create source directories
  outputFileTracingRoot: path.join(__dirname, '../../'),
};

export default nextConfig;
