import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.example.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Environment-based test route control
  async rewrites() {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const enableTestRoutes = process.env.ENABLE_TEST_ROUTES === 'true';

    if (isDevelopment && enableTestRoutes) {
      return [
        // Redirect old test routes to new organized structure
        {
          source: '/test-auth',
          destination: '/tests/pages/auth/test-auth',
        },
        {
          source: '/test-all-notifications',
          destination: '/tests/pages/notifications/test-all-notifications',
        },
        {
          source: '/test-customer',
          destination: '/tests/pages/business/test-customer',
        },
        {
          source: '/test-notifications',
          destination: '/tests/pages/notifications/test-notifications',
        },
        {
          source: '/test-restaurant',
          destination: '/tests/pages/business/test-restaurant',
        },
        {
          source: '/test-vendor',
          destination: '/tests/pages/business/test-vendor',
        },
        {
          source: '/test-webhook',
          destination: '/tests/pages/integrations/test-webhook',
        },
        {
          source: '/test-complete-flow',
          destination: '/tests/pages/business/test-complete-flow',
        },
        {
          source: '/test-admin',
          destination: '/tests/pages/utilities/test-admin',
        },
        {
          source: '/test-simple',
          destination: '/tests/pages/utilities/test-simple',
        },
        {
          source: '/test-chat',
          destination: '/tests/pages/integrations/test-chat',
        },
        {
          source: '/test-auth-flow',
          destination: '/tests/pages/auth/test-auth-flow',
        },
        {
          source: '/test-customers',
          destination: '/tests/pages/business/test-customers',
        },
      ];
    }

    return [];
  },
  async redirects() {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const enableTestRoutes = process.env.ENABLE_TEST_ROUTES === 'true';

    if (!isDevelopment || !enableTestRoutes) {
      // In production or when tests are disabled, redirect test routes to home
      return [
        {
          source: '/tests/:path*',
          destination: '/',
          permanent: false,
        },
        {
          source: '/test-:path*',
          destination: '/',
          permanent: false,
        },
      ];
    }

    return [];
  },
  eslint: {
    // Allow production builds to complete even with ESLint warnings
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Allow production builds to complete even with TypeScript errors
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    // Suppress specific webpack warnings from Supabase realtime
    config.ignoreWarnings = [
      {
        module: /node_modules\/@supabase\/realtime-js/,
        message: /Critical dependency: the request of a dependency is an expression/,
      },
    ];

    return config;
  },
  turbopack: {
    // Turbopack configuration to complement webpack setup
    rules: {
      // Add any custom loader rules here if needed
      // For now, this ensures Turbopack is configured alongside webpack
    },
    resolveExtensions: ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.json'],
  },
};

export default nextConfig;
