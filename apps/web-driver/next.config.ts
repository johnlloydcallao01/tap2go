import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  experimental: {
    reactCompiler: false,
    ...(process.env.NODE_ENV === 'production' ? { forceSwcTransforms: true } : {}),
  },
  output: 'standalone',
  trailingSlash: false,
  poweredByHeader: false,
  serverExternalPackages: ['styled-jsx', 'firebase-admin'],
  compiler: {
    styledComponents: false,
    styledJsx: false,
  },
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
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer, dev }) => {
    // Professional Vercel-compatible webpack configuration
    const srcPath = path.resolve(__dirname, 'src');

    // Enhanced alias resolution for Vercel builds
    config.resolve.alias = {
      ...config.resolve.alias,
      // Primary alias
      '@': srcPath,
      // Explicit sub-path aliases for better Vercel compatibility
      '@/lib': path.resolve(__dirname, 'src/lib'),
      '@/lib/firebase': path.resolve(__dirname, 'src/lib/firebase.ts'),
      '@/lib/firebase-admin': path.resolve(__dirname, 'src/lib/firebase-admin.ts'),
      '@/lib/database/users': path.resolve(__dirname, 'src/lib/database/users.ts'),
      '@/components': path.resolve(__dirname, 'src/components'),
      '@/contexts': path.resolve(__dirname, 'src/contexts'),
      '@/types': path.resolve(__dirname, 'src/types'),
      '@/app': path.resolve(__dirname, 'src/app'),
      '@/hooks': path.resolve(__dirname, 'src/hooks'),
      '@/utils': path.resolve(__dirname, 'src/utils'),
    };

    // Enhanced file extension resolution
    config.resolve.extensions = ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.json'];

    // Vercel-specific module resolution
    config.resolve.modules = [
      path.resolve(__dirname, 'src'),
      path.resolve(__dirname, 'node_modules'),
      path.resolve(__dirname, '../../node_modules'),
      'node_modules'
    ];

    // Disable symlinks for Vercel compatibility
    config.resolve.symlinks = false;

    // Ensure case-sensitive resolution for Vercel
    config.resolve.cacheWithContext = false;

    // Firebase-specific optimizations
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }

    return config;
  },
  turbopack: {
    // Turbopack configuration to complement webpack setup
    rules: {
      // Add any custom loader rules here if needed
    },
    resolveExtensions: ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.json'],
    resolveAlias: {
      '@': path.resolve(__dirname, 'src'),
      '@/lib': path.resolve(__dirname, 'src/lib'),
      '@/components': path.resolve(__dirname, 'src/components'),
      '@/contexts': path.resolve(__dirname, 'src/contexts'),
      '@/types': path.resolve(__dirname, 'src/types'),
      '@/app': path.resolve(__dirname, 'src/app'),
      '@/hooks': path.resolve(__dirname, 'src/hooks'),
      '@/utils': path.resolve(__dirname, 'src/utils'),
    },
  },
};

export default nextConfig;
