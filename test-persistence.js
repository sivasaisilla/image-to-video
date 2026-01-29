// Test script to verify user persistence
import fs from 'fs';
import path from 'path';

const USERS_FILE = path.join(process.cwd(), 'users.json');

console.log('🔍 Testing User Persistence System');
console.log('==================================');

// Check if users file exists
if (fs.existsSync(USERS_FILE)) {
  console.log('✅ users.json file exists');
  
  try {
    const usersData = fs.readFileSync(USERS_FILE, 'utf8');
    const users = JSON.parse(usersData);
    console.log(`📊 Found ${Object.keys(users).length} users in file`);
    
    Object.entries(users).forEach(([userId, userData]) => {
      console.log(`👤 User: ${userData.email} (${userData.fullName})`);
    });
  } catch (error) {
    console.error('❌ Error reading users file:', error);
  }
} else {
  console.log('❌ users.json file does not exist');
  console.log('💡 This means no users have been signed up yet with the new system');
}

console.log('\n🚀 To test persistence:');
console.log('1. Sign up a new user');
console.log('2. Check if users.json is created');
console.log('3. Restart the server');
console.log('4. Try to login with the same user');
console.log('5. User should still be found!');
