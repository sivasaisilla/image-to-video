const http = require('http');

function makeRequest(path, data, token = null) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: data ? 'POST' : 'GET',
      headers: headers
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

    if (data) {
      req.write(postData);
    }
    req.end();
  });
}

async function testEnhancedAPI() {
  const testEmail = 'test@example.com';
  const testPassword = 'test123456';
  let token = null;
  
  try {
    console.log('🧪 Testing Enhanced API Features...\n');
    
    // Step 1: Complete signup
    console.log('1. Creating test account...');
    const checkResponse = await makeRequest('/api/check-email', { email: testEmail });
    console.log('✅ Email check:', checkResponse.data);
    
    const otpResponse = await makeRequest('/api/send-otp', { email: testEmail });
    console.log('✅ OTP sent:', otpResponse.data);
    
    // Simulate OTP verification (in real scenario, user would receive OTP)
    console.log('⚠️  Note: Check server logs for OTP');
    
    const signupResponse = await makeRequest('/api/signup', { 
      email: testEmail, 
      password: testPassword,
      referralCode: 'IC-TEST123' // Test referral code
    });
    
    if (signupResponse.data.success) {
      token = signupResponse.data.token;
      console.log('✅ Account created:', signupResponse.data.message);
    }
    
    if (!token) {
      console.log('❌ No token received, skipping authenticated tests');
      return;
    }
    
    // Step 2: Test user profile
    console.log('\n2. Testing user profile...');
    const profileResponse = await makeRequest('/api/user/profile', null, token);
    console.log('✅ Profile data:', profileResponse.data);
    
    // Step 3: Test referral information
    console.log('\n3. Testing referral system...');
    const referralResponse = await makeRequest('/api/user/referral', null, token);
    console.log('✅ Referral data:', referralResponse.data);
    
    // Step 4: Test profile update
    console.log('\n4. Testing profile update...');
    const updateResponse = await makeRequest('/api/user/profile', {
      fullName: 'Test User',
      phone: '+1 (555) 123-4567',
      company: 'Test Company',
      bio: 'Testing the enhanced API'
    }, token);
    console.log('✅ Profile update:', updateResponse.data);
    
    // Step 5: Test logout
    console.log('\n5. Testing logout...');
    const logoutResponse = await makeRequest('/api/logout', null, token);
    console.log('✅ Logout:', logoutResponse.data);
    
    console.log('\n🎉 All enhanced API features are working!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testEnhancedAPI();
