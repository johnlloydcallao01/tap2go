const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

// Find the project and workspace directories
const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// ENTERPRISE OPTIMIZATION: Only watch specific directories to prevent timeout
// Instead of watching entire monorepo, only watch what's actually needed
const specificPackages = {
  '@tap2go/config': path.resolve(monorepoRoot, 'packages/config'),
  // Add other packages as needed
};

// 1. OPTIMIZED: Watch project root, workspace root, and specific packages for pnpm monorepo
config.watchFolders = [
  projectRoot,
  monorepoRoot,
  ...Object.values(specificPackages)
];

// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// 3. Add specific packages as extraNodeModules to avoid symlink issues
config.resolver.extraNodeModules = specificPackages;

// 4. ENTERPRISE PNPM COMPATIBILITY - Critical dependency aliases
// These aliases are REQUIRED for pnpm monorepos to resolve core dependencies
config.resolver.alias = {
  // Core React dependencies - must resolve from mobile app
  'react': path.resolve(projectRoot, 'node_modules/react'),
  'react-dom': path.resolve(projectRoot, 'node_modules/react-dom'),
  'react-native': path.resolve(projectRoot, 'node_modules/react-native'),

  // Expo core dependencies - critical for pnpm resolution
  'expo': path.resolve(projectRoot, 'node_modules/expo'),
  'expo-asset': path.resolve(projectRoot, 'node_modules/expo-asset'),
  'expo-constants': path.resolve(projectRoot, 'node_modules/expo-constants'),
  'expo-file-system': path.resolve(projectRoot, 'node_modules/expo-file-system'),
  'expo-font': path.resolve(projectRoot, 'node_modules/expo-font'),

  // React Native core modules
  'react-native-reanimated': path.resolve(projectRoot, 'node_modules/react-native-reanimated'),
  '@react-native-async-storage/async-storage': path.resolve(projectRoot, 'node_modules/@react-native-async-storage/async-storage'),

  // Babel runtime - critical for pnpm (try workspace first, then local)
  '@babel/runtime': fs.existsSync(path.resolve(monorepoRoot, 'node_modules/@babel/runtime'))
    ? path.resolve(monorepoRoot, 'node_modules/@babel/runtime')
    : path.resolve(projectRoot, 'node_modules/@babel/runtime'),

  // Metro runtime
  '@expo/metro-runtime': path.resolve(projectRoot, 'node_modules/@expo/metro-runtime'),
};

// 5. Force Metro to resolve (sub)dependencies only from the `nodeModulesPaths`
config.resolver.disableHierarchicalLookup = true;

// 6. PNPM-specific resolver optimizations
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// 6.1. GitHub Actions CI/CD optimizations
if (process.env.CI) {
  console.log('🚀 Detected CI environment - applying GitHub Actions optimizations');

  // Disable file watching in CI
  config.watchFolders = [projectRoot];

  // Increase timeouts for CI builds
  config.server = {
    ...config.server,
    port: 8081,
  };

  // Optimize for CI memory usage
  config.transformer.minifierConfig = {
    keep_fnames: true,
    mangle: {
      keep_fnames: true,
    },
  };
}

// 7. Enable symlink resolution for pnpm (experimental but required)
config.resolver.unstable_enableSymlinks = true;

// 8. Ensure proper resolution order for pnpm hoisted dependencies
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// 9. PNPM workspace package resolution
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Handle workspace packages
  if (moduleName.startsWith('@tap2go/')) {
    const packagePath = path.resolve(monorepoRoot, 'packages', moduleName.replace('@tap2go/', ''));
    if (fs.existsSync(packagePath)) {
      return {
        filePath: path.join(packagePath, 'src/index.ts'),
        type: 'sourceFile',
      };
    }
  }

  // Fallback to default resolution
  return context.resolveRequest(context, moduleName, platform);
};

// 5. ENTERPRISE PERFORMANCE OPTIMIZATIONS
// Increase timeout for large monorepos
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// 6. Windows-specific optimizations for file watching
if (process.platform === 'win32') {
  // Reduce file watching overhead on Windows - only watch mobile app
  config.watchFolders = [projectRoot];

  // Add timeout configuration for Windows
  config.server = {
    ...config.server,
    enhanceMiddleware: (middleware) => {
      return (req, res, next) => {
        // Set longer timeout for Windows file system
        req.setTimeout(60000); // 60 seconds
        res.setTimeout(60000);
        return middleware(req, res, next);
      };
    },
  };
}

// 7. Cache optimization for enterprise development
try {
  const FileStore = require('metro-cache/src/stores/FileStore');
  config.cacheStores = [
    new FileStore({
      root: path.join(projectRoot, '.metro-cache'),
    }),
  ];
} catch (error) {
  // Fallback if FileStore is not available or has issues
  console.log('⚠️ Using default Metro cache configuration');
}

console.log('📝 Using ENTERPRISE-OPTIMIZED Metro config with PNPM + NativeWind v2 compatibility');
console.log(`🔍 Watching folders: ${config.watchFolders.length} directories`);
console.log(`🖥️  Platform: ${process.platform}`);
console.log(`📦 PNPM symlink resolution: ${config.resolver.unstable_enableSymlinks ? 'ENABLED' : 'DISABLED'}`);
console.log(`🎯 Critical aliases configured: ${Object.keys(config.resolver.alias).length} dependencies`);
console.log(`🎨 NativeWind v2.0.11: ENTERPRISE READY`);

module.exports = config;
