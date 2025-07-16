/** @type {import('next').NextConfig} */
const nextConfig = {
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

module.exports = nextConfig;
