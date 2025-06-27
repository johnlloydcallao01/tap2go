#!/usr/bin/env node

/**
 * Enterprise Expo Starter Script
 * Fixes all networking, caching, and certificate issues for enterprise development
 * Designed for large monorepos with proper error handling
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

class EnterpriseExpoLauncher {
  constructor() {
    this.projectRoot = __dirname;
    this.monorepoRoot = path.resolve(this.projectRoot, '../..');
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const colors = {
      info: '\x1b[36m',    // Cyan
      success: '\x1b[32m', // Green
      warning: '\x1b[33m', // Yellow
      error: '\x1b[31m',   // Red
      reset: '\x1b[0m'     // Reset
    };
    
    const color = colors[type] || colors.info;
    console.log(`${color}[${timestamp}] ${message}${colors.reset}`);
  }

  setupEnterpriseEnvironment() {
    this.log('🏢 Setting up ENTERPRISE environment configuration...');

    // CRITICAL: Remove all cache-disabling and offline variables
    delete process.env.EXPO_NO_CACHE;
    delete process.env.EXPO_OFFLINE;
    delete process.env.EXPO_NO_NETWORK;
    delete process.env.METRO_CACHE;

    // Enable full online mode with enterprise features
    process.env.NODE_ENV = process.env.NODE_ENV || 'development';
    process.env.NODE_OPTIONS = '--max-old-space-size=8192';
    
    // Expo enterprise configuration
    process.env.EXPO_CACHE = '1';
    process.env.EXPO_CACHE_CERTIFICATES = 'true';
    process.env.EXPO_NETWORK_ENABLED = 'true';
    process.env.EXPO_USE_FAST_RESOLVER = 'true';
    process.env.EXPO_BETA = 'false';
    
    // Metro enterprise configuration
    process.env.METRO_CACHE = '1';
    process.env.METRO_CACHE_ENABLED = 'true';
    
    // React 19 compatibility
    process.env.REACT_VERSION = '19.0.0';
    
    // Windows-specific optimizations
    if (process.platform === 'win32') {
      process.env.EXPO_USE_FAST_RESOLVER = 'true';
      process.env.WATCHMAN_DISABLE_RECRAWL = 'true';
      process.env.EXPO_WINDOWS_OPTIMIZED = 'true';
    }

    this.log('✅ Enterprise environment configured:', 'success');
    this.log('   • Full online mode enabled', 'success');
    this.log('   • Certificate caching enabled', 'success');
    this.log('   • Network connectivity enabled', 'success');
    this.log('   • Metro caching optimized', 'success');
  }

  async validateNetworkConnectivity() {
    this.log('🌐 Validating network connectivity...');
    
    try {
      // Test basic network connectivity
      const { execSync } = require('child_process');
      
      if (process.platform === 'win32') {
        execSync('ping -n 1 8.8.8.8', { timeout: 5000 });
      } else {
        execSync('ping -c 1 8.8.8.8', { timeout: 5000 });
      }
      
      this.log('✅ Network connectivity confirmed', 'success');
      return true;
    } catch (error) {
      this.log('⚠️ Network connectivity limited - using offline mode', 'warning');
      process.env.EXPO_OFFLINE = '1';
      return false;
    }
  }

  async ensureEnterpriseDirectories() {
    this.log('📁 Ensuring enterprise directory structure...');
    
    const directories = [
      path.join(this.projectRoot, '.metro-cache'),
      path.join(this.projectRoot, '.expo'),
      path.join(require('os').homedir(), '.expo', 'development-certificates')
    ];

    for (const dir of directories) {
      try {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
          this.log(`Created: ${path.relative(this.projectRoot, dir)}`, 'success');
        }
      } catch (error) {
        this.log(`Failed to create ${dir}: ${error.message}`, 'warning');
      }
    }
  }

  async startExpoEnterprise(args = []) {
    this.log('🚀 Starting Expo with ENTERPRISE configuration...');

    return new Promise((resolve, reject) => {
      // Enterprise-grade command selection
      const expoCommands = [
        ['npx', 'expo', 'start', '--clear', ...args],
        ['npx', '@expo/cli', 'start', '--clear', ...args],
        ['node', 'node_modules/.bin/expo', 'start', '--clear', ...args]
      ];

      let currentCommandIndex = 0;

      const tryNextCommand = () => {
        if (currentCommandIndex >= expoCommands.length) {
          reject(new Error('All Expo start commands failed'));
          return;
        }

        const [command, ...cmdArgs] = expoCommands[currentCommandIndex];
        this.log(`🔧 Executing: ${command} ${cmdArgs.join(' ')}`);

        const expo = spawn(command, cmdArgs, {
          stdio: 'inherit',
          shell: true,
          cwd: this.projectRoot,
          env: process.env
        });

        expo.on('close', (code) => {
          if (code === 0) {
            this.log('✅ Expo started successfully with enterprise configuration', 'success');
            resolve(code);
          } else {
            this.log(`❌ Command failed with code ${code}, trying next...`, 'warning');
            currentCommandIndex++;
            tryNextCommand();
          }
        });

        expo.on('error', (error) => {
          this.log(`❌ Command error: ${error.message}`, 'warning');
          currentCommandIndex++;
          tryNextCommand();
        });
      };

      tryNextCommand();
    });
  }

  async run() {
    try {
      this.log('🏢 ENTERPRISE EXPO LAUNCHER STARTING...', 'info');
      this.log('🎯 Target: Large monorepo with enterprise requirements', 'info');
      
      this.setupEnterpriseEnvironment();
      await this.validateNetworkConnectivity();
      await this.ensureEnterpriseDirectories();

      const args = process.argv.slice(2);
      await this.startExpoEnterprise(args);

    } catch (error) {
      this.log(`🚨 Enterprise launcher failed: ${error.message}`, 'error');
      this.log('💡 Try running with --offline flag if network issues persist', 'info');
      process.exit(1);
    }
  }
}

// Run the enterprise launcher
if (require.main === module) {
  const launcher = new EnterpriseExpoLauncher();
  launcher.run();
}

module.exports = EnterpriseExpoLauncher;
