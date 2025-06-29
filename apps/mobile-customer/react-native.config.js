module.exports = {
  project: {
    android: {
      sourceDir: './android',
      appName: 'app',
      packageName: 'com.tap2go.mobile',
    },
  },
  dependencies: {
    // Configure React Native CLI autolinking for expo-modules-core
    // Provide explicit path and import configuration
    'expo-modules-core': {
      platforms: {
        android: {
          sourceDir: '../../../node_modules/expo-modules-core/android',
          packageImportPath: 'import expo.modules.ExpoModulesPackage;',
        },
      },
    },
  },
};
