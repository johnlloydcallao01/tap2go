/**
 * Custom Expo Modules Autolinking Configuration
 * This overrides the default autolinking to fix the ExpoModulesPackage import issue
 */

module.exports = {
  // Override the default expo package configuration
  expo: {
    android: {
      packageImportPath: 'expo.modules.ExpoModulesPackage',
      sourceDir: '../../../node_modules/expo/android',
    },
  },
  // Disable expo-modules-core autolinking since it's handled by expo
  'expo-modules-core': {
    android: null,
    ios: null,
  },
};
