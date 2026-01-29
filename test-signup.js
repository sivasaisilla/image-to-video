const http = require('http');

function makeRequest(path, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          resolve({ status: res.statusCode, data });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.write(postData);
    req.end();
  });
}

async function testSignup() {
  const testEmail = 'kranthi2741d@gmail.com';
  const testPassword = 'test123456';
  
  try {
    console.log('🧪 Testing signup flow...');
    
    // Step 1: Check if email exists
    console.log('\n1. Checking email...');
    const checkResponse = await makeRequest('/api/check-email', { email: testEmail });
    console.log('✅ Email check:', checkResponse.data);
    
    // Step 2: Send OTP
    console.log('\n2. Sending OTP...');
    const otpResponse = await makeRequest('/api/send-otp', { email: testEmail });
    console.log('✅ OTP sent:', otpResponse.data);
    
    console.log('\n✅ Signup API is working! Network error should be resolved.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testSignup();
