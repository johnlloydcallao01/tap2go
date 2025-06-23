module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'nativewind/babel', // NativeWind v2.0.11 - Enterprise ready
      'react-native-reanimated/plugin'
    ]
  };
};
