const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Try to load NativeWind, but don't fail if it's not available
let withNativeWind;
try {
  withNativeWind = require('nativewind/metro').withNativeWind;
} catch (error) {
  console.warn('NativeWind metro plugin not available, using basic config');
  withNativeWind = (config) => config; // Fallback function
}

// Find the project and workspace directories
const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Simplified configuration for production builds
config.watchFolders = [projectRoot];

// Basic resolver configuration
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// Disable symlinks for production stability
config.resolver.unstable_enableSymlinks = false;

// Basic platform extensions
config.resolver.platforms = ['native', 'android', 'ios', 'web'];

// Asset extensions
config.resolver.assetExts = [
  ...config.resolver.assetExts,
  'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg',
  'ttf', 'otf', 'woff', 'woff2',
  'mp4', 'mov', 'avi', 'mkv',
  'mp3', 'wav', 'aac',
  'pdf', 'zip'
];

// Source extensions
config.resolver.sourceExts = [
  ...config.resolver.sourceExts,
  'ts', 'tsx', 'js', 'jsx', 'json', 'mjs', 'cjs'
];

// Transformer configuration
config.transformer = {
  ...config.transformer,
  unstable_allowRequireContext: true,
};

// SVG support (only if transformer is available)
try {
  const svgTransformer = require.resolve('react-native-svg-transformer');
  config.transformer.babelTransformerPath = svgTransformer;
  config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== 'svg');
  config.resolver.sourceExts.push('svg');
  console.log('🖼️ SVG transformer enabled');
} catch (error) {
  console.warn('SVG transformer not available, using default asset handling');
}

// Apply NativeWind if available
let finalConfig;
try {
  finalConfig = withNativeWind(config, {
    input: './global.css',
    configPath: './tailwind.config.js',
  });
  console.log('🎨 NativeWind applied to production config');
} catch (error) {
  console.warn('NativeWind configuration failed, using basic config:', error.message);
  finalConfig = config;
}

module.exports = finalConfig;

console.log('📦 Using PRODUCTION Metro config');
console.log('🎯 Optimized for APK builds');
