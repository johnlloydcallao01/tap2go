/**
 * Test script for hard delete functionality
 * This script tests the hard delete API endpoint
 */

const testHardDelete = async () => {
  try {
    // Test with a non-existent file ID to verify error handling
    const testId = 99999;
    const userId = 'test-user';
    
    const url = `http://localhost:3000/api/media/files/${testId}?user_id=${userId}&hard_delete=true`;
    
    console.log('🧪 Testing hard delete API endpoint...');
    console.log('URL:', url);
    
    const response = await fetch(url, {
      method: 'DELETE',
    });
    
    const result = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response body:', result);
    
    if (response.status === 500 && result.message.includes('not found')) {
      console.log('✅ Hard delete API endpoint is working correctly (expected error for non-existent file)');
    } else {
      console.log('❌ Unexpected response');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run the test if this script is executed directly
if (typeof window === 'undefined') {
  testHardDelete();
}

module.exports = { testHardDelete };
