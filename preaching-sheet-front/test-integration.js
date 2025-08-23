const { spawn } = require('child_process');
const fetch = require('node-fetch');
const path = require('path');

/**
 * Test script to verify both services integration
 */
async function testIntegration() {
  console.log('Testing services integration...\n');

  // Test backend health
  console.log('1. Testing Backend Service (Java)...');
  try {
    const backendResponse = await fetch('http://localhost:8082/psa/api/status', {
      method: 'GET',
      timeout: 5000
    });
    
    if (backendResponse.ok) {
      console.log('✅ Backend service is running and healthy');
    } else {
      console.log('❌ Backend service responded with status:', backendResponse.status);
    }
  } catch (error) {
    console.log('❌ Backend service is not available:', error.message);
  }

  // Test Python service health
  console.log('\n2. Testing Python Service...');
  try {
    const pythonResponse = await fetch('http://localhost:5001/health', {
      method: 'GET',
      timeout: 5000
    });
    
    if (pythonResponse.ok) {
      console.log('✅ Python service is running and healthy');
    } else {
      console.log('❌ Python service responded with status:', pythonResponse.status);
    }
  } catch (error) {
    console.log('❌ Python service is not available:', error.message);
  }

  console.log('\n3. Integration Test Summary:');
  console.log('- Backend (Java): http://localhost:8082/psa/api/status');
  console.log('- Python Service: http://localhost:5001/health');
  console.log('- Excel to Image: http://localhost:5001/excel-to-image');
  
  console.log('\n✅ Integration test completed!');
}

// Run the test
testIntegration().catch(console.error);
