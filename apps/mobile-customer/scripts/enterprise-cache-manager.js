#!/usr/bin/env node

/**
 * Enterprise Cache Manager for Tap2Go Mobile App
 * Handles intelligent cache management for large monorepo development
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class EnterpriseCacheManager {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.monorepoRoot = path.resolve(this.projectRoot, '../..');
    this.homeDir = require('os').homedir();
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      reset: '\x1b[0m'
    };
    
    const color = colors[type] || colors.info;
    console.log(`${color}[${timestamp}] ${message}${colors.reset}`);
  }

  getCacheDirectories() {
    return {
      // Metro caches
      metroCache: path.join(this.projectRoot, '.metro-cache'),
      metroHealthCheck: path.join(this.projectRoot, '.metro-health-check'),
      
      // Expo caches
      expoLocal: path.join(this.projectRoot, '.expo'),
      expoGlobal: path.join(this.homeDir, '.expo'),
      expoCertificates: path.join(this.homeDir, '.expo', 'development-certificates'),
      
      // Node.js caches
      nodeModulesCache: path.join(this.projectRoot, 'node_modules', '.cache'),
      
      // Temporary directories
      tmpDir: path.join(this.projectRoot, '.tmp'),
      
      // Build artifacts
      buildDir: path.join(this.projectRoot, 'dist'),
      webBuildDir: path.join(this.projectRoot, 'web-build'),
    };
  }

  async validateCacheHealth() {
    this.log('🔍 Validating enterprise cache health...');
    
    const caches = this.getCacheDirectories();
    const healthReport = {
      healthy: [],
      corrupted: [],
      missing: [],
      totalSize: 0
    };

    for (const [name, cachePath] of Object.entries(caches)) {
      try {
        if (fs.existsSync(cachePath)) {
          const stats = fs.statSync(cachePath);
          const size = this.getDirectorySize(cachePath);
          
          if (stats.isDirectory() && size > 0) {
            healthReport.healthy.push({ name, path: cachePath, size });
            healthReport.totalSize += size;
          } else {
            healthReport.corrupted.push({ name, path: cachePath });
          }
        } else {
          healthReport.missing.push({ name, path: cachePath });
        }
      } catch (error) {
        healthReport.corrupted.push({ name, path: cachePath, error: error.message });
      }
    }

    this.log(`✅ Healthy caches: ${healthReport.healthy.length}`, 'success');
    this.log(`⚠️ Corrupted caches: ${healthReport.corrupted.length}`, 'warning');
    this.log(`📁 Missing caches: ${healthReport.missing.length}`, 'info');
    this.log(`💾 Total cache size: ${this.formatBytes(healthReport.totalSize)}`, 'info');

    return healthReport;
  }

  getDirectorySize(dirPath) {
    try {
      let totalSize = 0;
      const files = fs.readdirSync(dirPath);
      
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isDirectory()) {
          totalSize += this.getDirectorySize(filePath);
        } else {
          totalSize += stats.size;
        }
      }
      
      return totalSize;
    } catch (error) {
      return 0;
    }
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async cleanSelectiveCache() {
    this.log('🧹 Performing selective cache cleanup...');
    
    const caches = this.getCacheDirectories();
    const cleanTargets = [
      'expoLocal',      // Local .expo directory
      'metroHealthCheck', // Metro health check files
      'tmpDir'          // Temporary files
    ];

    let cleanedCount = 0;
    let preservedCount = 0;

    for (const [name, cachePath] of Object.entries(caches)) {
      if (cleanTargets.includes(name)) {
        if (fs.existsSync(cachePath)) {
          try {
            fs.rmSync(cachePath, { recursive: true, force: true });
            this.log(`🗑️ Cleaned: ${name}`, 'success');
            cleanedCount++;
          } catch (error) {
            this.log(`❌ Failed to clean ${name}: ${error.message}`, 'error');
          }
        }
      } else {
        if (fs.existsSync(cachePath)) {
          this.log(`💾 Preserved: ${name}`, 'info');
          preservedCount++;
        }
      }
    }

    this.log(`✅ Cleaned ${cleanedCount} caches, preserved ${preservedCount} for performance`, 'success');
  }

  async optimizeMetroCache() {
    this.log('⚡ Optimizing Metro cache for enterprise development...');
    
    const metroCache = this.getCacheDirectories().metroCache;
    
    try {
      // Ensure Metro cache directory exists with proper structure
      if (!fs.existsSync(metroCache)) {
        fs.mkdirSync(metroCache, { recursive: true });
        this.log('📁 Created Metro cache directory', 'success');
      }

      // Create cache subdirectories for better organization
      const cacheSubdirs = ['transformCache', 'dependencyCache', 'assetCache'];
      for (const subdir of cacheSubdirs) {
        const subdirPath = path.join(metroCache, subdir);
        if (!fs.existsSync(subdirPath)) {
          fs.mkdirSync(subdirPath, { recursive: true });
        }
      }

      this.log('✅ Metro cache optimized for enterprise use', 'success');
    } catch (error) {
      this.log(`❌ Metro cache optimization failed: ${error.message}`, 'error');
    }
  }

  async ensureCertificateCache() {
    this.log('🔐 Ensuring development certificate cache...');
    
    const certCache = this.getCacheDirectories().expoCertificates;
    
    try {
      if (!fs.existsSync(certCache)) {
        fs.mkdirSync(certCache, { recursive: true });
        this.log('📁 Created certificate cache directory', 'success');
      }

      // Check for existing certificates
      const certFiles = fs.readdirSync(certCache).filter(f => 
        f.endsWith('.pem') || f.endsWith('.key') || f.endsWith('.crt')
      );

      if (certFiles.length > 0) {
        this.log(`✅ Found ${certFiles.length} cached certificates`, 'success');
      } else {
        this.log('📝 No cached certificates - will be generated on first run', 'info');
      }

    } catch (error) {
      this.log(`❌ Certificate cache setup failed: ${error.message}`, 'error');
    }
  }

  async run(command = 'validate') {
    this.log('🏢 Enterprise Cache Manager Starting...', 'info');
    
    try {
      switch (command) {
        case 'validate':
          await this.validateCacheHealth();
          break;
          
        case 'clean':
          await this.cleanSelectiveCache();
          break;
          
        case 'optimize':
          await this.optimizeMetroCache();
          await this.ensureCertificateCache();
          break;
          
        case 'full-reset':
          this.log('🚨 Performing FULL cache reset...', 'warning');
          await this.cleanSelectiveCache();
          await this.optimizeMetroCache();
          await this.ensureCertificateCache();
          break;
          
        default:
          this.log(`❌ Unknown command: ${command}`, 'error');
          this.log('Available commands: validate, clean, optimize, full-reset', 'info');
          process.exit(1);
      }
      
      this.log('✅ Enterprise cache management completed', 'success');
      
    } catch (error) {
      this.log(`🚨 Cache management failed: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

// Run the cache manager
if (require.main === module) {
  const command = process.argv[2] || 'validate';
  const manager = new EnterpriseCacheManager();
  manager.run(command);
}

module.exports = EnterpriseCacheManager;
