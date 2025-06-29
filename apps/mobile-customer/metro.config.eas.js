const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

// Simplified Metro config specifically for EAS builds
const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

console.log('🏗️  EAS BUILD Metro Configuration');
console.log('📁 Project root:', projectRoot);
console.log('📁 Monorepo root:', monorepoRoot);

// Debug: Check if @babel/runtime exists
const babelRuntimePath = path.resolve(monorepoRoot, 'node_modules/@babel/runtime');
const babelRuntimeExists = fs.existsSync(babelRuntimePath);
console.log('🔍 @babel/runtime exists at monorepo root:', babelRuntimeExists);

if (babelRuntimeExists) {
  const helperPath = path.resolve(babelRuntimePath, 'helpers/interopRequireDefault.js');
  const helperExists = fs.existsSync(helperPath);
  console.log('🔍 interopRequireDefault helper exists:', helperExists);
}

const config = getDefaultConfig(projectRoot);

// Essential configuration for EAS builds
config.watchFolders = [projectRoot];

// Critical resolver configuration for pnpm monorepo
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// CRITICAL: Disable hierarchical lookup for pnpm compatibility
config.resolver.disableHierarchicalLookup = true;

// CRITICAL: Add expo-modules-core resolution for EAS builds
config.resolver.extraNodeModules = {
  'expo-modules-core': path.resolve(monorepoRoot, 'node_modules/expo-modules-core'),
  'expo': path.resolve(monorepoRoot, 'node_modules/expo'),
  '@expo/metro-runtime': path.resolve(monorepoRoot, 'node_modules/@expo/metro-runtime'),
  'react-native-is-edge-to-edge': path.resolve(monorepoRoot, 'node_modules/react-native-is-edge-to-edge'),
  '@react-native/virtualized-lists': path.resolve(monorepoRoot, 'node_modules/@react-native/virtualized-lists'),
  'memoize-one': path.resolve(monorepoRoot, 'node_modules/memoize-one'),
  'whatwg-url-without-unicode': path.resolve(monorepoRoot, 'node_modules/whatwg-url-without-unicode'),
  'use-sync-external-store': path.resolve(monorepoRoot, 'node_modules/use-sync-external-store'),
  'use-latest-callback': path.resolve(monorepoRoot, 'node_modules/use-latest-callback'),
  '@react-navigation/routers': path.resolve(monorepoRoot, 'node_modules/@react-navigation/routers'),
  'ansi-regex': path.resolve(monorepoRoot, 'node_modules/ansi-regex'),
  '@react-native/normalize-colors': path.resolve(monorepoRoot, 'node_modules/@react-native/normalize-colors'),
  'react-is': path.resolve(monorepoRoot, 'node_modules/react-is'),
  'query-string': path.resolve(monorepoRoot, 'node_modules/query-string'),
  'nanoid': path.resolve(monorepoRoot, 'node_modules/nanoid'),
  'escape-string-regexp': path.resolve(monorepoRoot, 'node_modules/escape-string-regexp'),
  '@react-navigation/elements': path.resolve(monorepoRoot, 'node_modules/@react-navigation/elements'),
  'buffer': path.resolve(monorepoRoot, 'node_modules/buffer'),
  '@react-native/assets-registry': path.resolve(monorepoRoot, 'node_modules/@react-native/assets-registry'),
  'base64-js': path.resolve(monorepoRoot, 'node_modules/base64-js'),
  'stacktrace-parser': path.resolve(monorepoRoot, 'node_modules/stacktrace-parser'),
  'css-mediaquery': path.resolve(monorepoRoot, 'node_modules/css-mediaquery'),
  'webidl-conversions': path.resolve(monorepoRoot, 'node_modules/webidl-conversions'),
  'decode-uri-component': path.resolve(monorepoRoot, 'node_modules/decode-uri-component'),
  'ieee754': path.resolve(monorepoRoot, 'node_modules/ieee754'),
  'filter-obj': path.resolve(monorepoRoot, 'node_modules/filter-obj'),
  'split-on-first': path.resolve(monorepoRoot, 'node_modules/split-on-first'),
  'color': path.resolve(monorepoRoot, 'node_modules/color'),
  'color-string': path.resolve(monorepoRoot, 'node_modules/color-string'),
  '@babel/runtime': path.resolve(monorepoRoot, 'node_modules/@babel/runtime'),
  'scheduler': path.resolve(monorepoRoot, 'node_modules/scheduler/index.native.js'),
};

// Disable symlinks for EAS build stability
config.resolver.unstable_enableSymlinks = false;

// CRITICAL: Essential aliases for EAS build resolution
config.resolver.alias = {
  // Core Expo modules - essential for EAS builds
  'expo': path.resolve(monorepoRoot, 'node_modules/expo'),
  'expo-modules-core': path.resolve(monorepoRoot, 'node_modules/expo-modules-core'),
  '@expo/metro-runtime': path.resolve(monorepoRoot, 'node_modules/@expo/metro-runtime'),
  
  // Core React modules
  'react': path.resolve(monorepoRoot, 'node_modules/react'),
  'react-native': path.resolve(monorepoRoot, 'node_modules/react-native'),
  
  // Essential Expo modules
  'expo-constants': path.resolve(monorepoRoot, 'node_modules/expo-constants'),
  'expo-router': path.resolve(monorepoRoot, 'node_modules/expo-router'),
  'expo-asset': path.resolve(monorepoRoot, 'node_modules/expo-asset'),
  'expo-font': path.resolve(monorepoRoot, 'node_modules/expo-font'),
  'expo-file-system': path.resolve(monorepoRoot, 'node_modules/expo-file-system'),

  // React Navigation modules
  '@react-navigation/core': path.resolve(monorepoRoot, 'node_modules/@react-navigation/core'),
  '@react-navigation/native': path.resolve(monorepoRoot, 'node_modules/@react-navigation/native'),
  '@react-navigation/stack': path.resolve(monorepoRoot, 'node_modules/@react-navigation/stack'),
  '@react-navigation/bottom-tabs': path.resolve(monorepoRoot, 'node_modules/@react-navigation/bottom-tabs'),

  // Required peer dependencies
  'react-native-gesture-handler': path.resolve(monorepoRoot, 'node_modules/react-native-gesture-handler'),
  'expo-linking': path.resolve(monorepoRoot, 'node_modules/expo-linking'),
  'react-native-is-edge-to-edge': path.resolve(monorepoRoot, 'node_modules/react-native-is-edge-to-edge'),
  'react-native-edge-to-edge': path.resolve(monorepoRoot, 'node_modules/react-native-edge-to-edge'),
};

// Merge with existing extraNodeModules (avoid duplication)
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'react': path.resolve(monorepoRoot, 'node_modules/react'),
  'react-native': path.resolve(monorepoRoot, 'node_modules/react-native'),
  'react-native-gesture-handler': path.resolve(monorepoRoot, 'node_modules/react-native-gesture-handler'),
  'expo-linking': path.resolve(monorepoRoot, 'node_modules/expo-linking'),
  'react-native-edge-to-edge': path.resolve(monorepoRoot, 'node_modules/react-native-edge-to-edge'),
  '@react-native/virtualized-lists': path.resolve(monorepoRoot, 'node_modules/@react-native/virtualized-lists'),
  'memoize-one': path.resolve(monorepoRoot, 'node_modules/memoize-one'),
  'whatwg-url-without-unicode': path.resolve(monorepoRoot, 'node_modules/whatwg-url-without-unicode'),
  'use-sync-external-store': path.resolve(monorepoRoot, 'node_modules/use-sync-external-store'),
  'use-latest-callback': path.resolve(monorepoRoot, 'node_modules/use-latest-callback'),
  '@react-navigation/routers': path.resolve(monorepoRoot, 'node_modules/@react-navigation/routers'),
  'ansi-regex': path.resolve(monorepoRoot, 'node_modules/ansi-regex'),
  '@react-native/normalize-colors': path.resolve(monorepoRoot, 'node_modules/@react-native/normalize-colors'),
  'react-is': path.resolve(monorepoRoot, 'node_modules/react-is'),
  'query-string': path.resolve(monorepoRoot, 'node_modules/query-string'),
  'nanoid': path.resolve(monorepoRoot, 'node_modules/nanoid'),
  'escape-string-regexp': path.resolve(monorepoRoot, 'node_modules/escape-string-regexp'),
  '@react-navigation/elements': path.resolve(monorepoRoot, 'node_modules/@react-navigation/elements'),
  'buffer': path.resolve(monorepoRoot, 'node_modules/buffer'),
  '@react-native/assets-registry': path.resolve(monorepoRoot, 'node_modules/@react-native/assets-registry'),
  'base64-js': path.resolve(monorepoRoot, 'node_modules/base64-js'),
  'stacktrace-parser': path.resolve(monorepoRoot, 'node_modules/stacktrace-parser'),
  'css-mediaquery': path.resolve(monorepoRoot, 'node_modules/css-mediaquery'),
  'webidl-conversions': path.resolve(monorepoRoot, 'node_modules/webidl-conversions'),
  'decode-uri-component': path.resolve(monorepoRoot, 'node_modules/decode-uri-component'),
  'ieee754': path.resolve(monorepoRoot, 'node_modules/ieee754'),
  'filter-obj': path.resolve(monorepoRoot, 'node_modules/filter-obj'),
  'split-on-first': path.resolve(monorepoRoot, 'node_modules/split-on-first'),
  'color': path.resolve(monorepoRoot, 'node_modules/color'),
  'color-string': path.resolve(monorepoRoot, 'node_modules/color-string'),
  '@babel/runtime': path.resolve(monorepoRoot, 'node_modules/@babel/runtime'),
  'scheduler': path.resolve(monorepoRoot, 'node_modules/scheduler/index.native.js'),
};

// Platform extensions
config.resolver.platforms = ['native', 'android', 'ios', 'web'];

// Custom resolver for critical modules
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Handle scheduler module
  if (moduleName === 'scheduler') {
    const schedulerPath = path.resolve(monorepoRoot, 'node_modules/scheduler/index.native.js');
    console.log(`🔧 Resolving scheduler to: ${schedulerPath}`);

    if (fs.existsSync(schedulerPath)) {
      console.log('✅ Scheduler native file found');
      return {
        filePath: schedulerPath,
        type: 'sourceFile',
      };
    } else {
      console.log('❌ Scheduler native file not found, falling back to default resolution');
    }
  }

  // Handle @babel/runtime modules
  if (moduleName.startsWith('@babel/runtime/')) {
    // Try multiple possible locations
    const possiblePaths = [
      path.resolve(monorepoRoot, 'node_modules', moduleName + '.js'),
      path.resolve(monorepoRoot, 'node_modules', moduleName, 'index.js'),
      path.resolve(projectRoot, 'node_modules', moduleName + '.js'),
      path.resolve(projectRoot, 'node_modules', moduleName, 'index.js'),
    ];

    console.log(`🔧 Resolving @babel/runtime module: ${moduleName}`);

    for (const possiblePath of possiblePaths) {
      if (fs.existsSync(possiblePath)) {
        console.log(`✅ @babel/runtime module found at: ${possiblePath}`);
        return {
          filePath: possiblePath,
          type: 'sourceFile',
        };
      }
    }

    console.log('❌ @babel/runtime module not found in any location, falling back to default resolution');
  }

  // Fallback to default resolution
  return context.resolveRequest(context, moduleName, platform);
};

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

// SVG support (simplified for EAS)
try {
  const svgTransformer = require.resolve('react-native-svg-transformer');
  config.transformer.babelTransformerPath = svgTransformer;
  config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== 'svg');
  config.resolver.sourceExts.push('svg');
  console.log('✅ SVG transformer enabled for EAS build');
} catch (error) {
  console.log('⚠️  SVG transformer not available, using default asset handling');
}

// Apply NativeWind (simplified for EAS)
try {
  const { withNativeWind } = require('nativewind/metro');
  const finalConfig = withNativeWind(config, {
    input: './global.css',
    configPath: './tailwind.config.js',
  });
  console.log('✅ NativeWind applied to EAS build config');
  module.exports = finalConfig;
} catch (error) {
  console.log('⚠️  NativeWind not available, using basic config');
  module.exports = config;
}

console.log('✅ EAS Metro configuration loaded successfully');
console.log('🎯 Optimized for EAS build resolution');
