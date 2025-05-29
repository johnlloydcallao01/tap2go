#!/usr/bin/env ts-node

/**
 * Database Setup Script for Tap2Go
 *
 * This script initializes the Firestore database with:
 * - Default categories
 * - System configuration
 * - Initial admin user (optional)
 *
 * Usage:
 * npm run setup-db
 *
 * Or with admin user creation:
 * npm run setup-db -- --admin-email admin@tap2go.com --admin-name "Admin User"
 */

import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../src/lib/firebase';
import { initializeDatabase, createInitialAdmin } from '../src/lib/database/init';

async function setupDatabase() {
  try {
    console.log('🚀 Starting Tap2Go database setup...\n');

    // Parse command line arguments
    const args = process.argv.slice(2);
    const adminEmailIndex = args.indexOf('--admin-email');
    const adminNameIndex = args.indexOf('--admin-name');
    const adminPasswordIndex = args.indexOf('--admin-password');

    const adminEmail = adminEmailIndex !== -1 ? args[adminEmailIndex + 1] : null;
    const adminName = adminNameIndex !== -1 ? args[adminNameIndex + 1] : null;
    const adminPassword = adminPasswordIndex !== -1 ? args[adminPasswordIndex + 1] : 'TempPassword123!';

    // Step 1: Initialize database collections
    console.log('📊 Initializing database collections...');
    await initializeDatabase();
    console.log('✅ Database collections initialized successfully\n');

    // Step 2: Create initial admin user (if requested)
    if (adminEmail && adminName) {
      console.log('👤 Creating initial admin user...');
      try {
        const { user } = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
        await createInitialAdmin(user.uid, adminEmail, adminName);
        console.log(`✅ Admin user created successfully: ${adminEmail}`);
        console.log(`🔑 Temporary password: ${adminPassword}`);
        console.log('⚠️  Please change the password after first login\n');
      } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
          console.log('⚠️  Admin email already exists, skipping user creation\n');
        } else {
          console.error('❌ Error creating admin user:', error.message);
        }
      }
    }

    console.log('🎉 Database setup completed successfully!');
    console.log('\n📋 Setup Summary:');
    console.log('- ✅ Categories collection initialized');
    console.log('- ✅ System configuration created');
    if (adminEmail) {
      console.log(`- ✅ Admin user: ${adminEmail}`);
    }

    console.log('\n🔧 Next Steps:');
    console.log('1. Deploy Firestore security rules: firebase deploy --only firestore:rules');
    console.log('2. Start your application: npm run dev');
    console.log('3. Test user registration and login');
    if (adminEmail) {
      console.log(`4. Login as admin with: ${adminEmail}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

// Display usage information
function showUsage() {
  console.log('📖 Usage:');
  console.log('  npm run setup-db');
  console.log('  npm run setup-db -- --admin-email admin@tap2go.com --admin-name "Admin User"');
  console.log('  npm run setup-db -- --admin-email admin@tap2go.com --admin-name "Admin User" --admin-password "SecurePassword123!"');
  console.log('\n📝 Options:');
  console.log('  --admin-email    Email for the initial admin user');
  console.log('  --admin-name     Full name for the initial admin user');
  console.log('  --admin-password Password for the initial admin user (optional, default: TempPassword123!)');
  console.log('\n⚠️  Note: Make sure to update the Firebase configuration in this script before running.');
}

// Check if help is requested
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showUsage();
  process.exit(0);
}

// Run the setup
setupDatabase();
