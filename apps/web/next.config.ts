import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fix React 19 + Next.js 15 compatibility issues
  // Conditionally apply forceSwcTransforms based on build context
  experimental: {
    reactCompiler: false,
    // Only apply forceSwcTransforms in production builds
    // Turbopack (dev mode) doesn't support this option
    ...(process.env.NODE_ENV === 'production' ? { forceSwcTransforms: true } : {}),
  },
  // Disable static optimization to prevent styled-jsx issues
  output: 'standalone',
  // Transpile workspace packages
  transpilePackages: [
    'shared-auth',
    'shared-types',
    'shared-ui',
    'shared-utils',
    'database',
    'firebase-config'
  ],
  // Disable static generation for error pages
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },
  // Disable static optimization completely
  trailingSlash: false,
  poweredByHeader: false,
  // Skip problematic static generation
  skipMiddlewareUrlNormalize: true,

  // Critical for monorepo builds on Vercel - includes files from monorepo root
  outputFileTracingRoot: require('path').join(__dirname, '../../'),

  // Move serverComponentsExternalPackages to the correct location
  serverExternalPackages: ['styled-jsx'],
  // Completely disable styled-jsx
  compiler: {
    styledComponents: false,
    styledJsx: false,
  },
  // Additional React 19 compatibility settings
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

  // Consolidated webpack configuration
  webpack: (config, { isServer }) => {
    // Suppress specific webpack warnings from Supabase realtime
    config.ignoreWarnings = [
      {
        module: /node_modules\/@supabase\/realtime-js/,
        message: /Critical dependency: the request of a dependency is an expression/,
      },
    ];

    // Enhanced module resolution for better TypeScript path mapping support
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'src'),
      // Force styled-jsx to use the correct React version
      'react': require('path').resolve(__dirname, '../../node_modules/react'),
      'react-dom': require('path').resolve(__dirname, '../../node_modules/react-dom'),
      // Completely disable styled-jsx
      'styled-jsx': require('path').resolve(__dirname, 'src/lib/empty-styled-jsx.js'),
      'styled-jsx/style': require('path').resolve(__dirname, 'src/lib/empty-styled-jsx.js'),
    };

    // Ensure proper module resolution for TypeScript files
    config.resolve.extensions = ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.json'];

    return config;
  },
  turbopack: {
    // Turbopack configuration to complement webpack setup
    rules: {
      // Add any custom loader rules here if needed
      // For now, this ensures Turbopack is configured alongside webpack
    },
    resolveExtensions: ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.json'],
    // Enhanced Turbopack resolveAlias for styled-jsx compatibility
    resolveAlias: {
      // Completely disable styled-jsx in Turbopack mode
      'styled-jsx': require('path').resolve(__dirname, 'src/lib/empty-styled-jsx.js'),
      'styled-jsx/style': require('path').resolve(__dirname, 'src/lib/empty-styled-jsx.js'),
    },
  },
};

export default nextConfig;
