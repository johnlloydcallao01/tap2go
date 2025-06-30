const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

// Helper function to find packages in pnpm .pnpm structure
function findInPnpmStructure(rootPath, packageName) {
  const pnpmPath = path.resolve(rootPath, 'node_modules/.pnpm');
  const results = [];

  if (!fs.existsSync(pnpmPath)) {
    return results;
  }

  try {
    const pnpmDirs = fs.readdirSync(pnpmPath);
    for (const dir of pnpmDirs) {
      if (dir.startsWith(`${packageName}@`)) {
        const packagePath = path.resolve(pnpmPath, dir, 'node_modules', packageName);
        if (fs.existsSync(packagePath)) {
          results.push(packagePath);
        }
      }
    }
  } catch (error) {
    // Silent error handling
  }

  return results;
}

// Simplified Metro config specifically for EAS builds
const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

// Silent Metro configuration for cleaner terminal output

const config = getDefaultConfig(projectRoot);

// Essential configuration for EAS builds
config.watchFolders = [
  projectRoot,
  // Add monorepo root and critical directories for proper file watching
  path.resolve(monorepoRoot, 'packages'),
  path.resolve(monorepoRoot, 'apps'),
  path.resolve(monorepoRoot, 'node_modules'),
  // Explicitly watch @babel/runtime for SHA-1 computation
  path.resolve(monorepoRoot, 'node_modules/@babel/runtime'),
];

// Critical resolver configuration for pnpm monorepo
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// CRITICAL: Disable hierarchical lookup for pnpm compatibility
config.resolver.disableHierarchicalLookup = true;

// Function to generate @babel/runtime helper mappings
function generateBabelRuntimeMappings() {
  const babelRuntimeHelpers = {};
  const helpersDir = path.resolve(monorepoRoot, 'node_modules/@babel/runtime/helpers');

  if (fs.existsSync(helpersDir)) {
    const helperFiles = fs.readdirSync(helpersDir);

    helperFiles.forEach(file => {
      if (file.endsWith('.js') && file !== 'esm') {
        const helperName = file.replace('.js', '');
        const moduleName = `@babel/runtime/helpers/${helperName}`;
        const helperPath = path.resolve(helpersDir, file);
        babelRuntimeHelpers[moduleName] = helperPath;
      }
    });
  }

  return babelRuntimeHelpers;
}

// CRITICAL: Add expo-modules-core resolution for EAS builds
const babelRuntimeMappings = generateBabelRuntimeMappings();

config.resolver.extraNodeModules = {
  'expo-modules-core': path.resolve(monorepoRoot, 'node_modules/expo-modules-core'),
  'expo': path.resolve(monorepoRoot, 'node_modules/expo'),
  '@expo/metro-runtime': path.resolve(monorepoRoot, 'node_modules/@expo/metro-runtime'),
  'react-native-is-edge-to-edge': path.resolve(monorepoRoot, 'node_modules/react-native-is-edge-to-edge'),
  '@react-native/virtualized-lists': path.resolve(monorepoRoot, 'node_modules/@react-native/virtualized-lists'),
  // Add abort-controller for React Native polyfill resolution
  'abort-controller': path.resolve(monorepoRoot, 'node_modules/abort-controller'),
  // Add is-arrayish for simple-swizzle dependency resolution
  'is-arrayish': path.resolve(monorepoRoot, 'node_modules/is-arrayish'),
  // Add react-freeze for react-native-screens dependency resolution
  'react-freeze': path.resolve(monorepoRoot, 'node_modules/react-freeze'),
  // Add promise for React Native core dependency resolution
  'promise': path.resolve(monorepoRoot, 'node_modules/promise'),
  // Add whatwg-fetch for React Native fetch polyfill resolution
  'whatwg-fetch': path.resolve(monorepoRoot, 'node_modules/whatwg-fetch'),
  // Add event-target-shim for abort-controller dependency resolution
  'event-target-shim': path.resolve(monorepoRoot, 'node_modules/event-target-shim'),
  'memoize-one': path.resolve(monorepoRoot, 'node_modules/memoize-one'),
  'whatwg-url-without-unicode': path.resolve(monorepoRoot, 'node_modules/whatwg-url-without-unicode'),
  'regenerator-runtime': path.resolve(monorepoRoot, 'node_modules/regenerator-runtime'),
  'abort-controller': path.resolve(monorepoRoot, 'node_modules/abort-controller'),
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
  'color-convert': path.resolve(monorepoRoot, 'node_modules/color-convert'),
  '@babel/runtime': path.resolve(monorepoRoot, 'node_modules/@babel/runtime'),
  ...babelRuntimeMappings, // Add all @babel/runtime helpers dynamically
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

// Merge additional modules with existing extraNodeModules (avoid duplication)
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'react': path.resolve(monorepoRoot, 'node_modules/react'),
  'react-native': path.resolve(monorepoRoot, 'node_modules/react-native'),
  'react-native-gesture-handler': path.resolve(monorepoRoot, 'node_modules/react-native-gesture-handler'),
  'expo-linking': path.resolve(monorepoRoot, 'node_modules/expo-linking'),
  'react-native-edge-to-edge': path.resolve(monorepoRoot, 'node_modules/react-native-edge-to-edge'),
};

// Platform extensions
config.resolver.platforms = ['native', 'android', 'ios', 'web'];

// Add resolver alias for @babel/runtime and color modules with safe path resolution
config.resolver.alias = {};

try {
  config.resolver.alias = {
    '@babel/runtime': path.resolve(monorepoRoot, 'node_modules/@babel/runtime'),
    'color-convert': path.resolve(monorepoRoot, 'node_modules/color-convert'),
    'regenerator-runtime/runtime': path.resolve(monorepoRoot, 'node_modules/regenerator-runtime/runtime'),
    // Fix abort-controller resolution - Metro needs exact path matching package.json main field
    'abort-controller': path.resolve(monorepoRoot, 'node_modules/abort-controller'),
    // Fix is-arrayish resolution for simple-swizzle dependency
    'is-arrayish': path.resolve(monorepoRoot, 'node_modules/is-arrayish'),
    // Fix react-freeze resolution for react-native-screens dependency
    'react-freeze': path.resolve(monorepoRoot, 'node_modules/react-freeze'),
    // Fix promise resolution for React Native core dependencies
    'promise': path.resolve(monorepoRoot, 'node_modules/promise'),
    // Fix whatwg-fetch resolution for React Native fetch polyfill
    'whatwg-fetch': path.resolve(monorepoRoot, 'node_modules/whatwg-fetch'),
    // Fix event-target-shim resolution for abort-controller dependency
    'event-target-shim': path.resolve(monorepoRoot, 'node_modules/event-target-shim'),
  };
} catch (aliasError) {
  // Silent error handling
  config.resolver.alias = {};
}

// Custom resolver for critical modules
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Silent EAS build debugging (only for critical failures)
  // Removed verbose logging to clean up terminal output

  // CRITICAL: Handle expo-modules-core resolution for EAS builds
  if (moduleName === 'expo-modules-core') {
    const possiblePaths = [
      // Standard locations (most likely to work)
      path.resolve(monorepoRoot, 'node_modules/expo-modules-core'),
      path.resolve(projectRoot, 'node_modules/expo-modules-core'),
      // EAS build specific locations
      path.resolve('/home/expo/workingdir/build/node_modules/expo-modules-core'),
      path.resolve('/home/expo/workingdir/build/node_modules/.pnpm/expo-modules-core@2.4.0/node_modules/expo-modules-core'),
      // PNPM-specific locations with version variations
      path.resolve(projectRoot, 'node_modules/.pnpm/expo-modules-core@2.4.0/node_modules/expo-modules-core'),
      path.resolve(monorepoRoot, 'node_modules/.pnpm/expo-modules-core@2.4.0/node_modules/expo-modules-core'),
      // Try to find it in any .pnpm directory
      ...findInPnpmStructure(projectRoot, 'expo-modules-core'),
      ...findInPnpmStructure(monorepoRoot, 'expo-modules-core'),
      // Additional EAS build fallbacks
      ...findInPnpmStructure('/home/expo/workingdir/build', 'expo-modules-core'),
    ];

    for (const possiblePath of possiblePaths) {
      if (fs.existsSync(possiblePath)) {
        // Check package.json for correct main entry point
        const packageJsonPath = path.resolve(possiblePath, 'package.json');
        let mainEntry = 'index.js';

        if (fs.existsSync(packageJsonPath)) {
          try {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            mainEntry = packageJson.main || 'index.js';
          } catch (error) {
            // Silent error handling
          }
        }

        const indexPath = path.resolve(possiblePath, mainEntry);
        if (fs.existsSync(indexPath)) {
          return {
            filePath: indexPath,
            type: 'sourceFile',
          };
        }
      }
    }
  }

  // FALLBACK: Try to resolve any expo-related module through pnpm structure
  if (moduleName.startsWith('expo') || moduleName.startsWith('@expo')) {
    const possiblePaths = [
      ...findInPnpmStructure(projectRoot, moduleName),
      ...findInPnpmStructure(monorepoRoot, moduleName),
    ];

    for (const possiblePath of possiblePaths) {
      if (fs.existsSync(possiblePath)) {
        const packageJsonPath = path.resolve(possiblePath, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
          try {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            const mainFile = packageJson.main || 'index.js';
            const indexPath = path.resolve(possiblePath, mainFile);
            if (fs.existsSync(indexPath)) {
              return {
                filePath: indexPath,
                type: 'sourceFile',
              };
            }
          } catch (error) {
            // Silent error handling
          }
        }
      }
    }
  }

  // Handle abort-controller main field resolution
  if (moduleName === 'abort-controller/dist/abort-controller') {
    const abortControllerPath = path.resolve(monorepoRoot, 'node_modules/abort-controller/dist/abort-controller.js');
    if (fs.existsSync(abortControllerPath)) {
      return {
        filePath: abortControllerPath,
        type: 'sourceFile',
      };
    }
  }

  // Handle scheduler module
  if (moduleName === 'scheduler') {
    const schedulerPath = path.resolve(monorepoRoot, 'node_modules/scheduler/index.native.js');
    if (fs.existsSync(schedulerPath)) {
      return {
        filePath: schedulerPath,
        type: 'sourceFile',
      };
    }
  }

  // Handle color-convert module
  if (moduleName === 'color-convert') {
    const colorConvertPath = path.resolve(monorepoRoot, 'node_modules/color-convert');
    if (fs.existsSync(colorConvertPath)) {
      const indexPath = path.resolve(colorConvertPath, 'index.js');
      if (fs.existsSync(indexPath)) {
        return {
          filePath: indexPath,
          type: 'sourceFile',
        };
      }
    }
  }

  // Handle @babel/runtime modules (silent resolution)
  if (moduleName.startsWith('@babel/runtime/')) {
    // Check if it's in our extraNodeModules mapping
    if (config.resolver.extraNodeModules && config.resolver.extraNodeModules[moduleName]) {
      const mappedPath = config.resolver.extraNodeModules[moduleName];
      if (fs.existsSync(mappedPath)) {
        return {
          filePath: mappedPath,
          type: 'sourceFile',
        };
      }
    }

    // Try direct resolution
    const directPath = path.resolve(monorepoRoot, 'node_modules', moduleName + '.js');
    if (fs.existsSync(directPath)) {
      return {
        filePath: directPath,
        type: 'sourceFile',
      };
    }
  }

  // Handle is-arrayish module for simple-swizzle
  if (moduleName === 'is-arrayish') {
    const isArrayishPath = path.resolve(monorepoRoot, 'node_modules/is-arrayish');
    if (fs.existsSync(isArrayishPath)) {
      const indexPath = path.resolve(isArrayishPath, 'index.js');
      if (fs.existsSync(indexPath)) {
        return {
          filePath: indexPath,
          type: 'sourceFile',
        };
      }
    }
  }

  // Handle react-freeze module for react-native-screens
  if (moduleName === 'react-freeze') {
    const reactFreezePath = path.resolve(monorepoRoot, 'node_modules/react-freeze');
    if (fs.existsSync(reactFreezePath)) {
      // Check for React Native source first (as specified in package.json)
      const rnSourcePath = path.resolve(reactFreezePath, 'src/index.tsx');
      if (fs.existsSync(rnSourcePath)) {
        return {
          filePath: rnSourcePath,
          type: 'sourceFile',
        };
      }

      // Fallback to main dist file
      const mainPath = path.resolve(reactFreezePath, 'dist/index.js');
      if (fs.existsSync(mainPath)) {
        return {
          filePath: mainPath,
          type: 'sourceFile',
        };
      }
    }
  }

  // Handle promise module subpaths for React Native core
  if (moduleName.startsWith('promise/')) {
    const promisePath = path.resolve(monorepoRoot, 'node_modules/promise');
    const subPath = moduleName.replace('promise/', '');
    const fullPath = path.resolve(promisePath, subPath + '.js');

    if (fs.existsSync(fullPath)) {
      return {
        filePath: fullPath,
        type: 'sourceFile',
      };
    } else {
      // Try without .js extension (some files might not have it)
      const pathWithoutExt = path.resolve(promisePath, subPath);
      if (fs.existsSync(pathWithoutExt)) {
        return {
          filePath: pathWithoutExt,
          type: 'sourceFile',
        };
      }
    }
  }

  // Handle whatwg-fetch module for React Native fetch polyfill
  if (moduleName === 'whatwg-fetch') {
    const whatwgFetchPath = path.resolve(monorepoRoot, 'node_modules/whatwg-fetch');
    if (fs.existsSync(whatwgFetchPath)) {
      // Use the main module entry (fetch.js for ES modules)
      const fetchPath = path.resolve(whatwgFetchPath, 'fetch.js');
      if (fs.existsSync(fetchPath)) {
        return {
          filePath: fetchPath,
          type: 'sourceFile',
        };
      }

      // Fallback to UMD dist version
      const umdPath = path.resolve(whatwgFetchPath, 'dist/fetch.umd.js');
      if (fs.existsSync(umdPath)) {
        return {
          filePath: umdPath,
          type: 'sourceFile',
        };
      }
    }
  }

  // Handle event-target-shim module for abort-controller dependency
  if (moduleName === 'event-target-shim') {
    const eventTargetShimPath = path.resolve(monorepoRoot, 'node_modules/event-target-shim');
    if (fs.existsSync(eventTargetShimPath)) {
      // Use the main entry point (dist/event-target-shim)
      const mainPath = path.resolve(eventTargetShimPath, 'dist/event-target-shim.js');
      if (fs.existsSync(mainPath)) {
        return {
          filePath: mainPath,
          type: 'sourceFile',
        };
      }

      // Try ES module version
      const mjsPath = path.resolve(eventTargetShimPath, 'dist/event-target-shim.mjs');
      if (fs.existsSync(mjsPath)) {
        return {
          filePath: mjsPath,
          type: 'sourceFile',
        };
      }
    }
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
  // SVG transformer enabled
} catch (error) {
  // SVG transformer not available, using default asset handling
}

// Apply NativeWind (simplified for EAS)
try {
  const { withNativeWind } = require('nativewind/metro');
  const finalConfig = withNativeWind(config, {
    input: './global.css',
    configPath: './tailwind.config.js',
  });
  // NativeWind applied to EAS build config
  module.exports = finalConfig;
} catch (error) {
  // NativeWind not available, using basic config
  module.exports = config;
}
