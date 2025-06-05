/**
 * Database Test API Route - Hybrid Database Testing
 * Tests both Prisma ORM and Direct SQL connections
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database/hybrid-client';

export async function GET(request: NextRequest) {
  try {
    const testResults = {
      prisma: { status: 'unknown', data: null, error: null },
      directSQL: { status: 'unknown', data: null, error: null },
      performance: { prismaTime: 0, sqlTime: 0 }
    };

    // Test Prisma ORM connection
    try {
      const prismaStart = Date.now();
      const prismaResult = await db.orm.$queryRaw`SELECT NOW() as current_time, version() as db_version`;
      const prismaEnd = Date.now();
      
      testResults.prisma.status = 'success';
      testResults.prisma.data = prismaResult;
      testResults.performance.prismaTime = prismaEnd - prismaStart;
    } catch (error) {
      testResults.prisma.status = 'error';
      testResults.prisma.error = error instanceof Error ? error.message : 'Unknown error';
    }

    // Test Direct SQL connection
    try {
      const sqlStart = Date.now();
      const sqlResult = await db.sql('SELECT NOW() as current_time, version() as db_version');
      const sqlEnd = Date.now();
      
      testResults.directSQL.status = 'success';
      testResults.directSQL.data = sqlResult[0];
      testResults.performance.sqlTime = sqlEnd - sqlStart;
    } catch (error) {
      testResults.directSQL.status = 'error';
      testResults.directSQL.error = error instanceof Error ? error.message : 'Unknown error';
    }

    // Overall status
    const overallSuccess = testResults.prisma.status === 'success' && testResults.directSQL.status === 'success';

    return NextResponse.json({
      success: overallSuccess,
      message: overallSuccess ? 'Hybrid database connection successful' : 'Some database connections failed',
      data: {
        connectionTests: testResults,
        performance: {
          prismaLatency: `${testResults.performance.prismaTime}ms`,
          sqlLatency: `${testResults.performance.sqlTime}ms`,
          difference: `${Math.abs(testResults.performance.prismaTime - testResults.performance.sqlTime)}ms`,
          faster: testResults.performance.prismaTime < testResults.performance.sqlTime ? 'Prisma' : 'Direct SQL'
        },
        timestamp: new Date().toISOString()
      }
    }, { status: overallSuccess ? 200 : 500 });

  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database test failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    switch (action) {
      case 'migrate':
        // Run Prisma migrations
        const { execSync } = require('child_process');
        try {
          execSync('npx prisma migrate deploy', { stdio: 'inherit' });
          return NextResponse.json({
            success: true,
            message: 'Database migrations completed successfully'
          });
        } catch (error) {
          return NextResponse.json(
            { success: false, error: 'Migration failed', details: error.message },
            { status: 500 }
          );
        }

      case 'generate':
        // Generate Prisma client
        try {
          execSync('npx prisma generate', { stdio: 'inherit' });
          return NextResponse.json({
            success: true,
            message: 'Prisma client generated successfully'
          });
        } catch (error) {
          return NextResponse.json(
            { success: false, error: 'Client generation failed', details: error.message },
            { status: 500 }
          );
        }

      case 'seed':
        // Seed database with sample data
        try {
          const seedResult = await seedDatabase();
          return NextResponse.json({
            success: true,
            message: 'Database seeded successfully',
            data: seedResult
          });
        } catch (error) {
          return NextResponse.json(
            { success: false, error: 'Seeding failed', details: error.message },
            { status: 500 }
          );
        }

      case 'reset':
        // Reset database (development only)
        if (process.env.NODE_ENV !== 'development') {
          return NextResponse.json(
            { success: false, error: 'Database reset only allowed in development' },
            { status: 403 }
          );
        }
        
        try {
          execSync('npx prisma migrate reset --force', { stdio: 'inherit' });
          return NextResponse.json({
            success: true,
            message: 'Database reset successfully'
          });
        } catch (error) {
          return NextResponse.json(
            { success: false, error: 'Reset failed', details: error.message },
            { status: 500 }
          );
        }

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Database action error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database action failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper function to seed database
async function seedDatabase() {
  const seedData = {
    users: 0,
    restaurants: 0,
    menuItems: 0
  };

  // Create sample admin user
  const adminUser = await db.orm.user.upsert({
    where: { email: 'admin@tap2go.com' },
    update: {},
    create: {
      email: 'admin@tap2go.com',
      role: 'ADMIN',
      isActive: true,
      isVerified: true
    }
  });
  seedData.users++;

  // Create sample customer
  const customer = await db.orm.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      role: 'CUSTOMER',
      isActive: true,
      isVerified: true,
      customerProfile: {
        create: {
          firstName: 'John',
          lastName: 'Doe'
        }
      }
    }
  });
  seedData.users++;

  // Create sample vendor with restaurant
  const vendor = await db.orm.user.upsert({
    where: { email: 'vendor@example.com' },
    update: {},
    create: {
      email: 'vendor@example.com',
      role: 'VENDOR',
      isActive: true,
      isVerified: true,
      vendorProfile: {
        create: {
          businessName: 'Sample Restaurant Business',
          businessType: 'Restaurant',
          contactPersonName: 'Jane Smith',
          businessPhone: '+639123456789',
          businessEmail: 'vendor@example.com',
          businessAddress: {
            street: '123 Sample Street',
            city: 'Manila',
            state: 'Metro Manila',
            country: 'Philippines'
          },
          operatingHours: {
            monday: { open: '09:00', close: '21:00', isClosed: false },
            tuesday: { open: '09:00', close: '21:00', isClosed: false },
            wednesday: { open: '09:00', close: '21:00', isClosed: false },
            thursday: { open: '09:00', close: '21:00', isClosed: false },
            friday: { open: '09:00', close: '21:00', isClosed: false },
            saturday: { open: '09:00', close: '21:00', isClosed: false },
            sunday: { open: '09:00', close: '21:00', isClosed: false }
          },
          deliverySettings: {
            deliveryRadius: 5.0,
            minimumOrderValue: 200,
            deliveryFee: 50,
            estimatedDeliveryTime: '30-45 min'
          },
          isApproved: true,
          approvedAt: new Date()
        }
      }
    },
    include: {
      vendorProfile: true
    }
  });
  seedData.users++;

  if (vendor.vendorProfile) {
    // Create sample restaurant
    const restaurant = await db.orm.restaurant.upsert({
      where: { slug: 'sample-restaurant' },
      update: {},
      create: {
        vendorId: vendor.vendorProfile.id,
        name: 'Sample Restaurant',
        slug: 'sample-restaurant',
        description: 'A sample restaurant for testing the Tap2Go platform',
        cuisineType: ['Filipino', 'Asian'],
        address: {
          street: '123 Sample Street',
          city: 'Manila',
          state: 'Metro Manila',
          zipCode: '1000',
          country: 'Philippines'
        },
        coordinates: {
          latitude: 14.5995,
          longitude: 120.9842
        },
        operatingHours: {
          monday: { open: '09:00', close: '21:00', isClosed: false },
          tuesday: { open: '09:00', close: '21:00', isClosed: false },
          wednesday: { open: '09:00', close: '21:00', isClosed: false },
          thursday: { open: '09:00', close: '21:00', isClosed: false },
          friday: { open: '09:00', close: '21:00', isClosed: false },
          saturday: { open: '09:00', close: '21:00', isClosed: false },
          sunday: { open: '09:00', close: '21:00', isClosed: false }
        },
        isActive: true,
        isVerified: true,
        rating: 4.5
      }
    });
    seedData.restaurants++;

    // Create sample menu category and items
    const category = await db.orm.menuCategory.upsert({
      where: { id: 'sample-category' },
      update: {},
      create: {
        id: 'sample-category',
        restaurantId: restaurant.id,
        name: 'Main Dishes',
        description: 'Our signature main dishes',
        sortOrder: 1
      }
    });

    // Create sample menu items
    const menuItems = [
      {
        name: 'Adobo Rice Bowl',
        description: 'Classic Filipino adobo served with steamed rice',
        price: 250,
        categoryId: category.id,
        restaurantId: restaurant.id,
        isVegetarian: false,
        isAvailable: true
      },
      {
        name: 'Vegetable Lumpia',
        description: 'Fresh spring rolls with mixed vegetables',
        price: 180,
        categoryId: category.id,
        restaurantId: restaurant.id,
        isVegetarian: true,
        isAvailable: true
      }
    ];

    for (const item of menuItems) {
      await db.orm.menuItem.upsert({
        where: { 
          restaurantId_name: {
            restaurantId: item.restaurantId,
            name: item.name
          }
        },
        update: {},
        create: item
      });
      seedData.menuItems++;
    }
  }

  return seedData;
}
