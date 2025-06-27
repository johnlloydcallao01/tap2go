const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Find the project and workspace directories
const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// ENTERPRISE OPTIMIZATION: Only watch specific directories to prevent timeout
const specificPackages = {
  '@tap2go/config': path.resolve(monorepoRoot, 'packages/config'),
  // Add other packages as needed
};

// 1. OPTIMIZED: Watch only project root and specific packages (not entire monorepo)
config.watchFolders = process.platform === 'win32'
  ? [projectRoot]  // Windows: only watch mobile app to prevent timeout
  : [projectRoot, ...Object.values(specificPackages)];

// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// 3. Add specific packages as extraNodeModules to avoid symlink issues
config.resolver.extraNodeModules = specificPackages;

// 4. Force Metro to resolve (sub)dependencies only from the `nodeModulesPaths`
config.resolver.disableHierarchicalLookup = true;

// 5. Basic configuration without NativeWind (fallback)
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// 6. ENTERPRISE PERFORMANCE OPTIMIZATIONS
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// 7. Windows-specific optimizations
if (process.platform === 'win32') {
  config.server = {
    ...config.server,
    enhanceMiddleware: (middleware) => {
      return (req, res, next) => {
        req.setTimeout(60000); // 60 seconds timeout
        res.setTimeout(60000);
        return middleware(req, res, next);
      };
    },
  };
}

console.log('📝 Using ENTERPRISE-OPTIMIZED fallback Metro config');
console.log(`🔍 Watching folders: ${config.watchFolders.length} directories`);
console.log(`🖥️  Platform: ${process.platform}`);

module.exports = config;
