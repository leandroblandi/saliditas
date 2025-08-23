const fetch = require('node-fetch');
const fs = require('fs');
const FormData = require('form-data');
const { execSync } = require('child_process');

/**
 * Test script to verify Image Generator API service functionality
 */
async function testImageGeneratorService() {
  console.log('Testing Image Generator API service...\n');

  // Check if process is running
  console.log('1. Checking if service process is running...');
  try {
    if (process.platform === 'win32') {
      const output = execSync('tasklist /FI "IMAGENAME eq excel-image-generator-api.exe" 2>NUL', { encoding: 'utf8' });
      if (output.includes('excel-image-generator-api.exe')) {
        console.log('✅ Service process is running');
      } else {
        console.log('❌ Service process is not running');
        return;
      }
    } else {
      const output = execSync('ps aux | grep excel-image-generator-api | grep -v grep', { encoding: 'utf8' });
      if (output.trim()) {
        console.log('✅ Service process is running');
      } else {
        console.log('❌ Service process is not running');
        return;
      }
    }
  } catch (error) {
    console.log('❌ Error checking process:', error.message);
    return;
  }

  // Test health endpoint
  console.log('\n2. Testing health endpoint...');
  try {
    const healthResponse = await fetch('http://localhost:5001/health', {
      method: 'GET',
      timeout: 10000
    });
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Health check passed:', healthData);
    } else {
      console.log(`❌ Health check failed with status: ${healthResponse.status}`);
      console.log('Response text:', await healthResponse.text());
      return;
    }
  } catch (error) {
    console.log('❌ Health check error:', error.message);
    console.log('This might mean:');
    console.log('- The service is not listening on port 5001');
    console.log('- The service is not responding to HTTP requests');
    console.log('- The /health endpoint does not exist');
    return;
  }

  // Test list-sheets endpoint
  console.log('\n3. Testing list-sheets endpoint...');
  try {
    const listResponse = await fetch('http://localhost:5001/list-sheets', {
      method: 'GET',
      timeout: 10000
    });
    
    if (listResponse.ok) {
      console.log('✅ List-sheets endpoint available');
    } else {
      console.log(`❌ List-sheets endpoint failed with status: ${listResponse.status}`);
    }
  } catch (error) {
    console.log('❌ List-sheets test error:', error.message);
  }

  console.log('\n4. Service Status:');
  console.log('- Health endpoint: http://localhost:5001/health');
  console.log('- List sheets: http://localhost:5001/list-sheets');
  console.log('- Excel to image: http://localhost:5001/excel-to-image');
  
  console.log('\n✅ Image Generator API service test completed!');
}

// Run the test
testImageGeneratorService().catch(console.error);
