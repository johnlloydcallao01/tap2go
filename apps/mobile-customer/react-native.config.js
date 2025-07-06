module.exports = {
  project: {
    android: {
      sourceDir: './android',
      appName: 'app',
      packageName: 'com.tap2go.mobile',
    },
  },
  dependencies: {
    // Disable autolinking for expo-modules-core as it's handled by expo package
    'expo-modules-core': {
      platforms: {
        android: null,
        ios: null,
      },
    },
    // Override expo autolinking to use correct package
    'expo': {
      platforms: {
        android: {
          sourceDir: '../../../node_modules/expo/android',
          packageImportPath: 'import expo.modules.ExpoModulesPackage;',
        },
      },
    },
  },
};