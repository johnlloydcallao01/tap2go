#!/usr/bin/env node

/**
 * Professional Metro Cache Manager
 * Handles cache cleanup, validation, and recovery for React Native Metro bundler
 * Prevents cache deserialization errors and ensures optimal performance
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class MetroCacheManager {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.monorepoRoot = path.resolve(this.projectRoot, '../..');
    this.cacheDir = path.join(this.projectRoot, 'node_modules', '.cache');
    this.metroCacheDir = path.join(this.cacheDir, 'metro');
    this.tempDir = path.join(this.projectRoot, '.tmp');
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '🔧',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      debug: '🐛'
    }[type] || 'ℹ️';
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async validateCacheIntegrity() {
    this.log('Validating Metro cache integrity...');
    
    if (!fs.existsSync(this.metroCacheDir)) {
      this.log('Metro cache directory does not exist - this is normal for first run', 'info');
      return true;
    }

    try {
      const cacheFiles = fs.readdirSync(this.metroCacheDir, { recursive: true });
      let corruptedFiles = 0;

      for (const file of cacheFiles) {
        const filePath = path.join(this.metroCacheDir, file);
        
        if (fs.statSync(filePath).isFile()) {
          try {
            // Try to read the file to check for corruption
            fs.readFileSync(filePath);
          } catch (error) {
            this.log(`Corrupted cache file detected: ${file}`, 'warning');
            corruptedFiles++;
          }
        }
      }

      if (corruptedFiles > 0) {
        this.log(`Found ${corruptedFiles} corrupted cache files`, 'warning');
        return false;
      }

      this.log('Cache integrity validation passed', 'success');
      return true;
    } catch (error) {
      this.log(`Cache validation failed: ${error.message}`, 'error');
      return false;
    }
  }

  async cleanCache(type = 'all') {
    this.log(`Starting cache cleanup (type: ${type})...`);

    const cleanupTargets = {
      metro: [this.metroCacheDir],
      node: [path.join(this.projectRoot, 'node_modules', '.cache')],
      temp: [this.tempDir, path.join(this.projectRoot, '.expo')],
      all: [
        this.metroCacheDir,
        path.join(this.projectRoot, 'node_modules', '.cache'),
        this.tempDir,
        path.join(this.projectRoot, '.expo'),
        path.join(this.monorepoRoot, 'node_modules', '.cache')
      ]
    };

    const targets = cleanupTargets[type] || cleanupTargets.all;

    for (const target of targets) {
      if (fs.existsSync(target)) {
        try {
          this.log(`Removing: ${target}`);
          fs.rmSync(target, { recursive: true, force: true });
          this.log(`Successfully removed: ${target}`, 'success');
        } catch (error) {
          this.log(`Failed to remove ${target}: ${error.message}`, 'error');
        }
      } else {
        this.log(`Target not found (already clean): ${target}`, 'info');
      }
    }
  }

  async fixDependencyConflicts() {
    this.log('Fixing React dependency conflicts...');

    try {
      // Remove conflicting React versions from root
      const rootReactPath = path.join(this.monorepoRoot, 'node_modules', 'react');
      const rootReactDomPath = path.join(this.monorepoRoot, 'node_modules', 'react-dom');
      
      if (fs.existsSync(rootReactPath)) {
        this.log('Removing conflicting React from root node_modules');
        fs.rmSync(rootReactPath, { recursive: true, force: true });
      }
      
      if (fs.existsSync(rootReactDomPath)) {
        this.log('Removing conflicting React DOM from root node_modules');
        fs.rmSync(rootReactDomPath, { recursive: true, force: true });
      }

      this.log('Dependency conflicts resolved', 'success');
    } catch (error) {
      this.log(`Failed to fix dependency conflicts: ${error.message}`, 'error');
    }
  }

  async reinstallDependencies() {
    this.log('Reinstalling dependencies with correct versions...');

    try {
      // Change to monorepo root for pnpm workspace commands
      process.chdir(this.monorepoRoot);

      // Install exact versions using pnpm workspace commands
      const commands = [
        'pnpm add react@19.0.0 --save-exact --filter mobile',
        'pnpm add react-dom@19.0.0 --save-exact --filter mobile',
        'pnpm add react-native-reanimated@3.17.4 --save-exact --filter mobile'
      ];

      for (const command of commands) {
        this.log(`Executing: ${command}`);
        execSync(command, { stdio: 'inherit' });
      }

      this.log('Dependencies reinstalled successfully', 'success');
    } catch (error) {
      this.log(`Failed to reinstall dependencies: ${error.message}`, 'error');
      // Don't throw error, just log it as this might not be critical
      this.log('Continuing without dependency reinstall...', 'warning');
    }
  }

  async createCacheDirectories() {
    this.log('Creating cache directories with proper permissions...');

    const directories = [
      this.cacheDir,
      this.metroCacheDir,
      this.tempDir
    ];

    for (const dir of directories) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        this.log(`Created directory: ${dir}`, 'success');
      }
    }
  }

  async run(action = 'full-reset') {
    this.log(`Starting Metro Cache Manager (action: ${action})`);

    try {
      switch (action) {
        case 'validate':
          await this.validateCacheIntegrity();
          break;

        case 'clean':
          await this.cleanCache('all');
          break;

        case 'fix-deps':
          await this.fixDependencyConflicts();
          await this.reinstallDependencies();
          break;

        case 'full-reset':
        default:
          await this.cleanCache('all');
          await this.fixDependencyConflicts();
          await this.createCacheDirectories();
          await this.reinstallDependencies();
          this.log('Full reset completed successfully', 'success');
          break;
      }
    } catch (error) {
      this.log(`Cache manager failed: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

// CLI interface
if (require.main === module) {
  const action = process.argv[2] || 'full-reset';
  const manager = new MetroCacheManager();
  manager.run(action);
}

module.exports = MetroCacheManager;
