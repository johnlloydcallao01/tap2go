const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Ultra-simplified Metro config for EAS builds
const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Essential configuration for EAS builds
config.watchFolders = [projectRoot, monorepoRoot];

// Critical resolver configuration for pnpm monorepo
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// Essential modules for EAS builds
config.resolver.extraNodeModules = {
  'react': path.resolve(monorepoRoot, 'node_modules/react'),
  'react-native': path.resolve(monorepoRoot, 'node_modules/react-native'),
  'expo': path.resolve(monorepoRoot, 'node_modules/expo'),
  'expo-modules-core': path.resolve(monorepoRoot, 'node_modules/expo-modules-core'),
};

// Apply NativeWind
try {
  const { withNativeWind } = require('nativewind/metro');
  module.exports = withNativeWind(config, {
    input: './global.css',
    configPath: './tailwind.config.js',
  });
} catch (error) {
  module.exports = config;
}


