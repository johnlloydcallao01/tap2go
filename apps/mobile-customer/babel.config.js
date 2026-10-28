module.exports = function (api) {
  api.cache(true);

  const plugins = [];

  // Add NativeWind plugin with error handling
  try {
    plugins.push('nativewind/babel');
  } catch (error) {
    console.warn('NativeWind babel plugin not available:', error);
  }

  return {
    presets: ['babel-preset-expo'],
    plugins
  };
};
