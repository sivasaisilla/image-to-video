// Test Projects Endpoint
import fetch from 'node-fetch';

async function testProjectsEndpoint() {
  console.log('🔍 Testing Projects Endpoint');
  console.log('==============================');
  
  try {
    // First, let's create a mock token for testing
    const mockToken = 'mock_firebase_token_1700000000000';
    const userId = 'user_1700000000000';
    
    console.log('📡 Testing endpoint:', 'http://localhost:3003/api/content/user/' + userId);
    console.log('🔑 Using token:', mockToken);
    
    const response = await fetch(`http://localhost:3003/api/content/user/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${mockToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Success! Response data:');
      console.log(JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log('❌ Error response:');
      console.log('Status:', response.status);
      console.log('Text:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testProjectsEndpoint();
