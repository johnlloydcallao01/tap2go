import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    '@tap2go/database',
    '@tap2go/shared-types',
    '@tap2go/shared-ui'
  ],
  experimental: {
    externalDir: true,
  },
};

export default nextConfig;
