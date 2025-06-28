module.exports = function (api) {
  api.cache(true);

  // Determine if we're in EAS Build environment
  const isEASBuild = process.env.EAS_BUILD === 'true' || process.env.CI === 'true';

  const plugins = [
    'nativewind/babel', // NativeWind v2.0.11 - Enterprise ready
    'react-native-reanimated/plugin'
  ];

  // Only add react-native-dotenv in local development
  if (!isEASBuild) {
    plugins.unshift([
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        path: '../../.env.local',
        blocklist: null,
        allowlist: null,
        safe: false,
        allowUndefined: true,
        verbose: false,
      },
    ]);
  }

  return {
    presets: ['babel-preset-expo'],
    plugins
  };
};
