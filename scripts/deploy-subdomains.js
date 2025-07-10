#!/usr/bin/env node

/**
 * Multi-Subdomain Deployment Script for Tap2Go
 * 
 * This script automates the deployment of all 4 Vercel projects
 * for the multi-subdomain architecture.
 * 
 * Usage:
 *   node scripts/deploy-subdomains.js
 *   npm run deploy:all
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class SubdomainDeployer {
  constructor() {
    this.projects = [
      {
        name: 'tap2go-web',
        panel: 'customer',
        url: 'https://tap2go-web.vercel.app',
        description: 'Customer App'
      },
      {
        name: 'tap2go-vendor',
        panel: 'vendor', 
        url: 'https://tap2go-vendor.vercel.app',
        description: 'Vendor Panel'
      },
      {
        name: 'tap2go-admin',
        panel: 'admin',
        url: 'https://tap2go-admin.vercel.app', 
        description: 'Admin Panel'
      },
      {
        name: 'tap2go-driver',
        panel: 'driver',
        url: 'https://tap2go-driver.vercel.app',
        description: 'Driver Panel'
      }
    ];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '🔵',
      success: '✅', 
      error: '❌',
      warning: '⚠️'
    }[type] || '🔵';
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async deployProject(project) {
    this.log(`Deploying ${project.description} (${project.name})...`);
    
    try {
      // Deploy to Vercel
      const command = `vercel --prod --scope=your-team --project=${project.name}`;
      execSync(command, { 
        stdio: 'inherit',
        cwd: process.cwd()
      });
      
      this.log(`Successfully deployed ${project.description}`, 'success');
      this.log(`Available at: ${project.url}`, 'info');
      
      return true;
    } catch (error) {
      this.log(`Failed to deploy ${project.description}: ${error.message}`, 'error');
      return false;
    }
  }

  async deployAll() {
    this.log('🚀 Starting multi-subdomain deployment for Tap2Go');
    this.log(`Deploying ${this.projects.length} projects...`);
    
    const results = [];
    
    for (const project of this.projects) {
      const success = await this.deployProject(project);
      results.push({ project, success });
      
      // Add delay between deployments to avoid rate limits
      if (project !== this.projects[this.projects.length - 1]) {
        this.log('Waiting 5 seconds before next deployment...', 'info');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
    
    // Summary
    this.log('\n📊 Deployment Summary:', 'info');
    results.forEach(({ project, success }) => {
      const status = success ? '✅ SUCCESS' : '❌ FAILED';
      this.log(`  ${project.description}: ${status}`);
    });
    
    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;
    
    if (successCount === totalCount) {
      this.log(`\n🎉 All ${totalCount} projects deployed successfully!`, 'success');
      this.log('\n🌐 Your subdomains are now live:', 'info');
      this.projects.forEach(project => {
        this.log(`  ${project.description}: ${project.url}`);
      });
    } else {
      this.log(`\n⚠️ ${successCount}/${totalCount} projects deployed successfully`, 'warning');
      this.log('Please check the failed deployments and retry.', 'warning');
    }
  }

  async deploySpecific(panelType) {
    const project = this.projects.find(p => p.panel === panelType);
    
    if (!project) {
      this.log(`Panel type "${panelType}" not found. Available: customer, vendor, admin, driver`, 'error');
      return;
    }
    
    this.log(`🎯 Deploying specific panel: ${project.description}`);
    await this.deployProject(project);
  }
}

// CLI Interface
async function main() {
  const deployer = new SubdomainDeployer();
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // Deploy all projects
    await deployer.deployAll();
  } else if (args[0] === '--panel' && args[1]) {
    // Deploy specific panel
    await deployer.deploySpecific(args[1]);
  } else {
    console.log('Usage:');
    console.log('  node scripts/deploy-subdomains.js                 # Deploy all projects');
    console.log('  node scripts/deploy-subdomains.js --panel vendor  # Deploy specific panel');
    console.log('');
    console.log('Available panels: customer, vendor, admin, driver');
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  });
}

module.exports = { SubdomainDeployer };
