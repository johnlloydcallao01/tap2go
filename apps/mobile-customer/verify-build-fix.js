#!/usr/bin/env node

/**
 * Verification Script for EAS Build Fix
 * Checks if all components are properly configured for successful Android builds
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying EAS Build Fix Configuration...\n');

let allChecksPass = true;

function checkResult(condition, successMsg, failMsg) {
  if (condition) {
    console.log(`✅ ${successMsg}`);
    return true;
  } else {
    console.log(`❌ ${failMsg}`);
    allChecksPass = false;
    return false;
  }
}

// 1. Check if expo-modules-core is in package.json
console.log('📦 Checking Dependencies...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  checkResult(
    packageJson.dependencies && packageJson.dependencies['expo-modules-core'],
    'expo-modules-core found in package.json dependencies',
    'expo-modules-core NOT found in package.json dependencies'
  );
  
  if (packageJson.dependencies && packageJson.dependencies['expo-modules-core']) {
    console.log(`   Version: ${packageJson.dependencies['expo-modules-core']}`);
  }
} catch (error) {
  checkResult(false, '', 'Failed to read package.json');
}

// 2. Check if expo-modules-core is actually installed
console.log('\n📁 Checking Module Installation...');
const localExpoModulesCore = path.resolve('node_modules/expo-modules-core');
const rootExpoModulesCore = path.resolve('../../node_modules/expo-modules-core');

checkResult(
  fs.existsSync(localExpoModulesCore) || fs.existsSync(rootExpoModulesCore),
  'expo-modules-core module found in node_modules',
  'expo-modules-core module NOT found in node_modules'
);

// 3. Check ExpoModulesPackage.kt location
console.log('\n🔍 Checking ExpoModulesPackage Location...');
const expoPackageFile = path.resolve('../../node_modules/expo/android/src/main/java/expo/modules/ExpoModulesPackage.kt');
checkResult(
  fs.existsSync(expoPackageFile),
  'ExpoModulesPackage.kt found in correct location (expo.modules)',
  'ExpoModulesPackage.kt NOT found in expected location'
);

// 4. Check EAS configuration
console.log('\n⚙️  Checking EAS Configuration...');
try {
  const easJson = JSON.parse(fs.readFileSync('eas.json', 'utf8'));
  
  // Check preview build hooks
  const previewHooks = easJson.build?.preview?.hooks;
  checkResult(
    previewHooks && previewHooks.postInstall && previewHooks.prebuild && previewHooks.postPrebuild,
    'Preview build hooks configured correctly',
    'Preview build hooks missing or incomplete'
  );
  
  // Check production build hooks
  const productionHooks = easJson.build?.production?.hooks;
  checkResult(
    productionHooks && productionHooks.postInstall && productionHooks.prebuild && productionHooks.postPrebuild,
    'Production build hooks configured correctly',
    'Production build hooks missing or incomplete'
  );
} catch (error) {
  checkResult(false, '', 'Failed to read or parse eas.json');
}

// 5. Check build hook scripts exist
console.log('\n📜 Checking Build Hook Scripts...');
const scripts = [
  'eas-build-post-install.sh',
  'eas-build-prebuild.sh', 
  'eas-build-fix-autolinking.sh'
];

scripts.forEach(script => {
  checkResult(
    fs.existsSync(script),
    `${script} exists`,
    `${script} NOT found`
  );
});

// 6. Check react-native.config.js
console.log('\n🔧 Checking React Native Configuration...');
try {
  const configPath = 'react-native.config.js';
  if (fs.existsSync(configPath)) {
    const configContent = fs.readFileSync(configPath, 'utf8');
    checkResult(
      configContent.includes('expo-modules-core') && configContent.includes('android: null'),
      'react-native.config.js properly disables expo-modules-core autolinking',
      'react-native.config.js may have incorrect expo-modules-core configuration'
    );
  } else {
    checkResult(false, '', 'react-native.config.js NOT found');
  }
} catch (error) {
  checkResult(false, '', 'Failed to read react-native.config.js');
}

// 7. Check Metro configuration
console.log('\n🚇 Checking Metro Configuration...');
try {
  const metroConfigPath = 'metro.config.eas.js';
  if (fs.existsSync(metroConfigPath)) {
    const metroContent = fs.readFileSync(metroConfigPath, 'utf8');
    checkResult(
      metroContent.includes('expo-modules-core') && metroContent.includes('extraNodeModules'),
      'metro.config.eas.js includes expo-modules-core in extraNodeModules',
      'metro.config.eas.js missing expo-modules-core configuration'
    );
  } else {
    checkResult(false, '', 'metro.config.eas.js NOT found');
  }
} catch (error) {
  checkResult(false, '', 'Failed to read metro.config.eas.js');
}

// 8. Check root pnpm configuration
console.log('\n📦 Checking Root PNPM Configuration...');
try {
  const rootPackageJson = JSON.parse(fs.readFileSync('../../package.json', 'utf8'));
  const publicHoistPattern = rootPackageJson.pnpm?.publicHoistPattern;
  checkResult(
    publicHoistPattern && publicHoistPattern.includes('*expo-modules-core*'),
    'Root package.json includes expo-modules-core in publicHoistPattern',
    'Root package.json missing expo-modules-core in publicHoistPattern'
  );
} catch (error) {
  checkResult(false, '', 'Failed to read root package.json');
}

// Final summary
console.log('\n' + '='.repeat(60));
if (allChecksPass) {
  console.log('🎉 ALL CHECKS PASSED! EAS Build should now work correctly.');
  console.log('\n🚀 Next steps:');
  console.log('   1. Run: eas build --platform android --profile preview');
  console.log('   2. Monitor build logs for successful compilation');
  console.log('   3. Verify APK is generated without errors');
} else {
  console.log('⚠️  SOME CHECKS FAILED! Please review the issues above.');
  console.log('\n🔧 Fix the failing checks before running EAS build.');
}
console.log('='.repeat(60));

process.exit(allChecksPass ? 0 : 1);
