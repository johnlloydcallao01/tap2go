import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  experimental: {
    reactCompiler: false,
    ...(process.env.NODE_ENV === 'production' ? { forceSwcTransforms: true } : {}),
    // Enable experimental features for better module resolution
    esmExternals: true,
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
  webpack: (config, { isServer }) => {
    // Enhanced webpack configuration for Vercel compatibility
    const srcPath = path.resolve(__dirname, 'src');

    config.resolve.alias = {
      ...config.resolve.alias,
      '@': srcPath,
      '@/lib': path.join(srcPath, 'lib'),
      '@/components': path.join(srcPath, 'components'),
      '@/contexts': path.join(srcPath, 'contexts'),
      '@/types': path.join(srcPath, 'types'),
      '@/app': path.join(srcPath, 'app'),
      '@/hooks': path.join(srcPath, 'hooks'),
      '@/utils': path.join(srcPath, 'utils'),
    };

    // Ensure proper file extensions are resolved
    config.resolve.extensions = ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.json'];

    // Vercel-specific optimizations
    if (process.env.VERCEL) {
      config.resolve.symlinks = false;
      config.resolve.modules = [
        path.resolve(__dirname, 'node_modules'),
        path.resolve(__dirname, '../../node_modules'),
        'node_modules'
      ];
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
