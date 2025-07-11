import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    reactCompiler: false,
    ...(process.env.NODE_ENV === 'production' ? { forceSwcTransforms: true } : {}),
  },
  output: 'standalone',
  trailingSlash: false,
  poweredByHeader: false,
  serverExternalPackages: ['styled-jsx'],
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
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'src'),
      'react': require('path').resolve(__dirname, '../../node_modules/react'),
      'react-dom': require('path').resolve(__dirname, '../../node_modules/react-dom'),
    };
    config.resolve.extensions = ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.json'];
    return config;
  },
};

export default nextConfig;
