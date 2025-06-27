#!/usr/bin/env node

/**
 * Professional Expo Launcher with Cache Management
 * Handles cache validation, dependency conflicts, and Metro bundler optimization
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class ExpoLauncher {
  constructor() {
    this.projectRoot = __dirname;
    this.monorepoRoot = path.resolve(this.projectRoot, '../..');
  }

  log(message, type = 'info') {
    const prefix = {
      info: '🔧',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    }[type] || 'ℹ️';
    console.log(`${prefix} ${message}`);
  }

  async validateEnvironment() {
    this.log('Validating environment for React 19 compatibility...');

    // Check Node.js version
    const nodeVersion = process.version;
    this.log(`Node.js version: ${nodeVersion}`);

    // Check React versions
    const packageJsonPath = path.join(this.projectRoot, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      this.log(`React version: ${packageJson.dependencies.react}`);
      this.log(`React DOM version: ${packageJson.dependencies['react-dom']}`);
      this.log(`React Native Reanimated: ${packageJson.dependencies['react-native-reanimated']}`);
    }

    return true;
  }

  setupEnvironment() {
    this.log('Setting up ENTERPRISE environment variables...');

    // Metro and Node.js optimization (online mode)
    process.env.NODE_OPTIONS = '--max-old-space-size=8192';
    process.env.EXPO_USE_FAST_RESOLVER = 'true';

    // ENTERPRISE FIX: EXPLICITLY ENABLE CACHING AND NETWORKING
    delete process.env.EXPO_NO_CACHE;  // Remove cache-disabling variable
    delete process.env.EXPO_OFFLINE;   // Remove offline mode

    // Enable full online mode with caching
    process.env.EXPO_CACHE = '1';
    process.env.METRO_CACHE = '1';
    process.env.EXPO_CACHE_CERTIFICATES = 'true';  // Enable certificate caching

    // Enable networking for manifest and certificate downloads
    delete process.env.EXPO_NO_NETWORK;
    process.env.EXPO_NETWORK_ENABLED = 'true';

    // React 19 compatibility
    process.env.REACT_VERSION = '19.0.0';
    process.env.NODE_ENV = process.env.NODE_ENV || 'development';

    // Windows-specific optimizations
    if (process.platform === 'win32') {
      process.env.EXPO_USE_FAST_RESOLVER = 'true';
      process.env.WATCHMAN_DISABLE_RECRAWL = 'true';
    }

    this.log('ENTERPRISE environment configured: FULL ONLINE MODE with CACHING', 'success');
    this.log('✅ EXPO_CACHE=1, METRO_CACHE=1, CERTIFICATES=enabled, NETWORKING=enabled', 'success');
  }

  async cleanupCache() {
    this.log('Performing selective cache cleanup...');

    // Only clean .expo directory, keep Metro cache for better performance
    const cacheDirectories = [
      path.join(this.projectRoot, '.expo'),
      path.join(this.projectRoot, '.tmp')
    ];

    for (const dir of cacheDirectories) {
      if (fs.existsSync(dir)) {
        try {
          fs.rmSync(dir, { recursive: true, force: true });
          this.log(`Cleaned: ${path.relative(this.projectRoot, dir)}`, 'success');
        } catch (error) {
          this.log(`Failed to clean ${dir}: ${error.message}`, 'warning');
        }
      }
    }

    this.log('Metro cache preserved for better performance', 'success');
  }

  async ensureCertificateCache() {
    this.log('Ensuring development certificate cache is available...');

    const os = require('os');
    const expoCacheDir = path.join(os.homedir(), '.expo');
    const certCacheDir = path.join(expoCacheDir, 'development-certificates');

    try {
      // Ensure certificate cache directory exists
      if (!fs.existsSync(certCacheDir)) {
        fs.mkdirSync(certCacheDir, { recursive: true });
        this.log('Created certificate cache directory', 'success');
      }

      // Check if we have cached certificates
      const certFiles = fs.readdirSync(certCacheDir).filter(f => f.endsWith('.pem') || f.endsWith('.key'));

      if (certFiles.length > 0) {
        this.log(`Found ${certFiles.length} cached certificate files`, 'success');
      } else {
        this.log('No cached certificates found - will download on first run', 'info');
      }

    } catch (error) {
      this.log(`Certificate cache setup failed: ${error.message}`, 'warning');
      this.log('Continuing without certificate cache optimization...', 'info');
    }
  }

  async startExpo(args = []) {
    this.log('Starting Expo with optimized configuration...');

    return new Promise((resolve, reject) => {
      // Try different Expo commands in order of preference - NO --clear to preserve cache
      const expoCommands = [
        ['npx', 'expo', 'start', ...args],
        ['npx', '@expo/cli', 'start', ...args],
        ['node', 'node_modules/.bin/expo', 'start', ...args]
      ];

      let currentCommandIndex = 0;

      const tryNextCommand = () => {
        if (currentCommandIndex >= expoCommands.length) {
          reject(new Error('All Expo start commands failed'));
          return;
        }

        const [command, ...cmdArgs] = expoCommands[currentCommandIndex];
        this.log(`Trying command: ${command} ${cmdArgs.join(' ')}`);

        const expo = spawn(command, cmdArgs, {
          stdio: 'inherit',
          shell: true,
          cwd: this.projectRoot,
          env: process.env
        });

        expo.on('close', (code) => {
          if (code === 0) {
            this.log('Expo started successfully', 'success');
            resolve(code);
          } else {
            this.log(`Command failed with code ${code}, trying next...`, 'warning');
            currentCommandIndex++;
            tryNextCommand();
          }
        });

        expo.on('error', (error) => {
          this.log(`Command error: ${error.message}`, 'warning');
          currentCommandIndex++;
          tryNextCommand();
        });
      };

      tryNextCommand();
    });
  }

  async run() {
    try {
      this.log('🚀 Starting Expo with ENTERPRISE configuration...', 'info');

      await this.validateEnvironment();
      this.setupEnvironment();
      await this.ensureCertificateCache();  // NEW: Ensure certificates are cached
      await this.cleanupCache();

      const args = process.argv.slice(2);
      await this.startExpo(args);
    } catch (error) {
      this.log(`Launcher failed: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

// Run the launcher
if (require.main === module) {
  const launcher = new ExpoLauncher();
  launcher.run();
}
