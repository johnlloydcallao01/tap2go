const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    reactCompiler: false,
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
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Enhanced path resolution for Vercel compatibility
    const srcPath = path.resolve(__dirname, 'src');
    
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': srcPath,
      '@/lib': path.join(srcPath, 'lib'),
      '@/lib/firebase': path.join(srcPath, 'lib/firebase.ts'),
      '@/lib/firebase-admin': path.join(srcPath, 'lib/firebase-admin.ts'),
      '@/lib/database/users': path.join(srcPath, 'lib/database/users.ts'),
      '@/components': path.join(srcPath, 'components'),
      '@/contexts': path.join(srcPath, 'contexts'),
      '@/types': path.join(srcPath, 'types'),
      '@/app': path.join(srcPath, 'app'),
      '@/hooks': path.join(srcPath, 'hooks'),
      '@/utils': path.join(srcPath, 'utils'),
    };

    // Ensure proper file extensions are resolved
    config.resolve.extensions = ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.json'];

    // Enhanced module resolution for monorepo
    config.resolve.modules = [
      srcPath,
      path.resolve(__dirname, 'node_modules'),
      path.resolve(__dirname, '../../node_modules'),
      'node_modules'
    ];

    // Ensure proper handling of workspace packages
    config.resolve.symlinks = false;

    // Add fallbacks for Node.js modules in client-side code
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        util: false,
        buffer: false,
        events: false,
        http2: false,
        dns: false,
        child_process: false,
        os: false,
        path: false,
        url: false,
        querystring: false,
        zlib: false,
      };
    }

    // Remove problematic Firebase aliases - let Next.js handle module resolution

    // Exclude Node.js specific Firebase modules from client bundle
    if (!isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        '@grpc/grpc-js': 'commonjs @grpc/grpc-js',
        'firebase-admin': 'commonjs firebase-admin',
      });
    }

    return config;
  },
};

module.exports = nextConfig;
