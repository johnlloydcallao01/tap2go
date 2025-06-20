/**
 * Cache Test API Route
 * Tests Redis connection and cache operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { tapGoCache } from '@/cache/server/redis';
import { checkRedisConnection } from '@/cache/config/redis';
import { tapGoMemoryCache } from '@/cache/server/memory';

export async function GET() {
  try {
    console.log('🧪 Testing Tap2Go Cache System...');

    const results = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      tests: {} as Record<string, unknown>,
    };

    // Test 1: Redis Connection Health Check
    console.log('1️⃣ Testing Redis connection...');
    const redisHealthy = await checkRedisConnection();
    results.tests.redisConnection = {
      status: redisHealthy ? 'PASS' : 'FAIL',
      healthy: redisHealthy,
    };

    // Test 2: Basic Redis Operations
    console.log('2️⃣ Testing basic Redis operations...');
    const testKey = `test:${Date.now()}`;
    const testValue = { message: 'Hello from Tap2Go Cache!', timestamp: Date.now() };

    try {
      // Test SET
      const setResult = await tapGoCache.set(testKey, testValue, 60); // 1 minute TTL
      
      // Test GET
      const getValue = await tapGoCache.get(testKey);
      
      // Test DELETE
      const delResult = await tapGoCache.del(testKey);

      results.tests.basicOperations = {
        status: setResult && getValue && delResult ? 'PASS' : 'FAIL',
        set: setResult,
        get: getValue !== null,
        getValue: getValue,
        delete: delResult,
      };
    } catch (error) {
      results.tests.basicOperations = {
        status: 'FAIL',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }

    // Test 3: High-Level Cache Operations
    console.log('3️⃣ Testing high-level cache operations...');
    try {
      const userId = 'test-user-123';
      const restaurantId = 'test-restaurant-456';

      // Test user session caching
      const sessionData = { userId, loginTime: Date.now(), preferences: { theme: 'dark' } };
      const setSession = await tapGoCache.setUserSession(userId, sessionData);
      const getSession = await tapGoCache.getUserSession(userId);

      // Test restaurant caching
      const restaurantData = { id: restaurantId, name: 'Test Restaurant', cuisine: 'Italian' };
      const setRestaurant = await tapGoCache.setRestaurant(restaurantId, restaurantData);
      const getRestaurant = await tapGoCache.getRestaurant(restaurantId);

      results.tests.highLevelOperations = {
        status: setSession && getSession && setRestaurant && getRestaurant ? 'PASS' : 'FAIL',
        userSession: { set: setSession, get: !!getSession },
        restaurant: { set: setRestaurant, get: !!getRestaurant },
      };

      // Cleanup test data
      await tapGoCache.invalidateUser(userId);
      await tapGoCache.invalidateRestaurant(restaurantId);

    } catch (error) {
      results.tests.highLevelOperations = {
        status: 'FAIL',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }

    // Test 4: Memory Cache Fallback
    console.log('4️⃣ Testing memory cache fallback...');
    try {
      const memTestKey = `mem-test:${Date.now()}`;
      const memTestValue = { type: 'memory-cache-test', data: 'fallback-working' };

      const memSet = await tapGoMemoryCache.set(memTestKey, memTestValue, 60);
      const memGet = await tapGoMemoryCache.get(memTestKey);
      const memDel = await tapGoMemoryCache.del(memTestKey);

      results.tests.memoryCache = {
        status: memSet && memGet && memDel ? 'PASS' : 'FAIL',
        set: memSet,
        get: !!memGet,
        delete: memDel,
        stats: tapGoMemoryCache.getStats(),
      };
    } catch (error) {
      results.tests.memoryCache = {
        status: 'FAIL',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }

    // Test 5: Batch Operations
    console.log('5️⃣ Testing batch operations...');
    try {
      const batchData = {
        'batch:key1': { value: 'test1' },
        'batch:key2': { value: 'test2' },
        'batch:key3': { value: 'test3' },
      };

      const msetResult = await tapGoCache.mset(batchData);
      const mgetResult = await tapGoCache.mget(Object.keys(batchData));

      // Cleanup
      await Promise.all(Object.keys(batchData).map(key => tapGoCache.del(key)));

      results.tests.batchOperations = {
        status: msetResult && mgetResult.every(val => val !== null) ? 'PASS' : 'FAIL',
        mset: msetResult,
        mget: mgetResult.length === 3,
        retrievedCount: mgetResult.filter(val => val !== null).length,
      };
    } catch (error) {
      results.tests.batchOperations = {
        status: 'FAIL',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }

    // Test 6: Cache Health Check
    console.log('6️⃣ Testing cache health check...');
    try {
      const healthCheck = await tapGoCache.healthCheck();
      results.tests.healthCheck = {
        status: healthCheck.healthy ? 'PASS' : 'FAIL',
        ...healthCheck,
      };
    } catch (error) {
      results.tests.healthCheck = {
        status: 'FAIL',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }

    // Calculate overall status
    const allTests = Object.values(results.tests);
    const passedTests = allTests.filter(test =>
      typeof test === 'object' && test !== null && 'status' in test && test.status === 'PASS'
    ).length;
    const totalTests = allTests.length;
    
    const overallStatus = passedTests === totalTests ? 'ALL_PASS' : 
                         passedTests > 0 ? 'PARTIAL_PASS' : 'ALL_FAIL';

    console.log(`✅ Cache tests completed: ${passedTests}/${totalTests} passed`);

    return NextResponse.json({
      success: true,
      message: 'Cache system test completed',
      overall: {
        status: overallStatus,
        passed: passedTests,
        total: totalTests,
        percentage: Math.round((passedTests / totalTests) * 100),
      },
      ...results,
    });

  } catch (error) {
    console.error('❌ Cache test failed:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Cache system test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

// Test cache invalidation
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const pattern = url.searchParams.get('pattern');
    const userId = url.searchParams.get('userId');
    const restaurantId = url.searchParams.get('restaurantId');

    if (userId) {
      await tapGoCache.invalidateUser(userId);
      return NextResponse.json({
        success: true,
        message: `Invalidated cache for user: ${userId}`,
      });
    }

    if (restaurantId) {
      await tapGoCache.invalidateRestaurant(restaurantId);
      return NextResponse.json({
        success: true,
        message: `Invalidated cache for restaurant: ${restaurantId}`,
      });
    }

    if (pattern) {
      // Basic pattern invalidation
      await tapGoCache.del(pattern);
      return NextResponse.json({
        success: true,
        message: `Invalidated cache pattern: ${pattern}`,
      });
    }

    return NextResponse.json({
      success: false,
      message: 'No invalidation pattern specified. Use ?userId=X, ?restaurantId=Y, or ?pattern=Z',
    }, { status: 400 });

  } catch (error) {
    console.error('Cache invalidation error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Cache invalidation failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
