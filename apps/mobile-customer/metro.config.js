const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configure platforms
config.resolver.platforms = ['native', 'android', 'ios', 'web'];

// NativeWind v2 doesn't use metro plugin - it uses PostCSS and Babel
console.log('✅ Metro config loaded successfully');
console.log('✅ NativeWind v2 configured via Babel and PostCSS');
module.exports = config;
