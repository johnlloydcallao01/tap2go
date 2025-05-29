/**
 * Test script for drivers database setup
 *
 * This script can be used to test the drivers database functionality
 * and set up sample data programmatically.
 */

import { initializeDrivers } from './init';
import {
  getDriver,
  getPendingDrivers,
  getActiveDrivers,
  getAvailableDrivers,
  getDriverStats
} from './drivers';

// Test function to run driver setup and verify data
export const testDriversSetup = async () => {
  try {
    console.log('🧪 Testing drivers database setup...');

    // Step 1: Initialize drivers data
    console.log('📊 Setting up drivers data...');
    await initializeDrivers();

    // Step 2: Test data retrieval
    console.log('🔍 Testing data retrieval...');

    // Get a specific driver
    const driver1 = await getDriver('driver_001');
    console.log('✅ Retrieved driver_001:', driver1?.firstName, driver1?.lastName);

    // Get pending drivers
    const pendingDrivers = await getPendingDrivers();
    console.log('✅ Pending drivers count:', pendingDrivers.length);

    // Get active drivers
    const activeDrivers = await getActiveDrivers();
    console.log('✅ Active drivers count:', activeDrivers.length);

    // Get available drivers
    const availableDrivers = await getAvailableDrivers();
    console.log('✅ Available drivers count:', availableDrivers.length);

    // Get driver stats
    const stats = await getDriverStats('driver_001');
    console.log('✅ Driver stats:', stats);

    console.log('🎉 Drivers database test completed successfully!');

    return {
      success: true,
      data: {
        totalDrivers: activeDrivers.length + pendingDrivers.length,
        activeDrivers: activeDrivers.length,
        pendingDrivers: pendingDrivers.length,
        availableDrivers: availableDrivers.length,
        sampleDriver: driver1,
        sampleStats: stats
      }
    };

  } catch (error) {
    console.error('❌ Error in drivers database test:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Function to display driver data summary
export const displayDriversSummary = async () => {
  try {
    console.log('\n📋 DRIVERS DATABASE SUMMARY');
    console.log('================================');

    const activeDrivers = await getActiveDrivers();
    const pendingDrivers = await getPendingDrivers();
    const availableDrivers = await getAvailableDrivers();

    console.log(`Total Active Drivers: ${activeDrivers.length}`);
    console.log(`Pending Approval: ${pendingDrivers.length}`);
    console.log(`Currently Available: ${availableDrivers.length}`);

    console.log('\n👥 ACTIVE DRIVERS:');
    activeDrivers.forEach((driver, index) => {
      console.log(`${index + 1}. ${driver.firstName} ${driver.lastName}`);
      console.log(`   Vehicle: ${driver.vehicleType} (${driver.vehicleDetails.color})`);
      console.log(`   Rating: ${driver.avgRating || 'N/A'} ⭐`);
      console.log(`   Deliveries: ${driver.totalDeliveries}`);
      console.log(`   Status: ${driver.isOnline ? '🟢 Online' : '🔴 Offline'} | ${driver.isAvailable ? '✅ Available' : '❌ Busy'}`);
      console.log('');
    });

    if (pendingDrivers.length > 0) {
      console.log('⏳ PENDING APPROVAL:');
      pendingDrivers.forEach((driver, index) => {
        console.log(`${index + 1}. ${driver.firstName} ${driver.lastName}`);
        console.log(`   Vehicle: ${driver.vehicleType}`);
        console.log(`   Verification: ${driver.verificationStatus}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('Error displaying drivers summary:', error);
  }
};

// Quick setup function for development
export const quickSetupDrivers = async () => {
  console.log('🚀 Quick setup for drivers database...');

  try {
    const result = await testDriversSetup();

    if (result.success) {
      await displayDriversSummary();
      console.log('\n✅ Quick setup completed successfully!');
      console.log('💡 You can now use the drivers database in your application.');
    } else {
      console.log('\n❌ Quick setup failed:', result.error);
    }

    return result;
  } catch (error) {
    console.error('Error in quick setup:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
};

// Export for use in other files
export { initializeDrivers } from './init';
