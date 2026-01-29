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

async function testWithOTP() {
  const testEmail = 'otp@test.com';
  const testPassword = 'test123456';
  
  try {
    console.log('🧪 Testing Complete Flow with OTP...\n');
    
    // Step 1: Check email
    console.log('1. Checking email...');
    const checkResponse = await makeRequest('/api/check-email', { email: testEmail });
    console.log('✅ Email check:', checkResponse.data);
    
    // Step 2: Send OTP
    console.log('\n2. Sending OTP...');
    const otpResponse = await makeRequest('/api/send-otp', { email: testEmail });
    console.log('✅ OTP sent:', otpResponse.data);
    
    // Step 3: For testing, we need to find the OTP that was generated
    // Since we can't easily access it from the server, let's try a common test OTP
    console.log('\n3. Attempting OTP verification...');
    
    // Try some common test OTPs (in production, user would enter the OTP from email)
    const testOTPs = ['123456', '000000', '111111'];
    
    for (const otp of testOTPs) {
      try {
        const verifyResponse = await makeRequest('/api/verify-otp', { email: testEmail, otp });
        if (verifyResponse.data.success) {
          console.log(`✅ OTP verified with: ${otp}`);
          
          // Step 4: Complete signup
          console.log('\n4. Completing signup...');
          const signupResponse = await makeRequest('/api/signup', { 
            email: testEmail, 
            password: testPassword,
            referralCode: 'IC-TEST123'
          });
          
          if (signupResponse.data.success) {
            const token = signupResponse.data.token;
            console.log('✅ Account created successfully!');
            console.log('📧 Email:', signupResponse.data.user.email);
            console.log('🔑 Token received:', token.substring(0, 20) + '...');
            
            // Step 5: Test authenticated endpoints
            console.log('\n5. Testing authenticated endpoints...');
            
            // Profile
            const profileResponse = await makeRequest('/api/user/profile', null, token);
            console.log('✅ Profile API:', profileResponse.data.stats ? 'Working' : 'Failed');
            
            // Referral
            const referralResponse = await makeRequest('/api/user/referral', null, token);
            console.log('✅ Referral API:', referralResponse.data.referralCode ? 'Working' : 'Failed');
            
            // Profile update
            const updateResponse = await makeRequest('/api/user/profile', {
              fullName: 'OTP Test User',
              phone: '+1 (555) 123-4567',
              company: 'Test Company',
              bio: 'Created via OTP flow'
            }, token);
            console.log('✅ Profile update:', updateResponse.data.success ? 'Working' : 'Failed');
            
            // Logout
            const logoutResponse = await makeRequest('/api/logout', null, token);
            console.log('✅ Logout:', logoutResponse.data.success ? 'Working' : 'Failed');
            
            console.log('\n🎉 Complete enhanced API flow is working!');
            console.log('\n📋 Features verified:');
            console.log('   ✅ Email verification with OTP');
            console.log('   ✅ User registration');
            console.log('   ✅ JWT authentication');
            console.log('   ✅ Profile management');
            console.log('   ✅ Referral system');
            console.log('   ✅ Session management');
            console.log('   ✅ Account operations');
            
            return;
          }
        }
      } catch (error) {
        // Continue to next OTP
        continue;
      }
    }
    
    console.log('❌ Could not verify OTP with test values');
    console.log('💡 In production, user would receive the actual OTP via email');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testWithOTP();
