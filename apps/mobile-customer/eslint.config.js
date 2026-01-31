const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    rules: {
      'react/display-name': 'off',
      'react/no-unescaped-entities': 'warn',
    },
    ignores: [
      'node_modules/',
      '.expo/',
      'dist/',
      'web-build/',
      '**/metro.config.eas.js',
      '**/fix-autolinking-imports.js',
      '*.config.js',
      'babel.config.js',
      'metro.config.js',
    ],
  },
]);
